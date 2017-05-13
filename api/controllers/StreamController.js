/**
 * StreamController
 *
 * @description :: Server-side logic for managing streams
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var _ = require('lodash')
var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil')

module.exports = {
  definition(req, res) {
    res.ok(sails.models.stream.definition)
  },
  cancreate(req, res) {
    res.ok({status: 'ok'})
  },
  canmodify(req, res) {
    res.ok({status: 'ok'})
  },
  candestroy(req, res) {
    res.ok({status: 'ok'})
  },

  messageCount(req, res) {
    var id = req.param('id')
    Message.count({
      where: {
        stream: id
      }
    }).then(function (count) {
      res.json({id: id, count: count})
    }).catch(function (err) {
      res.serverError(err)
    })
  },

  public(req, res) {
    let where = {
      id: req.param('id'),
      published: true
    }
    if (req.param('name')) {
      where = {
        uniqueName: req.param('name'),
        published: true
      }
    };
    Stream.findOne({
      where: where,
      select: ['id', 'name', 'display']
    }).populate('feeds').then((stream) => {
      if (!stream) {
        res.json(404, {error: req.__('Error.Stream.Not.Found')})
      } else {
        stream.form = stream.feeds
          .filter(feed => feed.type === 'form' && feed.enabled)
          .map(feed => feed.id)
        stream.feeds = undefined
        if (req.isSocket) {
          sails.sockets.join(req, 'stream_' + stream.id)
        }
        res.json({
          form: stream.form,
          id: stream.id,
          moderated: !stream.display
        })
      }
    }).catch((err) => {
      res.serverError(err)
    })
  },

  messages(req, res) {
    const limit = req.param('limit') || 10
    const skip = req.param('skip') || 0
    const all = req.param('all') || false
    const timestamp = req.param('timestamp') || false
    const populate = req.param('populate') || ['relatedMessage', 'parentMessage']
    const criteria = {
      where: {
        stream: req.param('id'),
        isResponse: false,
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
        'author',
        'picture',
        'mediaType',
        'relatedMessage',
        'parentMessage',
        'isResponse',
        'published',
        'reviewed',
        'updatedAt'
      ]
    }
    if (all) {
      criteria.where = {
        stream: req.param('id'),
      }
    }
    if (timestamp) {
      criteria.where.updatedAt = {'>': timestamp}
    }
    return Message.find(criteria).populate(populate).then((messages) => {
      if (req.isSocket) {
        Stream.subscribe(req, [req.param('id')])
      }
      res.json(messages)
    }).catch(res.serverError)
  },

  adminMessages(req, res) {
    const limit = req.param('limit') || 10
    const skip = req.param('skip') || 0
    const all = req.param('all') || false
    const timestamp = req.param('timestamp') || false
    const populate = req.param('populate') || ['relatedMessage', 'parentMessage']
    const criteria = {
      where: {
        stream: req.param('id'),
        isResponse: false
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
        'author',
        'picture',
        'mediaType',
        'relatedMessage',
        'parentMessage',
        'isResponse',
        'published',
        'reviewed',
        'updatedAt'
      ]
    }
    if (all) {
      criteria.where = {
        stream: req.param('id'),
      }
    }
    if (timestamp) {
      criteria.where.updatedAt = {'>': timestamp}
    }
    return Message.find(criteria).populate(populate).then((messages) => {
      if (req.isSocket) {
        Stream.subscribe(req, [req.param('id')])
      }
      res.json(messages)
    }).catch(res.serverError)
  },

  /**
   * @override
   */
  destroy(req, res, next) {
    var sid = req.param('id')
    Stream.destroy({id: sid}).exec((err) => {
      if (err) {
        return res.negotiate(err)
      }
      return res.ok()
    })
  },

  /**
   * Unsubscribe from rooms related to this item
   */
  unsubscribe(req, res, next) {
    if (!req.isSocket) {
      return res.badRequest()
    } else {
      var id = req.param('id')
        ? req.param('id')
        : ''
      socialFeed.unsubscribe(req, res, 'stream', id)
    }
  },

  /**
   * Override default find and add permissions key
   */
  find(req, res) {
    // Look up the model
    var Model = actionUtil.parseModel(req)

    // If an `id` param was specified, use the findOne blueprint action
    // to grab the particular instance with its primary key === the value
    // of the `id` param.   (mainly here for compatibility for 0.9, where
    // there was no separate `findOne` action)
    if (actionUtil.parsePk(req)) {
      return require('./findOne')(req, res)
    }

    var criteria = actionUtil.parseCriteria(req)
    // Lookup for records that match the specified criteria
    var query = Model.find().where(criteria).limit(actionUtil.parseLimit(req)).skip(actionUtil.parseSkip(req)).sort(actionUtil.parseSort(req))
    query = actionUtil.populateRequest(query, req)
    query.exec(function found(err, matchingRecords) {
      if (err) {
        return res.serverError(err)
      }
      // // Only `.watch()` for new instances of the model if
      // // `autoWatch` is enabled.
      // if (req._sails.hooks.pubsub && req.isSocket) {
      //   Model.subscribe(req, matchingRecords);
      //   if (req.options.autoWatch) {
      //     Model.watch(req);
      //   }
      //   // Also subscribe to instances of all associated models
      //   _.each(matchingRecords, function (record) {
      //     actionUtil.subscribeDeep(req, record);
      //   });
      // }
      permissions.setPermissions(matchingRecords, 'stream', req.user)
      res.ok(matchingRecords.filter((value) => {
        return value.permissions.r
      }))
    })
  },

  /**
   * Override default findOne.
   * Add permissions info.
   */
  findOne(req, res) {

    var Model = actionUtil.parseModel(req)
    var pk = actionUtil.requirePk(req)

    var query = Model.findOne(pk)
    query = actionUtil.populateRequest(query, req)
    query.exec(function found(err, matchingRecord) {
      if (err) {
        return res.serverError(err)
      }
      if (!matchingRecord) {
        return res.notFound('No record found with the specified `id`.')
      }
      if (req._sails.hooks.pubsub && req.isSocket) {
        Model.subscribe(req, matchingRecord)
        actionUtil.subscribeDeep(req, matchingRecord)
      }
      permissions.addPermissions(matchingRecord, 'stream', req.user)
      res.ok(matchingRecord)
    })
  }
}
