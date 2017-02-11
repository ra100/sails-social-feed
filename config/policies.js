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

  // '*': true,
  '*': [
    'localize',
    // 'basicAuth',
    'passport',
    'sessionAuth',
    // 'ModelPolicy',
    // 'AuditPolicy',
    // 'OwnerPolicy',
    // 'PermissionPolicy',
    // 'RolePolicy',
    // 'CriteriaPolicy',
  ],

  '/login': ['localize', true],
  '/register': ['localize', 'passport', 'sessionAuth', 'isAdmin'],

  AuthController: {
    '*': ['localize', 'passport']
  },

  UserController: {
    'me': ['localize', 'passport', 'sessionAuth'],
    'view': ['localize', 'passport', 'sessionAuth'],
    'create': ['localize', 'passport', 'sessionAuth', 'isAdmin'],
    'update': ['localize', 'passport', 'sessionAuth', 'editSelf'],
    'destroy': ['localize', 'passport', 'sessionAuth', 'isAdmin'],
    'cancreate': ['localize', 'passport', 'sessionAuth', 'isAdmin'],
    'canmodify': ['localize', 'passport', 'sessionAuth', 'editSelf'],
    'candestroy': ['localize', 'passport', 'sessionAuth', 'isAdmin'],
    'unsubscribe': [true]
  },

  StreamController: {
    'definition': ['localize', 'passport', 'sessionAuth', 'isEditor'],
    'cancreate': ['localize', 'passport', 'sessionAuth', 'isEditor'],
    'canmodify': ['localize', 'passport', 'sessionAuth', 'isOwner'],
    'create': ['localize', 'passport', 'sessionAuth', 'isEditor'],
    'view': ['localize', 'passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'update': ['localize', 'passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'destroy': ['localize', 'passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'public': ['localize', true],
    'unsubscribe': ['localize', true],
    'messages': ['localize', true],
    'adminMessages': ['localize', 'passport', 'sessionAuth', 'isEditor', 'isOwner'],
  },

  MessageController: {
    'submit': ['localize', 'passport', 'sessionAuth', 'rateLimit'],
    'unsubscribe': ['localize', true],
    '*': ['localize', 'passport', 'sessionAuth', 'isEditor']
  },

  FeedController: {
    'definition': ['localize', 'passport', 'sessionAuth', 'isEditor'],
    'cancreate': ['localize', 'passport', 'sessionAuth', 'isEditor'],
    'canmodify': ['localize', 'passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'create': ['localize', 'passport', 'sessionAuth', 'isEditor'],
    'view': ['localize', 'passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'update': ['localize', 'passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'destroy': ['localize', 'passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'unsubscribe': ['localize', true]
  },

  GroupController: {
    'view': ['localize', 'passport', 'sessionAuth'],
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
    '*': [true]
  }
}
