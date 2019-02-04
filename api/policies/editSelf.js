/**
 * editSelf
 *
 * @module      :: Policy
 * @description :: TODO: You might write a short summary of how this policy works and what it represents here.
 * @help        :: http://sailsjs.org/#!/documentation/concepts/Policies
 */
module.exports = function(req, res, next) {
  var uid = req.user.id
  var edituid = req.param('id')
  if (uid == edituid) {
    return next()
  }
  socialFeed.isAdmin(uid, req, function(err, user) {
    if (err) {
      return res.forbidden(err)
    }
    next()
  })
}
