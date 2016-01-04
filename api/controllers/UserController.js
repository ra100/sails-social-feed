/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  me: function (req, res) {
    var user = req.user;
    User.findOne({id: user.id}).populate('roles').exec(function (e, r) {
      user = r;
    });
    return res.jsonx({username: user.username, roles: roles});
  }
};
