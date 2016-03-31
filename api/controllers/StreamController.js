/**
 * StreamController
 *
 * @description :: Server-side logic for managing streams
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  definition: function (req, res) {
    res.ok(sails.models.stream.definition);
  },
  cancreate: function (req, res) {
    res.ok({status: 'ok'});
  },
  canmodify: function (req, res) {
    res.ok({status: 'ok'});
  },
  candestroy: function (req, res) {
    res.ok({status: 'ok'});
  },

  public: function (req, res) {
    Stream.findOne({where: {id: req.param('id'), published: true}, select: ['id', 'name', 'feeds']}).then(function (stream) {
      if (!stream) {
        res.json(404, {error: req.__('Error.Stream.Not.Found')});
      } else {
        res.json(stream);
      }
    }).catch(function (err) {
      res.serverError(err);
    });
  },

  /**
   * @override
   */
  destroy: function (req, res, next) {
    var sid = req.params.id;
    Stream.destroy({id: sid}).exec(function (err) {
      if (err) {
        return res.negotiate(err);
      }
      return res.ok();
    });
  }
};
