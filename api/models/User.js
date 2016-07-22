module.exports = {

  attributes: {
    username: {
      type: 'string',
      unique: true
    },
    displayname: {
      type: 'string'
    },
    meta: {
      type: 'json',
    },
    blocked: {
      type: 'boolean',
      default: false
    },
    email: {
      type: 'email',
      unique: true
    },
    picture: {
      type: 'string',
    },
    passports: {
      collection: 'Passport',
      via: 'user'
    },
    locale: {
      type: 'string',
      enum: sails.config.i18n.locales
    },
    roles: {
      collection: 'Role',
      via: 'users',
      dominant: true
    },
    groups: {
      collection: 'Group',
      via: 'users',
      dominant: true
    },
    streams: {
      collection: 'Stream',
      via: 'owner'
    },
    feeds: {
      collection: 'Feed',
      via: 'owner'
    }
  },

  beforeCreate: function (values, next) {
    delete values._csrf;
    if (values.image) {
      storageService.uploadAvatar(values.image).then((versions) => {
        var picture = {};
        values.picture = versions[0].url;
        delete values.image;
        next();
      }).catch(next);
    } else {
      if (values.email) {
        var hashmd5 = crypto.createHash('md5').update(values.email).digest('hex');
        values.picture = 'https://www.gravatar.com/avatar/' + hashmd5 + '.jpg?s=48';
      }
      next();
    }
  },

  beforeUpdate: function (values, next) {
    delete values._csrf;
    if (values.image) {
      storageService.uploadAvatar(values.image).then((versions) => {
        var picture = {};
        values.picture = versions[0].url;
        delete values.image;
        next();
      }).catch(next);
    } else {
      next();
    }
  },

  /**
   * Remove Passports after user delete
   */
  afterDestroy: function (destroyedRecords, next) {
    Promise.all(destroyedRecords.map((user) => {
      return Passport.destroy({user: user.id});
    })).then(() => {
      next();
    }).catch(next);
  }
};
