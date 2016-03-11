/**
* Feed.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  feedTypes: [
    'facebook_page',
    'facebook_user',
    'twitter_user',
    'twitter_hashtag',
    'youtube_profile',
    'soundcloud_profile',
    'instagram_profile',
    'form'
  ],

  attributes: {
    name: {
      type: 'string'
    },
    type: {
      type: 'string',
      in: this.feedTypes
    },
    group: {
      model: 'Group'
    },
  }
};
