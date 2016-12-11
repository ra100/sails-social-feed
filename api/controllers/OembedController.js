/**
 * OembedController
 *
 * @description :: Server-side logic for managing Oembeds
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var request = require('superagent')

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
      return res.json(result.body)
    }).catch(err => {
      return res.serverError(err)
    })
  }
}
