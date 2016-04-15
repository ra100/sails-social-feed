var socketio = require('socket.io');
var ntwitter = require('ntwitter');
var _ = require('lodash');

module.exports = {
  twitter: null,
  io: null,
  access_token_key: '',
  access_token_secret: '',
  twitter_consumer_key: sails.config.auth.twitter_consumer_key,
  twitter_consumer_secret: sails.config.auth.twitter_consumer_secret,
  follow: [],
  track: [],
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
      return next(err);
    });
  },

  initStream: function () {
    if (twitterStreaming.stream !== null) {
      twitterStreaming.stream.destroy();
      twitterStreaming.stream = null;
    }
    twitter = new ntwitter({
      consumer_key: twitterStreaming.twitter_consumer_key,
      consumer_secret: twitterStreaming.twitter_consumer_secret,
      access_token_key: twitterStreaming.access_token_key,
      access_token_secret: twitterStreaming.access_token_secret
    });

    var t = twitterStreaming.track.join(',');
    var f = twitterStreaming.follow.join(',');
    twitter.showUser(f, function (err, data) {
      var users = [];
      _.forEach(data, function (user) {
        users.push(user.id);
      });
      twitterStreaming.follow = users;
      twitter.stream('statuses/filter', {
        // track: t
        follow: users.join(',')
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
    twitterStreaming.twitter = twitter;
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
    _.forEach(feeds, function (feed) {
      switch (feed.type) {
      case 'twitter_hashtag':
        t.push(feed.config);
        break;
      case 'twitter_user':
        f.push(feed.config);
        break;
      }
    });
    twitterStreaming.follow = f;
    twitterStreaming.track = t;
  }

};
