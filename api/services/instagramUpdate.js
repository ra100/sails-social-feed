const ig = require('instagram-node').instagram()
const request = require('superagent')
const INSTAGRAM_SUBSCRIBE_API = 'https://api.instagram.com/v1/subscriptions/'

ig.use({
  client_id: sails.config.auth.instagram_client_id,
  client_secret: sails.config.auth.instagram_client_secret
})

const update = body => {
  sails.log.verbose('update', JSON.stringify(body))
}

const unsubscribe = (feed, values, next) => {
  if (!feed.meta || !feed.meta.id || !feed.type === 'instagram_tag') {
    return next()
  }
  ig.del_subscription({id: feed.meta.id}, (err, subscriptions, limit) => {
    sails.log.verbose(subscriptions)
    if (err) {
      sails.log.error(err)
    }
    return next()
  })
}

const subscribe = (feed, values, next) => {
  const type = values.type.replace('instagram_', '')
  sails.log.verbose('Subscribe to ' + type)
  ig.add_user_subscription(
    `${sails.config.baseurl}/instagram/callback`,
    [{verify_token: sails.config.auth.instagram_webhook_token}],
    (err, result, remaining, limit) => {
      if (err) {
        sails.log.error(err)
        return next(err)
      }
      sails.log.verbose(result)
      const id = result.data && result.data.id
      values.meta = {id}
      return next()
    })
}

module.exports = {
  update,
  unsubscribe,
  subscribe
}
