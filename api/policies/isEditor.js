/**
 * isEditor
 *
 * @module      :: Policy
 * @description :: TODO: You might write a short summary of how this policy works and what it represents here.
 * @help        :: http://sailsjs.org/#!/documentation/concepts/Policies
 */
module.exports = function(req, res, next) {
  var uid = req.user.id;
  
  console.log(uid);
  return next();

};
