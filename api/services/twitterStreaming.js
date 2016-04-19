var socketio = require('socket.io');
var twitter = require('twitter');
var _ = require('lodash');

module.exports = {
  twitter: null,
  io: null,
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

  init: function (next) {
    Feed.find({
      where: {
        type: ['twitter_user', 'twitter_hashtag']
      }
    }).populate('stream').then(function (feeds) {
      twitterStreaming.setTokensFromFeeds(feeds);
      twitterStreaming.setTrackStrings(feeds);
      twitterStreaming.initStream();
      return (next) ? next(twitterStreaming) : null;
    }).catch(function (err) {
      sails.log.verbose('Twitter Streaming error', err);
    });
  },

  initStream: function () {
    if (twitterStreaming.stream !== null) {
      twitterStreaming.stream.destroy();
      twitterStreaming.stream = null;
    };
    if (twitterStreaming.twitter == null) {
      twitterStreaming.twitter = new twitter({
        consumer_key: twitterStreaming.twitter_consumer_key,
        consumer_secret: twitterStreaming.twitter_consumer_secret,
        access_token_key: twitterStreaming.access_token_key,
        access_token_secret: twitterStreaming.access_token_secret
      });
    };

    twitterStreaming.twitter.get(
      '/users/lookup.json', {
        screen_name: _.keys(twitterStreaming.twitter_user).join(',')
      },
      function (err, data) {
        if (err) {
          sails.log.verbose(err);
        }
        var users = [];
        _.forEach(data, function (user) {
          users.push(user.id);
        });
        twitterStreaming.follow = users;
        twitterStreaming.twitter.stream('statuses/filter', {
          track: twitterStreaming.track.join(','),
          follow: twitterStreaming.follow.join(',')
        }, function (stream) {
          twitterStreaming.stream = stream;
          stream.on('data', twitterStreaming.processData);
          stream.on('end', function (response) {
            sails.log.verbose('Stream end', response);
          });
          stream.on('destroy', function (response) {
            sails.log.verbose('Stream destroyed', response);
          });
        });
      });
  },

  processData: function (data) {
    sails.log.verbose('Stream data', data);
  },


  setTokensFromFeeds: function (feeds) {
    var feed = _.find(feeds, function (f) {
      return f.auth.valid;
    });
    sails.log.verbose(feed.auth.access_token_key);
    twitterStreaming.access_token_key = feed.auth.oauth_access_token;
    twitterStreaming.access_token_secret = feed.auth.oauth_access_token_secret;
  },

  setTrackStrings: function (feeds) {
    var f = [];
    var t = [];
    twitterStreaming.twitter_user = {};
    twitterStreaming.twitter_hashtag = {};
    _.forEach(feeds, function (feed) {
      switch (feed.type) {
        case 'twitter_hashtag':
          t.push(feed.config);
          break;
        case 'twitter_user':
          f.push(feed.config);
          break;
      }
      twitterStreaming[feed.type][feed.config] = {
        id: feed.id,
        stream: feed.stream.id
      };
    });
    twitterStreaming.follow = f;
    twitterStreaming.track = t;
  }

};
