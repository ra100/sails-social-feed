/**
 * OembedController
 *
 * @description :: Server-side logic for managing Oembeds
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var request = require('superagent')
var oembetter = require('oembetter')()
oembetter.whitelist([
  ...oembetter.suggestedWhitelist,
  'facebook.com',
  'spotify.com',
  'rozhlas.cz']
)
oembetter.endpoints([
  ...oembetter.suggestedEndpoints,
  {domain: 'facebook.com', endpoint: 'https://www.facebook.com/plugins/post/oembed.json'}
])

module.exports = {
  youtube: function (req, res) {
    var url = req.param('url')
    if (typeof url !== 'string') {
      return res.badRequest()
    }
    Oembed.findOne({url: url}).then(oembed => {
      if (oembed) {
        return res.json(oembed.json)
      }
      return request.get('https://www.youtube.com/oembed?format=json&url=' + url)
    }).then(result => {
      // Oembed.create({url, json: result.body})
      return res.json(result.body)
    }).catch(err => {
      return res.serverError(err)
    })
  },

  embed: function (req, res) {
    var url = req.param('url')
    if (typeof url !== 'string') {
      return res.badRequest()
    }
    Oembed.findOne({url: url}).then(oembed => {
      if (oembed) {
        return res.json(oembed.json)
      }
      return new Promise((resolve, reject) => {
        oembetter.fetch(url, (err, response) => {
          if (err) {
            reject(err)
          }
          sails.log.verbose(response)
          resolve(response)
        })
      })
    }).then(result => {
      // Oembed.create({url, json: result})
      return res.json(result)
    }).catch(err => {
      return res.serverError(err)
    })
  }
}
