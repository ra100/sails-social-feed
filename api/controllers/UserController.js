/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  /**
   * @override
   */
  create: function (req, res, next) {
    sails.services.passport.protocols.local.register(req.body, function (err, user) {
      if (err) {
        return res.negotiate(err);
      }
      res.ok(user);
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
