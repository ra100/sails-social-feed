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
  }
};

