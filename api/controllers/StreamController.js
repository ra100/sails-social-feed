/**
 * StreamController
 *
 * @description :: Server-side logic for managing streams
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  definition: function (req, res) {
    res.json(sails.models.stream.definition);
  },
  cancreate: function(req, res) {
    res.json({status: 'ok'});
  }
};
