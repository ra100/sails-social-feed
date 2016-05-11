module.exports = {

  attributes: {
    username: {
      type: 'string',
      unique: true
    },
    displayname: {
      type: 'string'
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
    next();
  },

  beforeUpdate: function (values, next) {
    delete values._csrf;
    next();
  }
};
