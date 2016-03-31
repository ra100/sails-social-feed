module.exports = {
  // Enforce model schema in the case of schemaless databases
  schema: true,

  attributes: {
    username: {
      type: 'string',
      unique: true
    },
    email: {
      type: 'email',
      unique: true
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
