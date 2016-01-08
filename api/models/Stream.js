/**
* Stream.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    name: {
      type: 'string'
    },
    messages: {
      collection: 'Message',
      via: 'stream'
    },
    originalId: {
      type: 'string'
    },
    owner: {
      model: 'User'
    },
    group: {
      model: 'Group'
    }
    // TODO settings (active/inactive, refresh rate, show/hide, published)
  }
};

