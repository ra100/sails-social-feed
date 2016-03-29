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

  '/login': true,
  '/register': ['passport', 'sessionAuth', 'isAdmin'],

  AuthController: {
    '*': ['passport']
  },

  UserController: {
    'view': ['passport', 'sessionAuth'],
    'create': ['passport', 'sessionAuth', 'isAdmin'],
    'update': ['passport', 'sessionAuth', 'editSelf'],
    'destroy': ['passport', 'sessionAuth', 'isAdmin'],
    'cancreate': ['passport', 'sessionAuth', 'isAdmin'],
    'canmodify': ['passport', 'sessionAuth', 'editSelf'],
    'candestroy': ['passport', 'sessionAuth', 'isAdmin'],
  },

  StreamController: {
    'cancreate': ['passport', 'sessionAuth', 'isEditor'],
    'canmodify': ['passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'create': ['passport', 'sessionAuth', 'isEditor'],
    'view': ['passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'update': ['passport', 'sessionAuth', 'isEditor', 'isOwner'],
    'destroy': ['passport', 'sessionAuth', 'isEditor', 'isOwner']
  },

  GroupController: {
    'view': ['passport', 'sessionAuth'],
    'create': ['passport', 'sessionAuth', 'isAdmin'],
    'destroy': ['passport', 'sessionAuth', 'isAdmin'],
    'cancreate': ['passport', 'sessionAuth', 'isAdmin'],
    'canmodify': ['passport', 'sessionAuth', 'isAdmin'],
    'candestroy': ['passport', 'sessionAuth', 'isAdmin'],
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
