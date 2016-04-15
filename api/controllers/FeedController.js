var request = require('request');
/**
 * FeedController
 *
 * @description :: Server-side logic for managing feeds
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  definition: function (req, res) {
    res.ok(sails.models.feed.definition);
  },
  cancreate: function (req, res) {
    res.ok({
      status: 'ok'
    });
  },
  canmodify: function (req, res) {
    res.ok({
      status: 'ok'
    });
  },
  candestroy: function (req, res) {
    res.ok({
      status: 'ok'
    });
  },

  /**
   * Unsubscribe from rooms related to this item
   */
  unsubscribe: function (req, res, next) {
    if (!req.isSocket) {
      return res.badRequest();
    }
    var id = req.param('id') ? req.param('id') : '';
    socialFeed.unsubscribe(req, res, 'feed', id);
  },

  authorize: function (req, res, next) {
    var id = req.param('id');
    if (!id) {
      return res.badRequest();
    }
    Feed.findOne(id).then(function(feed) {
      switch (feed.type) {
        case 'twitter_user':
        case 'twitter_hashtag':
          socialFeed.authTwitter(req, res, next);
          break;
      }
    })
    .catch(function (err) {
      res.serverError(err);
    });
  },

  /**
   * twitter auth callback
   */
  twitter: function(req, res, next) {
    socialFeed.authTwitterTokens(req, res);
  }
};
