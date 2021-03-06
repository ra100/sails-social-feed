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
      type: 'mediumtext',
      required: false
    },
    uuid: {
      type: 'text',
      required: false,
      unique: true
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
      /**
       * paths to different image sizes
       * full:
       * large:
       * medium:
       * thumb:
       */
    },
    author: {
      type: 'json'
      /**
       * name
       * id
       * handle
       * picture
       * url
       */
    },
    metadata: {
      type: 'json'
      /*
         * TODO
         * Different for every feed type
         *
         * {likes, shares, comments, media}
         */
    },
    parentMessage: {
      model: 'Message'
    },
    relatedMessage: {
      collection: 'Message',
      via: 'parentMessage'
    },
    isResponse: {
      type: 'boolean',
      defaultsTo: false
    },
    mediaType: {
      type: 'string'
      /**
       * text, audio, video, picture
       */
    }
  },

  /**
   * Automatically fill some values
   */
  beforeValidate: function (values, next) {
    // sails.log.debug('BeforeValidate message values:', values)
    if (values.id) {
      return next()
    }
    if (!values.created) {
      values.created = new Date()
    }
    if (values.feed) {
      // @FIXME sometimes message gets not published
      return Feed.findOne(values.feed)
        .populate('stream')
        .populate('groups')
        .then(feed => {
          values.stream = feed.stream.id
          values.feedType = feed.type
          values.published = feed.display
          if (feed.type.includes('facebook')) {
            if (!values.reviewed) {
              values.published = feed.display
            }
            if (!values.published) {
              values.published = false
            }
          }
          sails.log.verbose('Message values to save', {...values, image: undefined, imageLog: values.image && 'image present'})
          if (feed.type === 'form') {
            const uid = (typeof values.author === 'object')
              ? values.author.id
              : values.author
            return User.findOne({id: uid}).populate('groups').then(user => {
              values.feedType = (feed.groups.find(g =>
                user.groups.find(ug => g.id === ug.id)
              )) ? 'admin' : 'form'
              values.published = values.feedType === 'admin'
                ? true
                : feed.display
              values.reviewed = values.feedType === 'admin'
              values.author = {
                name: user.displayname,
                picture: user.picture,
                id: user.id
              }
              sails.log.verbose('Transformed message values', JSON.stringify(values))
              return next()
            })
          }
          return next()
        })
        .catch(function (err) {
          return next(err)
        })
    } else {
      return next()
    }
  },

  beforeCreate: function (values, next) {
    if (values.image) {
      sails.log.verbose({...values, image: ''})
      storageService.uploadImage(values.image).then((versions) => {
        var picture = {}
        picture.original = {
          path: versions[0].url,
          height: versions[0].height,
          width: versions[0].width,
        }
        picture.large = {
          path: versions[1].url,
          height: versions[1].height,
          width: versions[1].width
        }
        picture.medium = {
          path: versions[2].url,
          height: versions[2].height,
          width: versions[2].width
        }
        picture.thumb = {
          path: versions[3].url,
          height: versions[3].height,
          width: versions[3].width
        }
        values.picture = picture
        delete values.image
        values.mediaType = 'photo'
        next()
      }).catch(next)
    } else {
      next()
    }
  },

  /**
   * Send publishAdd message to sockets, when new message is published
   */
  afterCreate: function (values, next) {
    sails.log.verbose({...values, image: undefined, imageLog: values.image && 'image present'})
    sails.log.verbose('Original values', values)
    delete values._csrf
    if (values.published) {
      Stream.publishAdd(values.stream, 'messages', values)
    } else {
      // @TODO @FIXME
      Stream.publishAdd(values.stream, 'messages', values)
    }
    sails.log.debug('Related message value: ', values.parentMessage)
    if (values.parentMessage) {
      Message.findOne(values.parentMessage).then(message => {
        Stream.publishAdd(values.stream, 'messages', message)
      })
    }
    next()
  },

  /**
   * Send remove message to sockets if message has been upublished
   */
  beforeUpdate: function (values, next) {
    // if (values.published !== undefined && !values.published) {
    //   delete values._csrf
    //   if (values.stream) {
    //     Stream.publishRemove(values.stream, 'messages', values.id)
    //   } else {
    //     Message.findOne(values.id).exec(function (err, message) {
    //       Stream.publishRemove(message.stream, 'messages', message.id)
    //     })
    //   }
    // }
    next()
  },

  /**
   * Send publishAdd message to sockets,
   * when message has been changed and is publushed
   */
  afterUpdate: function (values, next) {
    delete values._csrf
    Message.findOne(values.id).exec(function (err, message) {
      // if (message.published) {
      Stream.publishAdd(message.stream, 'messages', message)
      // } else {
      //   Stream.publishRemove(values.stream, 'messages', values.id)
      // }
    })
    next()
  },

  afterDestroy: function (destroyedRecords, next) {
    for (var i in destroyedRecords) {
      var message = destroyedRecords[i]
      Stream.message(message.stream, {
        action: 'destroyed',
        id: message.id
      })
    }
  }
}
