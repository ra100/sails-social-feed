/**
 * StreamController
 *
 * @description :: Server-side logic for managing streams
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var _ = require('lodash');
var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');

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
    let where = {
      id: req.param('id'),
      published: true
    };
    if (req.param('name')) {
      where = {
        uniqueName: req.param('name'),
        published: true
      };
    };
    Stream.findOne({
      where: where,
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
        res.json({form: stream.form, id: stream.id});
      }
    }).catch((err) => {
      res.serverError(err);
    });
  },

  messages(req, res) {
    let limit = req.param('limit') || 10;
    let skip = req.param('skip') || 0;
    return Message.find({
      where: {
        stream: req.param('id'),
        published: true
      },
      sort: 'created DESC',
      limit: limit,
      skip: skip,
      select: [
        'feedType',
        'message',
        'id',
        'created',
        'link',
        'metadata',
        'author'
      ]
    }).then((messages) => {
      if (req.isSocket) {
        Stream.subscribe(req, [req.param('id')]);
      }
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
  },

  /**
   * Override default find and add permissions key
   */
  find(req, res) {
    // Look up the model
    var Model = actionUtil.parseModel(req);

    // If an `id` param was specified, use the findOne blueprint action
    // to grab the particular instance with its primary key === the value
    // of the `id` param.   (mainly here for compatibility for 0.9, where
    // there was no separate `findOne` action)
    if (actionUtil.parsePk(req)) {
      return require('./findOne')(req, res);
    }

    var criteria = actionUtil.parseCriteria(req);
    // Lookup for records that match the specified criteria
    var query = Model.find().where(criteria).limit(actionUtil.parseLimit(req)).skip(actionUtil.parseSkip(req)).sort(actionUtil.parseSort(req));
    query = actionUtil.populateRequest(query, req);
    query.exec(function found(err, matchingRecords) {
      if (err) {
        return res.serverError(err);
      }
      // Only `.watch()` for new instances of the model if
      // `autoWatch` is enabled.
      permissions.setPermissions(matchingRecords, 'stream', req.user);

      res.ok(matchingRecords);
    });
  },

  /**
   * Override default findOne.
   * Add permissions info.
   */
  findOne(req, res) {

    var Model = actionUtil.parseModel(req);
    var pk = actionUtil.requirePk(req);

    var query = Model.findOne(pk);
    query = actionUtil.populateRequest(query, req);
    query.exec(function found(err, matchingRecord) {
      if (err) {
        return res.serverError(err);
      }
      if (!matchingRecord) {
        return res.notFound('No record found with the specified `id`.');
      }
      if (req._sails.hooks.pubsub && req.isSocket) {
        Model.subscribe(req, matchingRecord);
        actionUtil.subscribeDeep(req, matchingRecord);
      }
      permissions.addPermissions(matchingRecord, 'stream', req.user);
      res.ok(matchingRecord);
    });
  }
};
