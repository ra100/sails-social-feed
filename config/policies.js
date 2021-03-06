/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#!/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.policies.html
 */

module.exports.policies = {

  /***************************************************************************
   *                                                                          *
   * Default policy for all controllers and actions (`true` allows public     *
   * access)                                                                  *
   *                                                                          *
   ***************************************************************************/

  '*': false,
  // '*': [
  //   'localize',
  //   // 'basicAuth',
  //   'passport',
  //   'sessionAuth',
  //   // 'ModelPolicy',
  //   // 'AuditPolicy',
  //   // 'OwnerPolicy',
  //   // 'PermissionPolicy',
  //   // 'RolePolicy',
  //   // 'CriteriaPolicy',
  // ],

  '/login': ['localize', true],
  '/register': ['localize', 'passport', 'sessionAuth', 'isAdmin'],

  AuthController: {
    '*': ['localize', 'passport', true]
  },

  UserController: {
    '*': ['localize', 'passport', 'sessionAuth'],
    'me': ['localize', 'passport', 'sessionAuth'],
    'updateme': ['localize', 'passport', 'sessionAuth'],
    'create': ['localize', 'passport', 'sessionAuth', 'isAdmin'],
    'update': ['localize', 'passport', 'sessionAuth', 'editSelf'],
    'destroy': ['localize', 'passport', 'sessionAuth', 'isAdmin'],
    'cancreate': ['localize', 'passport', 'sessionAuth', 'isAdmin'],
    'canmodify': ['localize', 'passport', 'sessionAuth', 'editSelf'],
    'candestroy': ['localize', 'passport', 'sessionAuth', 'isAdmin'],
    'unsubscribe': [true]
  },

  StreamController: {
    '*': ['localize', 'passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'definition': ['localize', 'passport', 'sessionAuth', 'isEditor'],
    'cancreate': ['localize', 'passport', 'sessionAuth', 'isEditor'],
    'canmodify': ['localize', 'passport', 'sessionAuth', 'isOwner'],
    'create': ['localize', 'passport', 'sessionAuth', 'isEditor'],
    'update': ['localize', 'passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'destroy': ['localize', 'passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'public': ['localize', true],
    'unsubscribe': ['localize', true],
    'messagecount': ['localize', true],
    'messages': ['localize', true],
    'adminMessages': ['localize', 'passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'findOne': ['localize', 'passport', 'sessionAuth', 'isEditor']
  },

  MessageController: {
    '*': ['localize', 'passport', 'sessionAuth', 'isEditor'],
    'submit': ['localize', 'passport', 'sessionAuth', 'rateLimit'],
    'update': ['localize', 'passport', 'sessionAuth', 'isEditor'],
    'unsubscribe': ['localize', true],
  },

  FeedController: {
    '*': ['localize', 'passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'definition': ['localize', 'passport', 'sessionAuth', 'isEditor'],
    'cancreate': ['localize', 'passport', 'sessionAuth', 'isEditor'],
    'canmodify': ['localize', 'passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'create': ['localize', 'passport', 'sessionAuth', 'isEditor'],
    'update': ['localize', 'passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'destroy': ['localize', 'passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'unsubscribe': ['localize', true]
  },

  GroupController: {
    '*': ['localize', 'passport', 'sessionAuth'],
    'create': ['localize', 'passport', 'sessionAuth', 'isAdmin'],
    'destroy': ['localize', 'passport', 'sessionAuth', 'isAdmin'],
    'cancreate': ['localize', 'passport', 'sessionAuth', 'isAdmin'],
    'canmodify': ['localize', 'passport', 'sessionAuth', 'isAdmin'],
    'candestroy': ['localize', 'passport', 'sessionAuth', 'isAdmin'],
    'unsubscribe': ['localize', true]
  },

  RoleController: {
    '*': ['localize', 'passport', 'sessionAuth'],
    'create': ['localize', 'passport', 'sessionAuth', 'isAdmin'],
    'destroy': ['localize', 'passport', 'sessionAuth', 'isAdmin'],
    'cancreate': ['localize', 'passport', 'sessionAuth', 'isAdmin'],
    'canmodify': ['localize', 'passport', 'sessionAuth', 'isAdmin'],
    'candestroy': ['localize', 'passport', 'sessionAuth', 'isAdmin'],
    'unsubscribe': ['localize', true]
  },

  OembedController: {
    '*': ['localize', true]
  },

  FacebookController: {
    '*': true
  },

  InstagramController: {
    '*': true
  }
}
