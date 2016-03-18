/**
 * editSelf
 *
 * @module      :: Policy
 * @description :: TODO: You might write a short summary of how this policy works and what it represents here.
 * @help        :: http://sailsjs.org/#!/documentation/concepts/Policies
 */
module.exports = function(req, res, next) {

  var uid = req.user.id;
  var edituid = req.params.id;
  User.find({id: uid}).populate('roles', {name: 'admin'}).exec(function(e,r) {
    if (r[0].roles.length > 0) {
      next();
    } else {
      if (uid !== edituid) {
        return res.forbidden(req.__('Error.Not.Admin'));
      } else {
        next();
      }
    }
  });
};
