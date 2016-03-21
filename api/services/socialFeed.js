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
    var q = null;
    switch (type) {
      case 'stream':
        q = Stream;
        break;
      case 'feed':
        q = Feed;
        break;
    }
    q.findOne({id: id}).populate('owner').populate('group').exec(function (err, obj) {
      if (obj.owner.id == uid) {
        return next(null, obj);
      }

    });
  }
};