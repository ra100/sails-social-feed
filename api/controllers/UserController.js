/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

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
   * @override
   */
  create: function (req, res, next) {
    sails.services.passport.protocols.local.register(req, res, function (err, user) {
      if (err) {
        return res.serverError(err);
      }
      sails.log.verbose(user);
      return res.ok(user);
    });
  },

  /**
   * @override
   */
  update: function (req, res, next) {
    var uid = req.param('id'),
      username = req.param('username'),
      password = req.param('password'),
      email = req.param('email'),
      roles = req.param('roles');

    updated = {};
    if (username != undefined && username.length > 0) {
      updated.username = username;
    }
    if (email != undefined && email.length > 0) {
      updated.email = email;
    }
    if (roles != undefined && roles.length > 0) {
      updated.roles = roles;
    }

    socialFeed.isAdmin(req.user.id, req, function (err, u) {
      if (err && updated.roles) {
        return res.forbidden(err);
      }

      User.update({
        id: uid
      }, updated).exec(function (err, user) {
        if (err) {
          return res.negotiate(err);
        }
        if (password != undefined && password.length > 6) {
          Passport.update({
            user: uid,
            protocol: 'local'
          }, {password: password}).exec(function (err, passport) {
            if (err) {
              return res.serverError(err);
            }
            res.ok(user[0]);
          });
        } else {
          res.ok(user[0]);
        }
      });
    });
  },

  /**
   * @override
   */
  destroy: function (req, res, next) {
    var uid = req.params.id;
    if (uid == 1) {
      return res.forbidden();
    } else {
      User.destroy({id: uid}).exec(function (err) {
        if (err) {
          return res.negotiate(err);
        }
        return res.ok();
      });
    }
  },

  me: function (req, res) {
    var user = req.user;
    User.findOne({id: user.id}).populate('roles').exec(function (e, r) {
      user = r;
      return res.jsonx({username: user.username, roles: user.roles});
    });
  }
};
