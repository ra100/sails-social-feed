/**
 * metrics
 *
 * @module      :: Policy
 * @description :: TODO: You might write a short summary of how this policy works and what it represents here.
 * @help        :: http://sailsjs.org/#!/documentation/concepts/Policies
 */
var url = require('url');

module.exports = function (req, res, next) {
  var startAt = process.hrtime();
  var path = url.parse(req.url).pathname;
  var method = req.method;
  
  var updateHistogram = function () {
    res.removeListener('finish', updateHistogram);
  
    var diff = process.hrtime(startAt);
    var time = diff[0] * 1e3 + diff[1] * 1e-6;
  
    metrics.updatePathMetric(path, method, time);
  };
  
  res.on('finish', updateHistogram);
  next();
};
