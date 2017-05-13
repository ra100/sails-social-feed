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
        // 'facebook_user',
        'twitter_user',
        'twitter_hashtag',
        // 'youtube_profile',
        // 'soundcloud_profile',
        'instagram_user',
        // 'instagram_tag',
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
    },
    enabled: {
      type: 'boolean',
      defaultsTo: true
    },
    /**
     * Default display state for message
     * false hide
     * true show
     */
    display: {
      type: 'boolean',
      defaultsTo: false
    },
  },

  beforeCreate: function (values, next) {
    delete values._csrf
    next()
  },

  afterCreate: function (newlyInsertedRecord, next) {
    if (newlyInsertedRecord.type.indexOf('twitter') >= 0) {
      twitterStreaming.restart()
    }
    next()
  },

  beforeUpdate: function (values, next) {
    delete values._csrf
    Feed.findOne({id: values.id}).then((feed) => {
      switch(values.type) {
        case 'twitter_user':
          if (feed.config == values.config && typeof feed.meta !== 'undefined' && feed.meta.uid !== 0) {
            return next()
          }
          return twitterStreaming.findUid(values.config).then((uid) => {
            values.meta = {
              uid: uid
            }
            next()
          }).catch((err) => {
            values.meta = {
              uid: 0
            }
            next()
          })
          break

        case 'facebook_page':
        case 'facebook_user':
          if (feed.config !== values.config) {
            // remove old subscribtion
            return facebookUpdate.unsubscribe(feed, values, next)
          }
          next()
          break

        case 'instagram_user':
        case 'instagram_tag':
          if ((feed.config !== values.config ||
            values.enabled !== feed.enabled) &&
            values.enabled) {
            return instagramUpdate.subscribe(feed, values, next)
          }
          next()
          break

        default:
          next()
      }
    }).catch(next)
  },

  afterUpdate: function (updatedRecord, next) {
    if (updatedRecord.type.indexOf('twitter') >= 0) {
      twitterStreaming.restart()
    }
    next()
  },

  afterDestroy: function (destroyedRecords, next) {
    if (destroyedRecords[0].type.indexOf('twitter') >= 0) {
      twitterStreaming.restart()
    }
    next()
  }
}
