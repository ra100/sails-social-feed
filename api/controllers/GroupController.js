/**
 * GroupController
 *
 * @description :: Server-side logic for managing groups
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  cancreate: function (req, res) {
    res.ok({status: 'ok'});
  },
  canmodify: function (req, res) {
    res.ok({status: 'ok'});
  },
  candestroy: function (req, res) {
    res.ok({status: 'ok'});
  },

  /**
   * @override
   */
  destroy: function (req, res, next) {
    var gid = req.params.id;
    Group.destroy({id: gid}).exec(function (err) {
      if (err) {
        return res.negotiate(err);
      }
      return res.ok();
    });
  }
};
