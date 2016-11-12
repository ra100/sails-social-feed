/**
 * isEditor
 *
 * @module      :: Policy
 * @description :: TODO: You might write a short summary of how this policy works and what it represents here.
 * @help        :: http://sailsjs.org/#!/documentation/concepts/Policies
 */
module.exports = function(req, res, next) {
  var uid = req.user.id
  var type = req.options.controller
  var id = req.param('id')
  socialFeed.isOwner({type: type, uid: uid, id: id}, req, function(err, user) {
    if (err) {
      socialFeed.isAdmin(uid, req, function (err, user) {
        if (err) {
          return res.forbidden(err)
        }
        return next()
      })
    }
    return next()
  })
}
