/**
 * InstagramController
 *
 * @description :: Server-side logic for managing Instagra
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
  callback: function(req, res) {
    var mode = req.param('hub.mode')
    var challenge = req.param('hub.challenge')
    var verify_token = req.param('hub.verify_token')
    sails.log.verbose(
      'mode, challenge, verify_token',
      mode,
      challenge,
      verify_token
    )
    if (mode !== 'subscribe') {
      return res.forbidden()
    }
    if (verify_token !== sails.config.auth.instagram_webhook_token) {
      return res.forbidden()
    }
    return res.ok(challenge)
  },

  update: function(req, res) {
    sails.log.verbose('Instagram update', JSON.stringify(req.body))
    req.body.forEach(data => instagramUpdate.update(data))
    return res.ok()
  }
}
