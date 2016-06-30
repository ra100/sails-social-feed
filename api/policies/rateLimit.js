/**
 * rateLimit
 *
 * @module      :: Policy
 * @description :: Set rate limit for requests 15 per 60 minute interval
 * @help        :: http://sailsjs.org/#!/documentation/concepts/Policies
 */
module.exports = function (req, res, next) {
  if (typeof req.session.limit == 'undefined') {
    req.session.limit = [new Date()];
    return next();
  } else {
    req.session.limit.push(new Date());
    if (req.session.limit.length <= 15) {
      return next();
    }
    if (new Date() - req.session.limit[0] > (60 * 60 * 1000)) { // 15 per hour
      req.session.limit.shift();
      return next();
    } else {
      req.session.limit.pop();
      return res.tooManyRequests({message: res.__('Error.Too.Many.Requests')});
    }
  }
  return next();
};
