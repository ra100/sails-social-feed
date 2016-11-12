var perms = require('../../assets/app/permissions.js')

/**
 * Add permissions to object based on user role, group and ownership.
 */
module.exports = {
  addPermissions(obj, model, user) {
    var result = {
      c: false,
      r: false,
      u: false,
      d: false
    }
    for (var i in user.roles) {
      if (typeof user.roles[i] == 'object') {
        var role = user.roles[i].name
        p = perms[role][model]
        if ((model == 'user' && obj.id == user.id) || (model != 'user' && obj.owner && obj.owner.id == user.id)) {
          sails.log.verbose('Permissions IS OWNER')
          result = this.joinPermissions(result, p.own)
        } else if (this.hasGroups(obj, user)) {
          sails.log.verbose('Permissions HAS GROUP')
          result = this.joinPermissions(result, p.group)
        } else {
          sails.log.verbose('Permissions IS NOTHING')
          result = this.joinPermissions(result, p.all)
        }
      }
    }
    obj.permissions = result
  },
  hasGroups(obj, user) {
    var ug = []
    for (var group of user.groups) {
      if (typeof group == 'object') {
        ug.push(group.id)
      }
    }
    for (var group of obj.groups) {
      if (ug.indexOf(group.id) >= 0) {
        return true
      }
    }
    return false
  },
  joinPermissions(o, e) {
    return {
      c: e.c || o.c,
      r: e.r || o.r,
      u: e.u || o.u,
      d: e.d || o.d
    }
  },
  setPermissions(objects, model, user) {
    for (var i in objects) {
      this.addPermissions(objects[i], model, user)
    }
  }
}