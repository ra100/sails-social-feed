/**
 * StreamController
 *
 * @description :: Server-side logic for managing streams
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var _ = require('lodash');

module.exports = {
  definition(req, res) {
    res.ok(sails.models.stream.definition);
  },
  cancreate(req, res) {
    res.ok({status: 'ok'});
  },
  canmodify(req, res) {
    res.ok({status: 'ok'});
  },
  candestroy(req, res) {
    res.ok({status: 'ok'});
  },

  messageCount(req, res) {
    var id = req.param('id');
    Message.count({
      where: {
        stream: id
      }
    }).then(function (count) {
      res.json({id: id, count: count});
    }).catch(function (err) {
      res.serverError(err);
    });
  },

  public(req, res) {
    Stream.findOne({
      where: {
        id: req.param('id'),
        published: true
      },
      select: ['id', 'name']
    }).populate('feeds').then((stream) => {
      if (!stream) {
        res.json(404, {error: req.__('Error.Stream.Not.Found')});
      } else {
        var feeds = stream.feeds;
        var i = _.findIndex(feeds, {type: 'form'});
        if (i >= 0) {
          stream.form = feeds[i].id;
        } else {
          stream.form = null;
        }
        stream.feeds = undefined;
        if (req.isSocket) {
          sails.sockets.join(req, 'stream_' + stream.id);
        }
        res.json(stream);
      }
    }).catch((err) => {
      res.serverError(err);
    });
  },

  messages(req, res) {
    let limit = req.param('limit') || 10;
    let skip = req.param('skip') || 0;
    sails.log.silly(req.params);
    return Message.find({
      where: {
        stream: req.param('id')
      },
      sort: 'created DESC',
      limit: limit,
      skip: skip,
      select: ['feedType', 'message', 'id', 'created', 'link', 'metadata', 'author']
    }).then((messages) => {
      res.json(messages);
    }).catch(res.serverError);
  },

  /**
   * @override
   */
  destroy(req, res, next) {
    var sid = req.param('id');
    Stream.destroy({id: sid}).exec((err) => {
      if (err) {
        return res.negotiate(err);
      }
      return res.ok();
    });
  },

  /**
   * Unsubscribe from rooms related to this item
   */
  unsubscribe(req, res, next) {
    if (!req.isSocket) {
      return res.badRequest();
    } else {
      var id = req.param('id')
        ? req.param('id')
        : '';
      socialFeed.unsubscribe(req, res, 'stream', id);
    }
  }
};
