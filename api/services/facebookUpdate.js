const {Facebook} = require('fb')
const fb = new Facebook({
  version: `v${sails.config.auth.facebook_api_version}`,
  appId: sails.config.auth.facebook_app_id,
  appSecret: sails.config.auth.facebook_app_secret
})

const status = (status, feedId) => {
  const itemType = status.item
  if (status.verb === 'remove') {
    return Message.destroy({
      where: {
        uuid: {
          endsWith: status.post_id
        }
      }
    }).then(function (message) {
      sails.log.verbose('Message destroyed', message)
    }).catch(function (err) {
      sails.log.error('Destroying message failed', err)
    })
  }
  // Create or update message
  let exists = false
  if (['add', 'edited'].includes(status.verb)) {
    Feed.findOne({where: {config: feedId, enabled: true}}).populate('stream').then(feed => {
      if (!feed) {
        throw {error: 'Feed for webhook not found', id: feedId}
      }
      const uuid = `${feed.stream.id}_${status.post_id}`
      return Message.findOne({uuid: uuid}).then(msg => {
        if (msg) {
          exists = true
          msg.published = (status.published === 1)
          return msg
        }
        return message = {
          stream: feed.stream,
          feedType: feed.type,
          feed: feed.id,
          message: status.message || '',
          uuid: uuid,
          created: status.created_time ? new Date(status.created_time * 1000) : new Date(),
          link: '',
          author: {},
          metadata: {likes: 0, comments: 0, media: null},
          mediaType: 'text',
          published: (status.published === 1)
        }
      })
    })
    .then(message => {
      const authorPromise = getUserDetails(status.sender_id)
      const metaPromise = getMeta(status.post_id)
      const videoPromise = getVideoEmbed(status)
      return Promise.all([authorPromise, metaPromise, videoPromise]).then(values => {
        const author = values[0]
        const meta = values[1]
        const video = values[2]
        message.author = author
        message.metadata.media = meta.metadata
        message.metadata.video = video
        message.link = meta.link
        message.mediaType = meta.mediaType
        message.message = meta.message || ''
        return message
      })
    })
    .then(message => {
      if (exists) {
        return Message.update({uuid: message.uuid}, message).then(messages => {
          if (messages.length > 0) {
            sails.log.verbose('Message updated id:', messages[0].id)
          } else {
            sails.log.warn('Message not found during update:', message.uuid)
          }
        })
        .catch(err => {
          throw err
        })
      }
      return Message.create(message).then(createdMessage => {
        sails.log.verbose('Message created id:', createdMessage.id)
        sails.log.silly(createdMessage)
      })
      .catch(function (err) {
        if (err) {
          if (err.code == 'E_VALIDATION') {
            throw {message: 'UUID already exists', error: err}
          }
        }
        sails.log.verbose('Creating message failed', err)
      })
    })
    .catch(sails.log.warn)
  }
}

const reaction = (status, feedId) => {
  Message.findOne({uuid: {endsWith: status.post_id}}).then(message => {
    if (!message) {
      return Promise.reject('Message not found', status.post_id)
    }
    if (status.verb === 'add') {
      message.metadata.likes += 1
    } else if (status.verb === 'remove') {
      message.metadata.likes -= 1
    } else {
      return getReactions(status.post_id).then(count => {
        message.metadata.likes = count
        return message
      })
    }
    return Promise.resolve(message)
  })
  .then(message => {
    Message.update({where: {uuid: {endsWith: status.post_id}}, limit: 1}, message).then(updatedMessages => {
      sails.log.verbose('Messages updated:', updatedMessages)
    })
  })
}

const comment = (status, feedId) => {
  Message.findOne({uuid: {endsWith: status.post_id}}).then(message => {
    if (!message) {
      return Promise.reject('Message not found', status.post_id)
    }
    if (status.verb === 'add') {
      message.metadata.comments += 1
    } else if (status.verb === 'remove') {
      message.metadata.comments -= 1
    } else {
      return getComments(status.post_id).then(count => {
        message.metadata.comments = count
        return message
      })
    }
    return Promise.resolve(message)
  })
  .then(message => {
    Message.update({where: {uuid: {endsWith: status.post_id}}, limit: 1}, message).then(updatedMessages => {
      sails.log.verbose('Messages updated:', updatedMessages)
    })
  })
}

const getReactions = id => {
  fb.setAccessToken(`${sails.config.auth.facebook_app_id}|${sails.config.auth.facebook_app_secret}`)
  return new Promise((resolve, reject) => {
    fb.api(`/${id}/reactions`, 'get', {summary: true}, result => {
      if (!result.summary) {
        return reject(result)
      }
      sails.log.silly('Reactions summary', result.summary)
      resolve(result.summary.total_count)
    })
  })
}

const getComments = id => {
  fb.setAccessToken(`${sails.config.auth.facebook_app_id}|${sails.config.auth.facebook_app_secret}`)
  return new Promise((resolve, reject) => {
    fb.api(`/${id}/comments`, 'get', {summary: true}, result => {
      if (!result.summary) {
        return reject(result)
      }
      resolve(result.summary.total_count)
    })
  })
}

const getUserDetails = id => {
  fb.setAccessToken(`${sails.config.auth.facebook_app_id}|${sails.config.auth.facebook_app_secret}`)
  return new Promise((resolve, reject) => {
    fb.api(`/${id}`, 'get', {fields: ['name', 'picture', 'link']}, result => {
      if (!result.id) {
        reject({error: 'Error getting User Details', result})
      }
      resolve({
        name: result.name,
        handle: result.id,
        url: result.link,
        id: result.id,
        picture: (result.picture && result.picture.data) ? result.picture.data.url : ''
      })
    })
  })
}

const getMeta = id => {
  fb.setAccessToken(`${sails.config.auth.facebook_app_id}|${sails.config.auth.facebook_app_secret}`)
  return new Promise((resolve, reject) => {
    fb.api(`/${id}`, 'get', {fields: ['permalink_url', 'message', 'attachments']}, result => {
      if (!result.id) {
        reject({error: result})
      }
      let type = 'text'
      if (result.attachments) {
        result.attachments.data.forEach(d => {
          switch(d.type) {
            case 'share':
              type = 'link'
              break
            case 'video_inline':
              type = 'video'
              break
            case 'photo':
              type = 'picture'
              break
            case 'album':
              type = 'album'
              break
          }
        })
      }
      resolve({
        link: result.permalink_url,
        metadata: (result.attachments) ? result.attachments.data : null,
        message: result.message,
        mediaType: type
      })
    })
  })
}

const getVideoEmbed = value => {
  fb.setAccessToken(`${sails.config.auth.facebook_app_id}|${sails.config.auth.facebook_app_secret}`)
  return new Promise((resolve, reject) => {
    if (!value.video_id) {
      return resolve({})
    }
    const id = value.video_id
    fb.api(`/${id}`, 'get', {fields: ['length', 'embeddable', 'description', 'format', 'permalink_url']}, result => {
      if (!result.id) {
        reject({error: result})
      }
      if (!result.embeddable) {
        resolve({})
      }
      resolve(result)
    })
  })
}

const unsubscribe = (feed, values, next) => {
  if (!feed.auth || !feed.auth.valid) {
    return next()
  }
  fb.setAccessToken(feed.auth.access_token)
  fb.api(`/${feed.config}/subscribed_apps`, 'delete', {}, result => {
    sails.log.verbose('Facebook webhook unsubscribe', result)
    if (!result.success) {
      sails.log.verbose('Usubscribe failed', result)
      return next({error: result})
    }
    values.auth = {
      valid: false
    }
    return next()
  })
}

const update = body => {
  sails.log.verbose('update', JSON.stringify(body))
  const type = `facebook_${body.object}`
  const entry = body.entry
  entry.forEach(e => {
    const id = e.id
    e.changes.forEach(change => {
      switch(change.value.item) {
        case 'status':
        case 'photo':
        case 'share':
        case 'video':
        case 'post':
          status(change.value, id)
          break
        case 'reaction':
          reaction(change.value, id)
        case 'comment':
          comment(change.value, id)
        default: return
      }
    })
  })
}

module.exports = {
  unsubscribe,
  update
}
