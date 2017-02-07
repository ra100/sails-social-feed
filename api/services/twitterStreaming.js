var socketio = require('socket.io')
var Twitter = require('twitter')
var _ = require('lodash')

const status_link = 'https://twitter.com/statuses/'
const user_link = 'https://twitter.com/'

const twitterStreamingClass = function() {
  this.twitter = null
  this.auth_feed_id = null
  this.access_token_key = ''
  this.access_token_secret = ''
  this.twitter_consumer_key = sails.config.auth.twitter_consumer_key
  this.twitter_consumer_secret = sails.config.auth.twitter_consumer_secret
  // array to keep user ids
  this.follow = []
  // array to keep keywords to track
  this.track = []
  // key:object pairs to set correct feed for message
  this.twitter_hashtag = {}
  // key:object pairs to set correct feed for message
  this.twitter_user = {}
  this.stream = null
  this.reload = true
  this.calm = 1
  this.timer = null

  this.init = () => {
    clearTimeout(this.timer)
    Feed.find({
      where: {
        type: [
          'twitter_user', 'twitter_hashtag'
        ],
        enabled: true
      }
    }).populate('stream').exec((err, feeds) => {
      if (err) {
        return sails.log.verbose('Twitter Streaming error', err)
      }
      if (this.setTokensFromFeeds(feeds) == null) {
        return
      };
      this.setTrackStrings(feeds)
      this.initStream()
    })
  }

  /**
   * run after new authentication
   */
  this.reconnect = (access_token_key, access_token_secret) => {
    this.access_token_key = access_token_key
    this.access_token_secret = access_token_secret
    return Feed.find({
      where: {
        type: ['twitter_user', 'twitter_hashtag']
      }
    }).populate('stream').then((feeds) => {
      this.setTrackStrings(feeds)
      this.initStream()
    }).catch((err) => {
      sails.log.verbose('Twitter Streaming error', err)
    })
  }

  this.initStream = () => {
    sails.log.verbose('Twitter Stream init', this.twitter_user, this.follow, this.twitter_hashtag, this.track)
    if (this.twitter == null) {
      this.twitter = new Twitter({consumer_key: this.twitter_consumer_key, consumer_secret: this.twitter_consumer_secret, access_token_key: this.access_token_key, access_token_secret: this.access_token_secret})
    };

    let createStream = () => {
      if (this.stream == null || !this.stream.active) {
        this.twitter.stream('statuses/filter', {
          track: this.track.join(','),
          follow: this.follow.join(',')
        }, (stream) => {
          clearTimeout(this.timer)
          sails.log.info('Stream created')
          this.stream = stream
          stream.active = true
          stream.on('data', this.processData)
          stream.on('end', () => {
            sails.log.info('Stream ended')
            stream.active = false
            clearTimeout(this.timer)
            sails.log.debug('Calm: ', this.calm)
            this.timer = setTimeout(() => {
              clearTimeout(this.timer)
              if (this.stream.active) {
                this.stream.destroy()
              } else {
                this.init()
              }
            }, 1000 * this.calm * this.calm)
          })
          stream.on('error', (err) => {
            sails.log.warn(err.message)
            if (err.message == 'Status Code: 420') {
              sails.log.info('Stream too many connections')
              sails.log.silly('stream: ', this.stream)
              this.calm++
            }
            else if (err.code == 'ECONNRESET') {
              this.reload = false
              if (this.stream !== null) {
                this.stream.destroy()
              }
              this.calm++
            }
          })
        })
      }
    }

    // If stream is not reloaded, just create stream
    if (!this.reload) {
      return createStream()
    }

    let q = this.buildQuery()

    // Find latest tweet imported and find all newer data. Then create stream.
    Message.findOne({
      where: {
        or: [
          {
            feedType: 'twitter_user'
          }, {
            feedType: 'twitter_hashtag'
          }
        ]
      },
      sort: 'created DESC'
    }).exec((err, message) => {
      if (err) {
        sails.log.warn('Error findig uuid', err)
        createStream()
      } else {
        let payload = {}
        if (message !== undefined) {
          payload.since_id = message.uuid.substr(0, 18)
        }
        for (let i in q) {
          payload.q = q[i]
          sails.log.silly('payload: ', payload)
          //  Search for tweets newer than
          this.twitter.get('search/tweets', payload, (err, data) => {
            this.processGetData(data)
            createStream()
          })
        }
      }
    })
  }

  this.restart = () => {
    this.reload = true
    this.calm = 1
    clearTimeout(this.timer)
    if (this.stream !== null && this.stream.active) {
      this.stream.destroy()
    } else {
      this.init()
    }
  }

  this.buildQuery = () => {
    let q = []
    let users = []
    for (let j in this.twitter_user) {
      users.push('@' + j.toLocaleLowerCase())
    }
    let m = _.union(this.track, users)
    q = _.chunk(m, 10)
    for (let i in q) {
      q[i] = _.join(q[i], ' OR ')
    }
    return q
  }

  this.processGetData = (data) => {
    if (typeof data == 'undefined') {
      return
    }
    for (let i in data.statuses) {
      this.processData(data.statuses[i])
    }
  }

  this.processData = (data) => {
    sails.log.silly('Stream data', data)
    // delete message if tweet is deleted
    clearTimeout(this.timer)
    if (data.delete !== undefined) {
      return Message.destroy({
        where: {
          uuid: {
            endsWith: data.delete.status.id
          }
        }
      }).then((message) => {
        sails.log.verbose('Message destroyed', message)
      }).catch((err) => {
        sails.log.error('Destroying message failed', err)
      })
    };
    let status = data

    let feed = null
    let screen_name = status.user.screen_name.toLocaleLowerCase()
    // if tweet is retweet
    if (typeof data.retweeted_status !== 'undefined') {
      status = data.retweeted_status
      screen_name = status.user.screen_name.toLocaleLowerCase()
      // if we follow retweeted user
      if (typeof this.twitter_user[screen_name] !== 'undefined') {
        feed = this.twitter_user[screen_name]
        // we don't follow retweeted user
      } else {
        let hashtag_feed = this.findHashtag(status.entities.hashtags, this.twitter_hashtag)
        // hashtag in retweeted status tracked
        if (hashtag_feed !== null) {
          feed = hashtag_feed
          // we don't track retweeted hashtags
        } else {
          status = data
          feed = this.findHashtag(status.entities.hashtags, this.twitter_hashtag)
        }
      }
      // if tweet doesn't have retweet
    } else {
      if (typeof this.twitter_user[screen_name] !== 'undefined') {
        feed = this.twitter_user[screen_name]
      } else {
        feed = this.findHashtag(status.entities.hashtags, this.twitter_hashtag)
      }
    }

    if (feed == null) {
      sails.log.debug('Status does not match any feed', status_link + status.id_str)
      return
    };

    let uuid = status.id + '_' + feed.stream

    let message = {
      stream: feed.stream,
      feedType: feed.type,
      feed: feed.id,
      message: status.text,
      uuid: uuid,
      created: status.created_at,
      link: status_link + status.id_str,
      author: {},
      metadata: {},
      mediaType: 'text'
    }
    let user = status.user
    message.author = {
      name: user.name,
      handle: user.screen_name,
      id: user.id,
      url: user_link + user.screen_name,
      picture: user.profile_image_url_https
    }
    message.metadata = {
      likes: status.favorite_count,
      shares: status.retweet_count,
      entities: status.entities
    }

    if (status.entities.media) {
      message.metadata.media = status.entities.media
      switch (status.entities.media[0].type) {
        case 'photo':
          message.mediaType = 'photo'
          break
      }
      if (status.extended_entities) {
        message.metadata.media_ext = status.extended_entities.media
        switch (status.extended_entities.media[0].type) {
          case 'photo':
            message.mediaType = 'photo'
            if (status.extended_entities.media.length > 1) {
              message.mediaType = 'gallery'
            }
            break
          case 'animated_gif':
            message.mediaType = 'video'
            break
        }
      }
    }

    return Message.findOne({
      where: {
        uuid: uuid,
        feedType: feed.type
      }
    }).then((foundMessage) => {
      if (foundMessage == undefined) {
        return Message.create(message).then((createdMessage) => {
          sails.log.verbose('Message created id:', createdMessage.id)
          sails.log.silly(createdMessage)
        }).catch((err) => {
          if (err) {
            if (err.code == 'E_VALIDATION') {
              return sails.log.warn('UUID already exists')
            };
          };
          sails.log.verbose('Creating message failed', err)
        })
      } else {
        return Message.update({
          where: {
            uuid: uuid,
            feedType: feed.type
          }
        }, message).then((updatedMessage) => {
          sails.log.verbose('Message updated id:', updatedMessage[0].id)
          sails.log.silly(updatedMessage)
        }).catch((err) => {
          sails.log.warn('Creating message failed', err)
        })
      }
    }).catch((err) => {
      sails.log.warn('Error finding message with uuid', status.id, err)
    })
  }

  this.setTokensFromFeeds = (feeds) => {
    const feed = _.find(feeds, (f) => {
      if (typeof f.auth !== 'undefined') {
        sails.log.silly('valid auth:', f.auth.valid)
        return f.auth.valid == true
      }
    })
    if (feed == undefined) {
      sails.log.error('No authorized feed credentials found.')
      return null
    }
    this.access_token_key = feed.auth.oauth_access_token
    this.access_token_secret = feed.auth.oauth_access_token_secret
    this.auth_feed_id = feed.id
    return true
  }

  this.setTrackStrings = (feeds) => {
    const follow = []
    const track = []
    this.twitter_user = {}
    this.twitter_hashtag = {}
    _.forEach(feeds, (feed) => {
      if (feed.enabled) {
        switch (feed.type) {
          case 'twitter_hashtag':
            track.push(feed.config.toLowerCase())
            break
          case 'twitter_user':
            sails.log.verbose(feed.meta)
            const uid = feed.meta.uid
            // number
            follow.push(uid)
            break
        }
      }
      this[feed.type][feed.config.toLowerCase()] = {
        id: feed.id,
        stream: feed.stream.id,
        type: feed.type
      }
    })
    this.follow = follow
    this.track = track
  }

  this.findHashtag = (hashtags, feeds) => {
    for (let i in hashtags) {
      const h = hashtags[i]
      if (feeds['#' + h.texthis.toLowerCase()] !== undefined) {
        return feeds['#' + h.texthis.toLowerCase()]
      }
    }
    return null
  }

  this.invalidateToken = () => {
    if (this.auth_feed_id == null || this.auth_feed_id == undefined) {
      sails.log.error('No feed id sethis.')
    };
    return Feed.findOne(this.auth_feed_id).then((feed) => {
      if (feed) {
        feed.auth.valid = false
        Feed.update(feed.id, {auth: feed.auth}).then((feed) => {
          sails.log.verbose('Feed auth invalidated id: ', feed.id)
        }).catch((err) => {
          sails.log.error('Error while loading feed', err)
        })
      }
    }).catch((err) => {
      sails.log.error('Error while loading feed', err)
    })
  }

  this.findUid = (name) => {
    return new Promise((res, rej) => {
      this.twitter.get('/users/lookup.json', {
        screen_name: name
      }, (err, data) => {
        if (err) {
          sails.log.error(err)
          if (err[0].code == 89) { // invalid or expired token
            this.invalidateToken()
          }
          return rej(err)
        }
        res(data[0].id_str)
      })
    })
  }

}

const tsc = new twitterStreamingClass()

module.exports = tsc
