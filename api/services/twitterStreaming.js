var socketio = require('socket.io');
var Twitter = require('twitter');
var _ = require('lodash');

const status_link = 'https://twitter.com/statuses/';
const user_link = 'https://twitter.com/';

var t = {
  twitter: null,
  auth_feed_id: null,
  access_token_key: '',
  access_token_secret: '',
  twitter_consumer_key: sails.config.auth.twitter_consumer_key,
  twitter_consumer_secret: sails.config.auth.twitter_consumer_secret,
  // array to keep user ids
  follow: [],
  // array to keep keywords to track
  track: [],
  // key:object pairs to set correct feed for message
  twitter_hashtag: {},
  // key:object pairs to set correct feed for message
  twitter_user: {},
  stream: null,
  reload: true,

  init: function () {
    Feed.find({
      where: {
        type: ['twitter_user', 'twitter_hashtag']
      }
    }).populate('stream').exec((err, feeds) => {
      if (err) {
        return sails.log.verbose('Twitter Streaming error', err);
      }
      if (t.setTokensFromFeeds(feeds) == null) {
        return;
      };
      t.setTrackStrings(feeds);
      t.initStream();
    });
  },

  /**
   * run after new authentication
   */
  reconnect: function (access_token_key, access_token_secret) {
    t.access_token_key = access_token_key;
    t.access_token_secret = access_token_secret;
    return Feed.find({
      where: {
        type: ['twitter_user', 'twitter_hashtag']
      }
    }).populate('stream').then(function (feeds) {
      t.setTrackStrings(feeds);
      t.initStream();
    }).catch(function (err) {
      sails.log.verbose('Twitter Streaming error', err);
    });
  },

  initStream: function () {
    if (t.stream !== null) {
      t.stream.destroy();
      t.stream = null;
      return;
    };
    if (t.twitter == null) {
      t.twitter = new Twitter({consumer_key: t.twitter_consumer_key, consumer_secret: t.twitter_consumer_secret, access_token_key: t.access_token_key, access_token_secret: t.access_token_secret});
    };

    let createStream = function () {
      t.twitter.stream('statuses/filter', {
        track: t.track.join(','),
        follow: t.follow.join(',')
      }, function (stream) {
        sails.log.info('Stream created');
        t.stream = stream;
        stream.on('data', t.processData);
        stream.on('end', function (response) {
          sails.log.info('Stream ended');
          t.reload = true;
          setTimeout(function () {
            t.stream = null;
            t.init();
          }, 5000);
        });
        stream.on('error', function (err) {
          sails.log.error(err);
          if (err.code == 'ECONNRESET') {
            t.reload = false;
            setTimeout(function () {
              t.stream = null;
              t.init();
            }, 5000);
          }
        });
        stream.on('destroy', function (res) {
          sails.log.info('Stream destroyed');
          setTimeout(function () {
            t.reload = true;
            t.stream = null;
            t.init();
          }, 10000);
        });
      });
    };

    if (!t.reload) {
      return createStream();
    }

    let q = t.buildQuery();

    Message.findOne({
      where: {
        or: [
          {
            feedType: 'twitter_user'
          }, {
            feedType: 'twitter_hashtag'
          }
        ]
      },
      sort: 'uuid DESC'
    }).exec((err, message) => {
      if (err) {
        sails.log.error('Error findig uuid', err);
      } else {
        let payload = {};
        if (message !== undefined) {
          payload.since_id = message.uuid;
        }
        for (let i in q) {
          payload.q = q[i];
          sails.log.silly('payload: ', payload);
          t.twitter.get('search/tweets', payload, (err, data) => {
            t.processGetData(data);
            createStream();
          });
        }
      }
    });
  },

  restart: function() {
    t.reload = true;
    t.init();
  },

  buildQuery: function () {
    let q = [];
    let users = [];
    for (let j in t.twitter_user) {
      users.push('@' + j);
    }
    let m = _.union(t.track, users);
    q = _.chunk(m, 10);
    for (let i in q) {
      q[i] = _.join(q[i], ' OR ');
    }
    return q;
  },

  processGetData: function (data) {
    if (typeof data == 'undefined') {
      return;
    }
    for (let i in data.statuses) {
      t.processData(data.statuses[i]);
    }
  },

  processData: function (data) {
    sails.log.verbose('Stream data', data);
    // delete message if tweet is deleted
    if (data.delete !== undefined) {
      return Message.destroy({
        where: {
          uuid: {
            endsWith: data.delete.status.id
          }
        }
      }).then(function (message) {
        sails.log.verbose('Message destroyed', message);
      }).catch(function (err) {
        sails.log.error('Destroying message failed', err);
      });
    };
    let status = data;

    let feed = null;
    // if tweet is retweet
    if (typeof data.retweeted_status !== 'undefined') {
      status = data.retweeted_status;
      // if we follow retweeted user
      if (typeof t.twitter_user[status.user.screen_name] !== 'undefined') {
        feed = t.twitter_user[status.user.screen_name];
        // we don't follow retweeted user
      } else {
        let hashtag_feed = t.findHashtag(status.entities.hashtags, t.twitter_hashtag);
        // hashtag in retweeted status tracked
        if (hashtag_feed !== null) {
          feed = hashtag_feed;
          // we don't track retweeted hashtags
        } else {
          status = data;
          feed = t.findHashtag(status.entities.hashtags, t.twitter_hashtag);
        }
      }
      // if tweet doesn't have retweet
    } else {
      if (typeof t.twitter_user[status.user.screen_name] !== 'undefined') {
        feed = t.twitter_user[status.user.screen_name];
      } else {
        feed = t.findHashtag(status.entities.hashtags, t.twitter_hashtag);
      }
    }

    if (feed == null) {
      sails.log.warn('Status does not match any feed', status_link + status.id_str);
      return;
    };

    let uuid = feed.stream + '_' + status.id;

    let message = {
      stream: feed.stream,
      feedType: feed.type,
      feed: feed.id,
      message: status.text,
      uuid: uuid,
      created: status.created_at,
      link: status_link + status.id_str,
      author: {},
      metadata: {}
    };
    let user = status.user;
    message.author = {
      name: user.name,
      handle: user.screen_name,
      id: user.id,
      url: user_link + user.screen_name,
      picture: user.profile_image_url_https
    };
    message.metadata = {
      likes: status.favorite_count,
      shares: status.retweet_count,
      entities: status.entities
    };

    if (status.entities.media) {
      message.metadata.media = status.entities.media;
      if (status.extended_entities) {
        message.metadata.media_ext = status.extended_entities.media;
      }
    }

    return Message.findOne({
      where: {
        uuid: uuid,
        feedType: feed.type
      }
    }).then(function (foundMessage) {
      if (foundMessage == undefined) {
        return Message.create(message).then(function (createdMessage) {
          sails.log.verbose('Message created id:', createdMessage.id);
          sails.log.silly(createdMessage);
        }).catch(function (err) {
          if (err) {
            if (err.code == 'E_VALIDATION') {
              return sails.log.warn('UUID already exists');
            };
          };
          sails.log.verbose('Creating message failed', err);
        });
      } else {
        return Message.update({
          where: {
            uuid: uuid,
            feedType: feed.type
          }
        }, message).then(function (updatedMessage) {
          sails.log.verbose('Message updated id:', updatedMessage[0].id);
          sails.log.silly(updatedMessage);
        }).catch(function (err) {
          sails.log.warn('Creating message failed', err);
        });
      }
    }).catch(function (err) {
      sails.log.warn('Error finding message with uuid', stutus.id, err);
    });
  },

  setTokensFromFeeds: function (feeds) {
    var feed = _.find(feeds, function (f) {
      if (typeof f.auth !== 'undefined') {
        sails.log.silly('valid auth:', f.auth.valid);
        return f.auth.valid == true;
      }
    });
    if (feed == undefined) {
      sails.log.error('No authorized feed credentials found.');
      return null;
    }
    t.access_token_key = feed.auth.oauth_access_token;
    t.access_token_secret = feed.auth.oauth_access_token_secret;
    t.auth_feed_id = feed.id;
  },

  setTrackStrings: function (feeds) {
    var follow = [];
    var track = [];
    t.twitter_user = {};
    t.twitter_hashtag = {};
    _.forEach(feeds, function (feed) {
      switch (feed.type) {
        case 'twitter_hashtag':
          track.push(feed.config.toLowerCase());
          break;
        case 'twitter_user':
          follow.push(feed.meta.uid);
          break;
      }
      t[feed.type][feed.config.toLowerCase()] = {
        id: feed.id,
        stream: feed.stream.id,
        type: feed.type
      };
    });
    t.follow = follow;
    t.track = track;
  },

  findHashtag: function (hashtags, feeds) {
    for (var i in hashtags) {
      var h = hashtags[i];
      if (feeds['#' + h.text.toLowerCase()] !== undefined) {
        return feeds['#' + h.text.toLowerCase()];
      }
    }
    return null;
  },

  invalidateToken: function () {
    if (t.auth_feed_id == null || t.auth_feed_id == undefined) {
      sails.log.error('No feed id set.');
    };
    return Feed.findOne(t.auth_feed_id).then(function (feed) {
      if (feed) {
        feed.auth.valid = false;
        Feed.update(feed.id, {auth: feed.auth}).then(function (feed) {
          sails.log.verbose('Feed auth invalidated id: ', feed.id);
        }).catch(function (err) {
          sails.log.error('Error while loading feed', err);
        });
      }
    }).catch(function (err) {
      sails.log.error('Error while loading feed', err);
    });
  },

  findUid: function (name) {
    return new Promise((res, rej) => {
      t.twitter.get('/users/lookup.json', {
        screen_name: name
      }, function (err, data) {
        if (err) {
          sails.log.error(err);
          if (err[0].code == 89) { // invalid or expired token
            t.invalidateToken();
          }
          return rej(err);
        }
        res(data[0].id_str);
      });
    });
  }

};

module.exports = t;
