var _ = require('lodash');

/**
 * socialFeed service, to provide functions used in different parts of code
 */
module.exports = {
  isAdmin: function (uid, req, next) {
    User.find({id: uid}).populate('roles', {name: 'admin'}).exec(function (e, r) {
      if (r[0].roles.length > 0) {
        return next(null, r[0]);
      } else {
        return next(req.__('Error.Not.Admin'), r[0]);
      }
    });
  },

  isEditor: function (uid, req, next) {
    User.find({id: uid}).populate('roles', {name: 'editor'}).exec(function (e, r) {
      if (r[0].roles.length > 0) {
        return next(null, r);
      } else {
        return next(req.__('Error.Not.Editor'), r);
      }
    });
  },

  isOwner: function (data, req, next) {
    var uid = data.uid;
    var type = data.type;
    var id = data.id;
    sails.models[type].findOne({id: id}).populate('owner').populate('groups').exec(function (err, obj) {
      if (err) {
        return next(req.__('Error.Unexpected'), obj);
      }
      if (!obj) {
        return next(null, null);
      }
      if (obj.owner.id == uid) {
        return next(null, obj);
      }
      User.findOne({id: uid}).populate('groups').exec(function(err, user){
        if (err) {
          return next(req.__('Error.Unexpected'), obj);
        }
        var intersection = _.intersectionBy(obj.groups, user.groups, 'id');
        if (intersection.length > 0) {
          return next(null, obj);
        } else {
          return next(req.__('Error.Not.InGroup'), obj);
        }
      });
    });
  }
};