/**
 * OembedController
 *
 * @description :: Server-side logic for managing Oembeds
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const request = require('superagent')
const MetaInspector = require('node-metainspector')
const urlEmbed = require('url-embed')
const { Facebook } = require('fb')

const fb = new Facebook({
  version: `v${sails.config.auth.facebook_api_version}`,
  appId: sails.config.auth.facebook_app_id,
  appSecret: sails.config.auth.facebook_app_secret
})
fb.setAccessToken(`${sails.config.auth.facebook_app_id}|${sails.config.auth.facebook_app_secret}`)

const permalinkPattern = /permalink\S*fbid=(\d+)\S*;id=(\d+)/g
const postIdPattern = /\/posts\/(\d+)/g
const fbpostPatterns = [
  /^https:\/\/www\.facebook\.com\/[^\/]+\/posts\/.*/g,
  /^https:\/\/www\.facebook\.com\/[^\/]+\/photos\/.*/g,
  /^https:\/\/www\.facebook\.com\/[^\/]+\/activity\/.*/g,
  /^https:\/\/www\.facebook\.com\/photo\.php\?fbid=.*/g,
  /^https:\/\/www\.facebook\.com\/photos\/.*/g,
  /^https:\/\/www\.facebook\.com\/permalink\.php\?story_fbid=.*/g,
  /^https:\/\/www\.facebook\.com\/media\/set\?set=.*/g,
  /^https:\/\/www\.facebook\.com\/questions\/.*/g,
  /^https:\/\/www\.facebook\.com\/notes\/.*/g
]

const EmbedEngine = urlEmbed.EmbedEngine
const Embed =  urlEmbed.Embed
const engine = new EmbedEngine({
  timeoutMs: 5000,
  referrer: sails.config.baseurl
})
engine.registerDefaultProviders()
const embedOptions = {
  maxHeight: 300
}

const fetchUrl = url => {
  return new Promise((resolve, reject) => {
    const client = new MetaInspector(url, {
      timeout: 5000,
      headers: {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.59 Safari/537.36 Vivaldi/1.7.725.3'}
    })
    client.on('fetch', () => {
      if (client.host === 'www.facebook.com') {
        return resolve({
          url: client.url,
          host: client.host,
          rooturl: client.rootUrl,
          title: client.ogTitle || client.title,
          author: client.author,
          description: client.ogDescription || client.description,
          image: client.image || (client.images && client.images[0]),
          type: client.ogType,
          date: client.ogUpdatedTime,
          provider_name: 'NotAvailable'
        })
      }
      resolve({
        url: client.url,
        host: client.host,
        rooturl: client.rootUrl,
        title: client.ogTitle || client.title,
        author: client.author,
        description: client.ogDescription || client.description,
        image: client.image || (client.images && client.images[0]),
        type: client.ogType,
        date: client.ogUpdatedTime,
        provider_name: 'MetaInspector'
      })
    })
    client.on('error', reject)
    client.fetch()
  })
}

const checkFblink = url =>
  fbpostPatterns.filter(item => {
    const match = url.match(item)
    return match && match.length > 0
  }).length > 0

const fetchFacebook = url =>
  request.get(`https://www.facebook.com/plugins/post/oembed.json/?url=${url}`)
  .then(res => {
    const data = JSON.parse(res.text)
    let match = permalinkPattern.exec(data.html)
    if (match && !match.length > 2 && !match[2]) {
      return {fbid: match[1], id: match[2]}
    }

    // get page ID
    return new Promise((resolve, reject) => {
      fb.api(`/${data.author_url}`, (result, error) => {
        if (error) {
          sails.log.error(error)
          return resolve(data)
        }
        sails.log.verbose(result)
        const match = postIdPattern.exec(data.html)
        if (!match || !match.length > 1) {
          return {provider_name: 'NotAvailable'}
        }
        resolve({fbid: result.id, id: match[1]})
      })
    })
  })
  .then(result => {
    if (result.provider_name) {
      return result
    }
    const id = `${result.fbid}_${result.id}`
    sails.log.verbose('id: ', id)
    // get object type
    return new Promise((resolve, reject) => {
      fb.api(`/${id}`, 'get', {fields: ['type', 'id']},
      (result, error) => {
        if (error) {
          return reject(error)
        }
        sails.log.verbose(result)
        resolve(result)
      })
    })
  })
  .then(data => {
    if (data.provider_name) {
      return data
    }
    return getFBdetails(data.type, data.id)
  })
  .then(data => {
    Oembed.create({url, json: data}).then(oe => {
      sails.log.verbose('Extraction saved', oe)
    })
    return data
  })
  .catch(err => {
    if (err.status === 404) {
      return { provider_name: 'NotAvailable' }
    }
    throw err
  })

const getFBdetails = (type, id) => {
  const getPhotoData = id =>
    new Promise((resolve, reject) => {
      sails.log.verbose('Facebook ID', id)
      fb.api(`/${id}`, 'get', {fields: [
        'images',
        'link',
        'height',
        'width',
        'from{id,name,picture,link}',
        'name',
        'picture',
        'id']},
        (result, err) => {
          if (err) {
            return reject(err)
          }
          sails.log.verbose(result)
          resolve({
            provider_name: 'Facebook',
            provider_url: 'https://www.facebook.com',
            author_name: result.from.name,
            author_url: result.from.link,
            author_id: result.from.id,
            title: result.name,
            media_id: result.id,
            images: result.images,
            width: result.width,
            height: result.height,
            url: result.link
          })
        })
    })

  const getStatusData = id =>
      new Promise((resolve, reject) => {
        sails.log.verbose('Facebook ID', id)
        fb.api(`/${id}`, 'get', {fields: [
          'message',
          'link',
          'height',
          'width',
          'from{id,name,picture,link}',
          'name',
          'picture',
          'permalink_url',
          'id']},
          (result, err) => {
            if (err) {
              return reject(err)
            }
            sails.log.verbose(result)
            resolve({
              provider_name: 'Facebook',
              provider_url: 'https://www.facebook.com',
              author_name: result.from.name,
              author_url: result.from.link,
              author_id: result.from.id,
              title: result.name,
              media_id: result.id,
              url: result.permalink_url,
              text: result.message
            })
          })
      })
  const types = {
    photo: getPhotoData,
    status: getStatusData
  }
  if (!types[type]) {
    return new Promise((resolve, reject) => ({error: 'Fb Type not found'}))
  }
  return types[type](id)
}

module.exports = {
  // @TODO remove as it's obsolete
  youtube: function (req, res) {
    var url = req.param('url')
    if (typeof url !== 'string') {
      return res.badRequest()
    }
    Oembed.findOne({where: {url: url}}).then(oembed => {
      if (oembed) {
        return res.json(oembed.json)
      }
      return request.get('https://www.youtube.com/oembed?format=json&url=' + url)
    }).then(result => {
      Oembed.create({url, json: result.body})
      return res.json(result.body)
    }).catch(err => {
      return res.serverError(err)
    })
  },

  embed: function (req, res) {
    const url = req.param('url')
    if (typeof url !== 'string') {
      return res.badRequest()
    }
    Oembed.findOne({where: {url: url}})
    .then(oembed => {
      if (oembed) {
        return oembed.json
      }
      return new Promise((resolve, reject) => {
        const check = checkFblink(url)
        if (checkFblink(url)) {
          sails.log.verbose('FBlink found', url)
          return fetchFacebook(url).then(resolve).catch(reject)
        }
        const embed = new Embed(url, embedOptions)
        engine.getEmbed(embed, res => {

          if (res.error) {
            sails.log.warn(res.error)
            return resolve(fetchUrl(url).then(data => {
              Oembed.create({url, json: data}).then(oe => {
                sails.log.verbose('Extraction saved', oe)
              })
              return data
            }))
          }

          sails.log.verbose(res)

          Oembed.create({url, json: res.data}).then(oe => {
            sails.log.verbose('Oembed saved', oe)
          })
          .catch(sails.log.error)

          resolve(res.data)
        })
      })
    }).then(result => {
      return res.json(result)
    }).catch(err => {
      return res.serverError(err)
    })
  }
}
