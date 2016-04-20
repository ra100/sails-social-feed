var socketio = require('socket.io');
var Twitter = require('twitter');
var _ = require('lodash');

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
  status_link: 'https://twitter.com/statuses/',
  user_link: 'https://twitter.com/',
  // prevent multiple loading sequences
  loading: false,

  init: function () {
    if (t.loading) return;
    t.loading = true;
    Feed.find({
      where: {
        type: ['twitter_user', 'twitter_hashtag']
      }
    }).populate('stream').then(function (feeds) {
      t.setTokensFromFeeds(feeds);
      t.setTrackStrings(feeds);
      t.initStream();
    }).catch(function (err) {
      sails.log.verbose('Twitter Streaming error', err);
    });
  },

  /**
   * reloads stream after saving feed
   */
  reload: function () {
    if (t.loading) return;
    t.loading = true;
    Feed.find({
      where: {
        type: ['twitter_user', 'twitter_hashtag']
      }
    }).populate('stream').then(function (feeds) {
      t.setTrackStrings(feeds);
      t.destroyStream();
      t.twitter = null;
      t.initStream();
    }).catch(function (err) {
      sails.log.verbose('Twitter Streaming error', err);
    });
  },

  /**
   * run after new authentication
   */
  reconnect: function (access_token_key, access_token_secret) {
    t.access_token_key = access_token_key;
    t.access_token_secret = access_token_secret;
    Feed.find({
      where: {
        type: ['twitter_user', 'twitter_hashtag']
      }
    }).populate('stream').then(function (feeds) {
      t.setTrackStrings(feeds);
      t.destroyStream();
      t.twitter = null;
      t.initStream();
    }).catch(function (err) {
      sails.log.verbose('Twitter Streaming error', err);
    });
  },

  initStream: function () {
    t.destroyStream();
    if (t.twitter == null) {
      t.twitter = new Twitter({consumer_key: t.twitter_consumer_key, consumer_secret: t.twitter_consumer_secret, access_token_key: t.access_token_key, access_token_secret: t.access_token_secret});
    };

    t.twitter.get('/users/lookup.json', {
      screen_name: _.keys(t.twitter_user).join(',')
    }, function (err, data) {
      if (err) {
        sails.log.error(err);
        if (err[0].code == 89) { // invalid or expired token
          t.invalidateToken();
        }
        return;
      }
      var users = [];
      _.forEach(data, function (user) {
        users.push(user.id);
      });
      t.follow = users;
      t.twitter.stream('statuses/filter', {
        track: t.track.join(','),
        follow: t.follow.join(',')
      }, function (stream) {
        sails.log.info('Stream created');
        t.stream = stream;
        t.loading = false;
        stream.on('data', t.processData);
        stream.on('end', function (response) {
          sails.log.info('Stream ended');
        });
        stream.on('destroy', function (response) {
          sails.log.info('Stream destroyed');
        });
        stream.on('error', function (err) {
          sails.log.error(err);
        });
      });
    });
  },

  destroyStream: function () {
    if (t.stream !== null) {
      t.stream.destroy();
      t.stream = null;
    };
  },

  processData: function (data) {
    sails.log.verbose('Stream data', data);
    // delete message if tweet is deleted
    if (data.delete !== undefined) {
      Message.destroy({
        where: {
          uuid: data.delete.status.id
        }
      }).then(function (message) {
        sails.log.verbose('Message destroyed', message);
      }).catch(function (err) {
        sails.log.error('Destroying message failed', err);
      });
      return;
    };
    var status = data;

    if (data.retweeted_status !== undefined && t.twitter_user[data.retweeted_status.user.screen_name] !== undefined) {
      status = data.retweeted_status;
    };

    var feed = null;
    var hashtag_feed = t.findHashtag(status.entities.hashtags, t.twitter_hashtag);

    if (t.twitter_user[status.user.screen_name] !== undefined) {
      feed = t.twitter_user[status.user.screen_name];
    } else if (hashtag_feed !== null) {
      feed = hashtag_feed;
    };

    if (feed == null) {
      sails.log.warning('Status does not match any feed', status.id_str);
      return;
    };

    var message = {
      stream: feed.stream,
      feedType: feed.type,
      feed: feed.id,
      message: status.text,
      uuid: status.id,
      created: status.created_at,
      link: t.status_link + status.id_str,
      author: {},
      metadata: {}
    };
    var user = status.user;
    message.author = {
      name: user.name,
      handle: user.screen_name,
      id: user.id,
      url: t.user_link + user.screen_name,
      picture: user.profile_image_url_https
    };
    message.metadata = {
      likes: status.favorite_count,
      shares: status.retweet_count,
      entities: status.entities
    };

    if (status.entities.media) {
      message.metadata.media = status.entities.media;
      message.metadata.media_ext = status.extended_entities.media;
    }

    Message.findOne({
      where: {
        uuid: status.id,
        feedType: feed.type
      }
    }).then(function (foundMessage) {
      if (foundMessage == undefined) {
        Message.create(message).then(function (createdMessage) {
          sails.log.verbose('Message created', createdMessage);
        }).catch(function (err) {
          sails.log.verbose('Creating message failed', err);
        });
      } else {
        Message.update({
          where: {
            uuid: status.id,
            feedType: feed.type
          }
        }, message).then(function (updatedMessage) {
          sails.log.verbose('Message created', updatedMessage);
        }).catch(function (err) {
          sails.log.verbose('Creating message failed', err);
        });
      }
    }).catch(function (err) {
      sails.log.verbose('Error finding message with uuid', stutus.id, err);
    });
  },

  setTokensFromFeeds: function (feeds) {
    var feed = _.find(feeds, function (f) {
      sails.log.silly(f.auth.valid);
      return f.auth.valid == true;
    });
    if (feed == undefined) {
      sails.log.error('No authorized feed credentials found.');
      throw {error: 'No authorized feed credentials found.'};
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
          track.push(feed.config);
          break;
        case 'twitter_user':
          follow.push(feed.config);
          break;
      }
      t[feed.type][feed.config] = {
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
      if (feeds['#' + h.text] !== undefined) {
        return feeds['#' + h.text];
      }
    }
    return null;
  },

  invalidateToken: function () {
    if (t.auth_feed_id == null || t.auth_feed_id == undefined) {
      sails.log.error('No feed id set.');
    };
    Feed.findOne(t.auth_feed_id).then(function (feed) {
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
  }

};

module.exports = t;
