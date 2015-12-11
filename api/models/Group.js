/**
* Group.js
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
      via: 'groups'
    },
    streams: {
      collection: 'Stream',
      via: 'group'
    },
    feeds: {
      collectin: 'Feed',
      via: 'group'
    }
  }
};