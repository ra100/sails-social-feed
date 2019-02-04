/**
 * Role.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  attributes: {
    name: {
      type: 'string',
      unique: true
    },
    users: {
      collection: 'User',
      via: 'roles'
    },
    // List of permissions (actions) role has access to
    permissions: {
      type: 'json'
    }
  },

  beforeCreate: function(values, next) {
    delete values._csrf
    next()
  },

  beforeUpdate: function(values, next) {
    delete values._csrf
    next()
  }
}
