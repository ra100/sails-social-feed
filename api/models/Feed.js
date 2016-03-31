/**
* Feed.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  attributes: {
    name: {
      type: 'string'
    },
    type: {
      type: 'string',
      enum: [
        'facebook_page',
        'facebook_user',
        'twitter_user',
        'twitter_hashtag',
        'youtube_profile',
        'soundcloud_profile',
        'instagram_profile',
        'form'
      ]
    },
    config: {
      type: 'string'
    },
    groups: {
      collection: 'Group',
      via: 'feeds'
    },
    owner: {
      model: 'User'
    },
    stream: {
      model: 'Stream'
    },
    messages: {
      collection: 'Message',
      via: 'feed'
    },
    auth: {
      type: 'json'
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
