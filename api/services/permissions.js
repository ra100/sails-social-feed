var perms = require('../../assets/app/permissions.js')

const joinPermissions = (o, e) => ({
  c: e.c || o.c,
  r: e.r || o.r,
  u: e.u || o.u,
  d: e.d || o.d
})

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
        const role = user.roles[i].name
        const p = perms[role][model]
        if (
          (model == 'user' && obj.id == user.id) ||
          (model != 'user' && obj.owner && obj.owner.id == user.id)
        ) {
          sails.log.verbose('Permissions IS OWNER')
          result = joinPermissions(result, p.own)
        } else if (this.hasGroups(obj, user)) {
          sails.log.verbose('Permissions HAS GROUP')
          result = joinPermissions(result, p.group)
        } else {
          sails.log.verbose('Permissions IS NOTHING')
          result = joinPermissions(result, p.all)
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
  setPermissions(objects, model, user) {
    for (var i in objects) {
      this.addPermissions(objects[i], model, user)
    }
  }
}
