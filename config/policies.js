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
    // 'localize',
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

  '/login': [true],
  '/register': ['passport', 'sessionAuth', 'isAdmin'],

  AuthController: {
    '*': ['passport']
  },

  UserController: {
    'me': ['passport', 'sessionAuth'],
    'view': ['passport', 'sessionAuth'],
    'create': ['passport', 'sessionAuth', 'isAdmin'],
    'update': ['passport', 'sessionAuth', 'editSelf'],
    'destroy': ['passport', 'sessionAuth', 'isAdmin'],
    'cancreate': ['passport', 'sessionAuth', 'isAdmin'],
    'canmodify': ['passport', 'sessionAuth', 'editSelf'],
    'candestroy': ['passport', 'sessionAuth', 'isAdmin'],
    'unsubscribe': [true]
  },

  StreamController: {
    'definition': ['passport', 'sessionAuth', 'isEditor'],
    'cancreate': ['passport', 'sessionAuth', 'isEditor'],
    'canmodify': ['passport', 'sessionAuth', 'isOwner'],
    'create': ['passport', 'sessionAuth', 'isEditor'],
    'view': ['passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'update': ['passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'destroy': ['passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'public': [true],
    'unsubscribe': [true],
    'messages': [true]
  },

  MessageController: {
    '*': ['passport', 'sessionAuth', 'isEditor'],
    'unsubscribe': [true],
    'submit': ['passport', 'sessionAuth', 'rateLimit']
  },

  FeedController: {
    'definition': ['passport', 'sessionAuth', 'isEditor'],
    'cancreate': ['passport', 'sessionAuth', 'isEditor'],
    'canmodify': ['passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'create': ['passport', 'sessionAuth', 'isEditor'],
    'view': ['passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'update': ['passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'destroy': ['passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'unsubscribe': [true]
  },

  GroupController: {
    'view': ['passport', 'sessionAuth'],
    'create': ['passport', 'sessionAuth', 'isAdmin'],
    'destroy': ['passport', 'sessionAuth', 'isAdmin'],
    'cancreate': ['passport', 'sessionAuth', 'isAdmin'],
    'canmodify': ['passport', 'sessionAuth', 'isAdmin'],
    'candestroy': ['passport', 'sessionAuth', 'isAdmin'],
    'unsubscribe': [true]
  },

  OembedController: {
    '*': [true]
  },

  FacebookController: {
    '*': [true]
  }
}
