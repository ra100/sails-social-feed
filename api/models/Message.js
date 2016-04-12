/**
 * Message.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    stream: {
      model: 'Stream',
      required: true
    },
    feedType: {
      type: 'string'
    },
    feed: {
      model: 'Feed'
    },
    message: {
      type: 'text',
      required: true
    },
    published: {
      type: 'boolean',
      defaultsTo: false
    },
    reviewed: {
      type: 'boolean',
      defaultsTo: false
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
  },

  /**
   * Automatically fill some values
   */
  beforeValidate: function (values, next) {
    if (values.id) {
      return next();
    }
    if (!values.created) {
      values.created = new Date();
    }
    if (values.feed) {
      Feed.findOne(values.feed).populate('stream').then(function (feed) {
        values.stream = feed.stream.id;
        values.feedType = feed.type;
        values.published = feed.stream.display;
        next();
      }).catch(function (err) {
        next(err);
      });
    } else if (values.stream) {
      Stream.findOne(values.stream).then(function (stream) {
        values.feedType = 'admin';
        values.published = stream.display;
        next();
      }).catch(function (err) {
        next(err);
      });
    } else {
      next();
    }
  },

  /**
   * Send publishAdd message to sockets, when new message is published
   */
  afterCreate: function (values, next) {
    sails.log.verbose(values);
    if (values.published) {
      delete values._csrf;
      Stream.publishAdd(values.stream, 'messages', values);
    } else {
      Stream.publishAdd(values.stream, 'messages', values);
    }
    next();
  },

  /**
   * Send remove message to sockets if message has been upublished
   */
  beforeUpdate: function (values, next) {
    if (values.published !== undefined && !values.published) {
      delete values._csrf;
      if (values.stream) {
        Stream.publishRemove(values.stream, 'messages', values.id);
      } else {
        Message.findOne(values.id).exec(function (err, message) {
          Stream.publishRemove(message.stream, 'messages', message.id);
        });
      }
    }
    next();
  },

  /**
   * Send publishAdd message to sockets,
   * when message has been changed and is publushed
   */
  afterUpdate: function (values, next) {
    // if (values.published) {
    delete values._csrf;
    Message.findOne(values.id).exec(function (err, message) {
      Stream.publishAdd(message.stream, 'messages', message);
    });
    // }
    next();
  }
};
