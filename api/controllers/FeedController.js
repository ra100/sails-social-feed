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
    res.ok({status: 'ok'});
  },
  canmodify: function (req, res) {
    res.ok({status: 'ok'});
  },
  candestroy: function (req, res) {
    res.ok({status: 'ok'});
  },

  /**
   * Unsubscribe from rooms related to this item
   */
  unsubscribe: function(req, res, next) {
    if (!req.isSocket) {
      return res.badRequest();
    } else {
      var id = req.param('id') ? req.param('id') : '';
      socialFeed.unsubscribe(req, res, 'feed', id);
    }
  }
};

