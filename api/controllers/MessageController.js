/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var striptags = require('striptags');
var bcrypt = require('bcryptjs');

module.exports = {
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
  unsubscribe: function (req, res, next) {
    if (!req.isSocket) {
      return res.badRequest();
    } else {
      var id = req.param('id')
        ? req.param('id')
        : '';
      socialFeed.unsubscribe(req, res, 'message', id);
      next();
    }
  },

  /**
   * Submit message by logged in user
   */
  submit: function (req, res) {
    var message = {
      message: req.param('message'),
      feed: req.param('feed'),
      author: {
        name: req.user.displayname,
        picture: req.user.picture
      }
    };
    if (req.param('image') !== null) {
      message.image = req.param('image');
    }
    Message.create(message).then((message) => {
      res.json({status: 'ok', 'message': message});
    }).catch(res.negotiate);
  }
};
