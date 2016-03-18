/**
 * socialFeed service, to provide functions used in different parts of code
 */
module.exports = {
  isAdmin: function (uid, req, next) {
    User.find({id: uid}).populate('roles', {name: 'admin'}).exec(function (e, r) {
      if (r[0].roles.length > 0) {
        next(null, r);
      } else {
        next(req.__('Error.Not.Admin'), r);
      }
    });
  }
};