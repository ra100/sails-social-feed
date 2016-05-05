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
    'metric',
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

  '/login': ['metric', true],
  '/register': ['metric', 'passport', 'sessionAuth', 'isAdmin'],

  AuthController: {
    '*': ['metric', 'passport']
  },

  UserController: {
    'view': ['metric', 'passport', 'sessionAuth'],
    'create': ['metric', 'passport', 'sessionAuth', 'isAdmin'],
    'update': ['metric', 'passport', 'sessionAuth', 'editSelf'],
    'destroy': ['metric', 'passport', 'sessionAuth', 'isAdmin'],
    'cancreate': ['metric', 'passport', 'sessionAuth', 'isAdmin'],
    'canmodify': ['metric', 'passport', 'sessionAuth', 'editSelf'],
    'candestroy': ['metric', 'passport', 'sessionAuth', 'isAdmin'],
    'unsubscribe': ['metric', true]
  },

  StreamController: {
    'definition': ['metric', 'passport', 'sessionAuth', 'isEditor'],
    'cancreate': ['metric', 'passport', 'sessionAuth', 'isEditor'],
    'canmodify': ['metric', 'passport', 'sessionAuth', 'isOwner'],
    'create': ['metric', 'passport', 'sessionAuth', 'isEditor'],
    'view': ['metric', 'passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'update': ['metric', 'passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'destroy': ['metric', 'passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'public': ['metric', true],
    'unsubscribe': ['metric', true],
    'messages': ['metric', true]
  },

  FeedController: {
    'definition': ['metric', 'passport', 'sessionAuth', 'isEditor'],
    'cancreate': ['metric', 'passport', 'sessionAuth', 'isEditor'],
    'canmodify': ['metric', 'passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'create': ['metric', 'passport', 'sessionAuth', 'isEditor'],
    'view': ['metric', 'passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'update': ['metric', 'passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'destroy': ['metric', 'passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'unsubscribe': ['metric', true]
  },

  GroupController: {
    'view': ['metric', 'passport', 'sessionAuth'],
    'create': ['metric', 'passport', 'sessionAuth', 'isAdmin'],
    'destroy': ['metric', 'passport', 'sessionAuth', 'isAdmin'],
    'cancreate': ['metric', 'passport', 'sessionAuth', 'isAdmin'],
    'canmodify': ['metric', 'passport', 'sessionAuth', 'isAdmin'],
    'candestroy': ['metric', 'passport', 'sessionAuth', 'isAdmin'],
    'unsubscribe': ['metric', true]
  }

  /***************************************************************************
   *                                                                          *
   * Here's an example of mapping some policies to run before a controller    *
   * and its actions                                                          *
   *                                                                          *
   ***************************************************************************/
  // RabbitController: {

  // Apply the `false` policy as the default for all of RabbitController's actions
  // (`false` prevents all access, which ensures that nothing bad happens to our rabbits)
  // '*': false,

  // For the action `nurture`, apply the 'isRabbitMother' policy
  // (this overrides `false` above)
  // nurture	: 'isRabbitMother',

  // Apply the `isNiceToAnimals` AND `hasRabbitFood` policies
  // before letting any users feed our rabbits
  // feed : ['isNiceToAnimals', 'hasRabbitFood']
  // }
};
