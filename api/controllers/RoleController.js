/**
 * RoleController
 *
 * @description :: Server-side logic for managing roles
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  /**
   * Unsubscribe from rooms related to this item
   */
  unsubscribe: function(req, res, next) {
    if (!req.isSocket) {
      return res.badRequest()
    } else {
      var id = req.param('id') ? req.param('id') : ''
      socialFeed.unsubscribe(req, res, 'role', id)
    }
  }
}

