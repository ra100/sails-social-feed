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

const FB_TYPE_POST = 'post'
const FB_TYPE_VIDEO = 'video'

const storyPattern = /permalink(?:\.php\?)+\S*fbid=(\d+)\S*(?:;|&)id=(\d+)/g
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
const fbvideoPattern =
  /^https:\/\/www\.facebook\.com\/(?:[^\/]+\/videos\/|video.php\?(?:id|v)=)(\d+)\.*/g

const EmbedEngine = urlEmbed.EmbedEngine
const Embed =  urlEmbed.Embed
const engine = new EmbedEngine({
  timeoutMs: 5000,
  referrer: sails.config.baseurl
})
engine.registerDefaultProviders()
const EMBED_OPTONS = {
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

/**
 * Check if link is FB post
 * @param  {string} url [description]
 * @return {boolean}     [description]
 */
const checkFblink = url =>
  fbpostPatterns.filter(item => {
    const match = url.match(item)
    return match && match.length > 0
  }).length > 0

/**
 * Check if link is FB video
 * @param  {string} url [description]
 * @return {boolean}     [description]
 */
const checkFbvideo = url =>
  url.match(fbvideoPattern) && url.match(fbvideoPattern).length > 0

const fetchFacebook = (url, type) =>
  request.get(`https://www.facebook.com/plugins/${type}/oembed.json/?url=${url}`)
  .then(res => {
    // Extract IDs from url
    let postId = false
    if (type === FB_TYPE_VIDEO) {
      let m = fbvideoPattern.exec(url)
      sails.log.verbose('Matched video url', m)
      if (m && m.length > 1) {
        postId = m[1]
      }
    }
    const data = JSON.parse(res.text)
    sails.log.verbose('FB oembed data', data)
    // Extract IDs from permalink
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
        if (!postId) {
          const match = postIdPattern.exec(data.html)
          sails.log.verbose('Post ID match', match)
          if (!match || !match.length > 1) {
            return {provider_name: 'NotAvailable'}
          }
          postId = match[1]
        }
        resolve({fbid: result.id, id: postId})
      })
    })
  })
  // try to extract fb ids even when embed is not available
  .catch(err => {
    if (err.status == 404) {
      sails.log.verbose('Oembed not found try extract')
      let match = storyPattern.exec(url)
      sails.log.verbose('Finding FB ids in url', match)
      if (match && match.length > 2) {
        return {fbid: match[2], id: match[1]}
      } else {
        return new Promise((resolve, reject) => {
          reject(err)
        })
      }
    } else {
      throw err
    }
  })
  .then(result => {
    if (result.provider_name) {
      return result
    }
    let id = `${result.fbid}_${result.id}`
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
    sails.log.verbose('FB details', data)
    return getFBdetails(data.type, data.id)
  })
  .then(data => {
    Oembed.create({url, json: data}).then(oe => {
      sails.log.verbose('Extraction saved', oe)
    })
    return data
  })
  .catch(err => {
    sails.log.verbose('FB Oembed not found', JSON.stringify(err))
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
        'attachments',
        'link',
        'from{id,name,picture,link}',
        'message',
        'full_picture',
        'id']},
        (result, err) => {
          if (err) {
            return reject(err)
          }
          sails.log.verbose(result)
          const image = result.attachments && result.attachments.data && result.attachments.data[0] && result.attachments.data[0].media && result.attachments.data[0].media.image || {}
          resolve({
            provider_name: 'Facebook',
            provider_url: 'https://www.facebook.com',
            author_name: result.from.name,
            author_url: result.from.link,
            author_id: result.from.id,
            title: result.message,
            media_id: result.id,
            full_picture: result.full_picture,
            image: image.src,
            width: image.width,
            height: image.height,
            url: result.link,
            type: type
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
              text: result.message,
              type: type
            })
          })
      })

  const getVideoData = id =>
    new Promise((resolve, reject) => {
      sails.log.verbose('Facebook ID', id)
      // permalink_url,title,description,embed_html,from{name,link,id,picture},source
      fb.api(`/${id}`, 'get', {fields: [
        'source',
        'permalink_url',
        'message',
        'from{id,name,picture,link}',
        'attachments{media}',
        'id',
        'link']},
        (result, err) => {
          if (err) {
            return reject(err)
          }
          sails.log.verbose(JSON.stringify(result))
          let html = ''
          // facebook video
          if (result.source.includes('fbcdn')) {
            const image = result.attachments && result.attachments.data && result.attachments.data[0] && result.attachments.data[0].media && result.attachments.data[0].media.image || {}
            return resolve({
              provider_name: 'Facebook',
              provider_url: 'https://www.facebook.com',
              author_name: result.from && result.from.name,
              author_url: result.from && result.from.link,
              author_id: result.from && result.from.id,
              title: result.message,
              media_id: result.id,
              image: image.src,
              width: image.width,
              height: image.height,
              url: result.permalink_url,
              html: `<iframe src=\"https://www.facebook.com/video/embed?video_id=${id.split('_')[1]}\" width=\"${image.width}\" height=\"${image.height}\" frameborder=\"0\"></iframe>"`,
              type: type
            })
          }
          // link to youtube video
          if (result.source.includes('youtube')) {
            const embed = new Embed(result.link, EMBED_OPTONS)
            engine.getEmbed(embed, res => {
              sails.log.verbose(JSON.stringify(res))
              return resolve(Object.assign(res.data, {
                provider_name: 'Facebook',
                provider_url: 'https://www.facebook.com',
                author_name: result.from.name,
                author_url: result.from.link,
                author_id: result.from.id,
                title: result.message,
                media_id: result.id,
                url: result.permalink_url,
                type: 'youtube'
              }))
            })
          }
        })
    })

  const getLinkData = id =>
    new Promise((resolve, reject) => {
      sails.log.verbose('Facebook ID', id)
      // permalink_url,title,description,embed_html,from{name,link,id,picture},source
      fb.api(`/${id}`, 'get', {fields: [
        'source',
        'permalink_url',
        'message',
        'from{id,name,picture,link}',
        'attachments{media,description,title}',
        'id',
        'link']},
        (result, err) => {
          if (err) {
            return reject(err)
          }
          sails.log.verbose(JSON.stringify(result))
          let html = ''
          const d = result.attachments && result.attachments.data && result.attachments.data[0] || {}
          return resolve({
            provider_name: 'Facebook',
            provider_url: 'https://www.facebook.com',
            author_name: result.from && result.from.name,
            author_url: result.from && result.from.link,
            author_id: result.from && result.from.id,
            title: result.message,
            media_id: result.id,
            image: d.media && d.media.image && d.media.image.src,
            width: d.media && d.media.image && d.media.image.width,
            height: d.media && d.media.image && d.media.image.height,
            url: result.permalink_url,
            link_description: d.description,
            link_url: result.link,
            link_title: d.title,
            type
          })
        })
    })

  const types = {
    photo: getPhotoData,
    status: getStatusData,
    video: getVideoData,
    link: getLinkData
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
        sails.log.verbose('Embed found in cache')
        return oembed.json
      }
      return new Promise((resolve, reject) => {
        if (checkFblink(url)) {
          sails.log.verbose('FBlink found', url)
          return fetchFacebook(url, FB_TYPE_POST).then(resolve).catch(reject)
        } else if (checkFbvideo(url)) {
          sails.log.verbose('FBvideo found', url)
          return fetchFacebook(url, FB_TYPE_VIDEO).then(resolve).catch(reject)
        }
        const embed = new Embed(url, EMBED_OPTONS)
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
