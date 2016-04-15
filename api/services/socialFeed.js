'use strict';
var _ = require('lodash');
var oauth = require('oauth');

/**
 * socialFeed service, to provide functions used in different parts of code
 */
module.exports = {
  isAdmin: function (uid, req, next) {
    User.find({
      id: uid
    }).populate('roles', {
      name: 'admin'
    }).exec(function (e, r) {
      if (r[0].roles.length > 0) {
        return next(null, r[0]);
      } else {
        return next(req.__('Error.Not.Admin'), r[0]);
      }
    });
  },

  isEditor: function (uid, req, next) {
    User.find({
      id: uid
    }).populate('roles', {
      name: 'editor'
    }).exec(function (e, r) {
      if (r[0].roles.length > 0) {
        return next(null, r);
      } else {
        return next(req.__('Error.Not.Editor'), r);
      }
    });
  },

  isOwner: function (data, req, next) {
    var uid = data.uid;
    var type = data.type;
    var id = data.id;
    sails.models[type].findOne({
      id: id
    }).populate('owner').populate('groups').exec(function (err, obj) {
      if (err) {
        return next(req.__('Error.Unexpected'), obj);
      }
      if (!obj) {
        return next(null, null);
      }
      if (obj.owner.id == uid) {
        return next(null, obj);
      }
      User.findOne({
        id: uid
      }).populate('groups').exec(function (err, user) {
        if (err) {
          return next(req.__('Error.Unexpected'), obj);
        }
        var intersection = _.intersectionBy(obj.groups, user.groups, 'id');
        if (intersection.length > 0) {
          return next(null, obj);
        } else {
          return next(req.__('Error.Not.InGroup'), obj);
        }
      });
    });
  },

  unsubscribe: function (req, res, modelName, modelId) {
    var rooms = req.socket.rooms;
    var pattern = 'sails_model_' + modelName + '_' + modelId;
    _.forEach(rooms, function (room, key) {
      if (room.indexOf(pattern) == 0) {
        sails.sockets.leave(req, room);
        sails.log.silly('Socket ' + req.socket.id + ' left room ' + room);
      }
    });
    res.json({
      message: 'ok'
    });
  },

  authTwitter: function (req, res) {
    var id = req.param('id');
    var oa = new oauth.OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      sails.config.auth.twitter_consumer_key,
      sails.config.auth.twitter_consumer_secret,
      '1.0',
      'http://shoutbox.rozhlas.cz/feeds/twitter/' + id,
      'HMAC-SHA1'
    );

    oa.getOAuthRequestToken(function (err, oAuthToken, oAuthTokenSecret, results) {
      if (err || !results.oauth_callback_confirmed) {
        return res.serverError(err);
      }
      Feed.update(id, {
        auth: {
          oauth_token_secret: oAuthTokenSecret
        }
      }).then(function (feed) {
        return res.ok({
          redirect: 'https://twitter.com/oauth/authorize?oauth_token=' + oAuthToken
        });
      }).catch(function (err) {
        return res.serverError(err);
      });
    });
  },

  authTwitterTokens: function (req, res) {
    let id = req.param('id');
    let oauth_token = req.param('oauth_token');
    let oauth_verifier = req.param('oauth_verifier');
    var oa = new oauth.OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      sails.config.auth.twitter_consumer_key,
      sails.config.auth.twitter_consumer_secret,
      '1.0',
      'http://shoutbox.rozhlas.cz/feeds/twitter/' + id,
      'HMAC-SHA1'
    );
    Feed.findOne(id).then(function (feed) {
      if (!feed.auth.oauth_token_secret) {
        return res.serverError();
      }
      oa.getOAuthAccessToken(oauth_token, feed.auth.oauth_token_secret,
        oauth_verifier,
        function (err, oAuthAccessToken,
          oAuthAccessTokenSecret, results) {
          if (err) {
            return res.serverError(err);
          };
          oa.get('https://api.twitter.com/1.1/account/verify_credentials.json',
            oAuthAccessToken,
            oAuthAccessTokenSecret,
            function (err, twitterResponseData, result) {
              if (err) {
                return res.negotiate(err);
              }
              let auth = {};
              try {
                auth = JSON.parse(twitterResponseData);
              } catch (parseError) {
                return res.negotiate(parseError);
              }
              auth.oauth_access_token = oAuthAccessToken;
              auth.oauth_access_token_secret = oAuthAccessTokenSecret;
              auth.valid = true;
              Feed.update(id, {auth: auth}).then(function(feed) {
                return res.redirect('/#/feed/' + id);
              }).catch(function (err) {
                return res.negotiate(err);
              });
            });
        });
    }).catch(function (err) {
      return res.serverError(err);
    });
  }
};
