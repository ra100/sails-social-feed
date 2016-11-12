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
    if (typeof url == 'string') {
      request.get('https://www.youtube.com/oembed?format=json&url=' + url).end((err, result) => {
        if (err || !result.ok) {
          return res.serverError(err)
        }
        return res.json(result.body)
      })
    } else {
      return res.badRequest()
    }
  }
}
