/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var striptags = require('striptags')
var bcrypt = require('bcryptjs')

module.exports = {
  cancreate: function(req, res) {
    res.ok({ status: 'ok' })
  },
  canmodify: function(req, res) {
    res.ok({ status: 'ok' })
  },
  candestroy: function(req, res) {
    res.ok({ status: 'ok' })
  },

  /**
   * Unsubscribe from rooms related to this item
   */
  unsubscribe: function(req, res, next) {
    if (!req.isSocket) {
      return res.badRequest()
    } else {
      var id = req.param('id') ? req.param('id') : ''
      socialFeed.unsubscribe(req, res, 'message', id)
    }
  },

  /**
   * Submit message by logged in user
   */
  submit: function(req, res) {
    var message = {
      message: req.param('message'),
      stream: req.param('stream'),
      feed: req.param('feed'),
      author: {
        name: req.user.displayname,
        picture: req.user.picture,
        id: req.user.id
      }
    }
    if (typeof req.param('image') !== 'undefined') {
      message.image = req.param('image')
    }
    if (typeof req.param('parentMessage') !== 'undefined') {
      message.isResponse = true
      message.parentMessage = req.param('parentMessage')
    }
    return Feed.findOne(req.param('feed')).then(feed => {
      if (feed && (!feed.type === 'form' || !feed.enabled)) {
        return res.forbidden()
      }
      return Message.create(message)
        .then(message => {
          // TODO add relatedMessage
          res.json({ status: 'ok', message: message })
        })
        .catch(res.negotiate)
    })
  }
}
