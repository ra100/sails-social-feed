var request = require('request')
var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil')
/**
 * FeedController
 *
 * @description :: Server-side logic for managing feeds
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  definition: function (req, res) {
    res.ok(sails.models.feed.definition)
  },
  cancreate: function (req, res) {
    res.ok({status: 'ok'})
  },
  canmodify: function (req, res) {
    res.ok({status: 'ok'})
  },
  candestroy: function (req, res) {
    res.ok({status: 'ok'})
  },

  /**
   * Unsubscribe from rooms related to this item
   */
  unsubscribe: function (req, res, next) {
    if (!req.isSocket) {
      return res.badRequest()
    }
    var id = req.param('id')
      ? req.param('id')
      : ''
    socialFeed.unsubscribe(req, res, 'feed', id)
  },

  authorize: function (req, res, next) {
    var id = req.param('id')
    if (!id) {
      return res.badRequest()
    }
    Feed.findOne(id).then(function (feed) {
      switch (feed.type) {
        case 'twitter_user':
        case 'twitter_hashtag':
          socialFeed.authTwitter(req, res, next)
          break
        case 'facebook_page':
        case 'facebook_user':
          socialFeed.authFacebook(req, res, next)
          break
      }
    }).catch(function (err) {
      return res.serverError(err)
    })
  },

  /**
   * twitter auth callback
   */
  twitter(req, res, next) {
    socialFeed.authTwitterTokens(req, res)
  },

  /**
   * facebook auth callback
   */
  facebook(req, res, next) {
    socialFeed.authFacebookTokens(req, res, next)
  },

  /**
   * instagram auth callback
   */
  instagram(req, res, next) {
    socialFeed.authInstagramTokens(req, res, next)
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
      permissions.setPermissions(matchingRecords, 'feed', req.user)
      return res.ok(matchingRecords)
    })
  },

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
      permissions.addPermissions(matchingRecord, 'feed', req.user)
      return res.ok(matchingRecord)
    })
  }
}
