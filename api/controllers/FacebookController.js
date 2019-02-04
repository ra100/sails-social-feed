/**
 * FacebookController
 *
 * @description :: Server-side logic for managing Facebooks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
  callback: function(req, res) {
    var mode = req.param('hub.mode')
    var challenge = req.param('hub.challenge')
    var verify_token = req.param('hub.verify_token')
    if (mode !== 'subscribe') {
      return res.forbidden()
    }
    if (verify_token !== sails.config.auth.facebook_webhook_token) {
      return res.forbidden()
    }
    return res.ok(challenge)
  },

  update: function(req, res) {
    facebookUpdate.update(req.body)
    return res.ok()
  }
}
