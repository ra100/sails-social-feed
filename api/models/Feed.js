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
        'form',
        'admin'
      ]
    },
    config: {
      type: 'string'
    },
    meta: {
      type: 'json'
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

  afterCreate: function (newlyInsertedRecord, next) {
    if (newlyInsertedRecord.type.indexOf('twitter') >= 0) {
      twitterStreaming.restart();
    }
    next();
  },

  beforeUpdate: function (values, next) {
    delete values._csrf;
    if (values.type == 'twitter_user') {
      twitterStreaming.findUid(values.config).then((uid) => {
        values.meta = {
          uid: uid
        };
        next();
      }).catch((err) => {
        values.meta = {
          uid: 0
        };
        next();
      });
    } else {
      next();
    }
  },

  afterUpdate: function (updatedRecord, next) {
    if (updatedRecord.type.indexOf('twitter') >= 0) {
      twitterStreaming.restart();
    }
    next();
  },

  afterDestroy: function (destroyedRecords, next) {
    if (destroyedRecords[0].type.indexOf('twitter') >= 0) {
      twitterStreaming.restart();
    }
    next();
  }
};
