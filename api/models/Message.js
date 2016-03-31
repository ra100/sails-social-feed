/**
* Message.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    stream: {
      model: 'Stream'
    },
    feedType: {
      type: 'string'
    },
    feed: {
      model: 'Feed'
    },
    message: {
      type: 'text'
    },
    created: {
      type: 'datetime'
    },
    link: {
      type: 'string',
      url: true
    },
    picture: {
      type: 'json'
    },
    metadata: {
      type: 'json'
      /*
       * TODO
       * Different for every feed type
       *
       * {likes, shares, comments}
       */
    },
    relatedMessage: {
      collection: 'Message',
      via: 'relatedMessage'
    },
    isAnswer: {
      type: 'boolean',
      defaultsTo: false
    }
  }
};

