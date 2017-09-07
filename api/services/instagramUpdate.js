const ig = require('instagramapi').instagram()
const request = require('superagent')
const INSTAGRAM_SUBSCRIBE_API = 'https://api.instagram.com/v1/subscriptions/'

ig.use({
  client_id: sails.config.auth.instagram_client_id,
  client_secret: sails.config.auth.instagram_client_secret
})

const update = data => {
  if (data.changed_aspect !== 'media' || data.object !== 'user') {
    return
  }
  const userId = data.object_id
  const mediaId = data.data.media_id
  return Passport.find({provider: 'instagram'}).then(users => {
    tryMedia(mediaId, users, 0)
  })
    .catch(sails.log.error)
}

const tryMedia = (mediaId, users, index) => {
  sails.log.verbose('User with token found:', users[index])
  const access_token = users[index].tokens.accessToken
  sails.log.verbose('Instagram getting media id', mediaId)
  ig.media(mediaId, {access_token}, (err, media, remaining, limit) => {
    if (err)  {
      sails.log.error('Instagram media error', err)
      if (err.error_type === 'OAuthAccessTokenException' || err.error_type === 'OAuthPermissionsException') {
        if (users.length > index -1) {
          // Try another token if current is invalid
          const i = index + 1
          return tryMedia(mediaId, users, i)
        }
        sails.log.warn('No more tokens to choose from')
        return
      }
      return
    }
    sails.log.verbose(media)
    const user = media.user
    const newMessage = {
      author: {
        name: user.full_name,
        id: user.id,
        username: user.username,
        picture: user.profile_picture
      },
      created: new Date(media.created_time * 1000) || Date.now(),
      mediaType: media.type,
      link: media.link,
      message: media.caption && media.caption.text || '',
      metadata: {
        likes: media.likes.count,
        comments: media.comments.count,
        tags: media.tags,
        media: {
          images: media.images,
          carousel_media: media.carousel_media,
          videos: media.videos,
        }
      }
    }
    sails.log.verbose('Instagram message to save', JSON.stringify(newMessage))
    Message.findOne({uuid: {endsWith: media.id}}).then(msg => {
      if (msg) {
        return Message.update({uuid: msg.uuid}, newMessage).then(messages => {
          if (messages.length > 0) {
            sails.log.verbose('Message updated id:', messages[0].id)
          }
        })
      } else {
        Feed.findOne({config: user.username, type: 'instagram_user', enabled: true}).populate('stream').then(feed => {
          if (!feed) {
            return sails.log.error('No instagram feeds found')
          }
          newMessage.uuid = `${feed.stream.id}_${media.id}`
          newMessage.feed = feed.id,
          sails.log.verbose('Instagram message to save', JSON.stringify(newMessage))
          Message.create(newMessage).then(createdMessage => {
            sails.log.verbose('Message created id:', createdMessage.id)
            sails.log.silly(createdMessage)
          })
        })
      }
    })
      .catch(sails.log.error)
  })
}

// Don't unsubscribe, ever
// const unsubscribe = (feed, values, next) => {
//   sails.log.verbose('Instagram feed unsubscribe', values)
//   if (!feed.meta || !(feed.meta.id || feed.meta.id === 0) || !feed.type === 'instagram_tag') {
//     return next()
//   }
//   ig.del_subscription({id: feed.meta.id}, (err, subscriptions, limit) => {
//     sails.log.verbose(subscriptions)
//     if (err) {
//       sails.log.error(err)
//     }
//     return next()
//   })
// }

const subscribe = (feed, values, next) => {
  const type = values.type.replace('instagram_', '')
  sails.log.verbose('Instragram feed subscribe', feed, 'values', values)
  sails.log.verbose('Subscribe to ', type)
  sails.log.verbose('Instagram callback URL', `${sails.config.baseurl}/instagram/callback`)
  sails.log.verbose('Instagram verify token', sails.config.auth.instagram_webhook_token)
  ig.add_user_subscription(
    `${sails.config.baseurl}/instagram/callback`,
    {verify_token: sails.config.auth.instagram_webhook_token},
    (err, result, remaining, limit) => {
      if (err) {
        sails.log.error(err)
        return next(err)
      }
      sails.log.verbose(result)
      // subscription ID
      values.meta = {id: result.id}
      return next()
    })
}

module.exports = {
  update,
  // unsubscribe,
  subscribe
}
