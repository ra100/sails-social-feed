/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil')

module.exports = {
  cancreate: function (req, res) {
    res.ok({status: 'ok'})
  },
  canmodify: function (req, res) {
    res.ok({status: 'ok'})
  },
  candestroy: function (req, res) {
    res.ok({status: 'ok'})
  },

  /**
   * @override
   */
  create: function (req, res, next) {
    sails.services.passport.protocols.local.register(req, res, function (err, user) {
      if (err) {
        return res.serverError(err)
      }
      sails.log.verbose(user)
      return res.ok(user)
    })
  },

  /**
   * @override
   */
  update: function (req, res, next) {
    var uid = req.param('id'),
      username = req.param('username'),
      displayname = req.param('displayname'),
      password = req.param('password'),
      email = req.param('email'),
      roles = req.param('roles'),
      groups = req.param('groups'),
      image = req.param('image'),
      blocked = req.param('blocked')

    updated = {}
    if (username != undefined && username.length > 0) {
      updated.username = username
    }
    if (displayname != undefined && displayname.length > 0) {
      updated.displayname = displayname
    }
    if (email != undefined && email.length > 0) {
      updated.email = email
    }
    if (roles != undefined && roles.length > 0) {
      updated.roles = roles
    }
    if (groups != undefined && groups.length > 0) {
      updated.groups = groups
    }
    if (image != undefined) {
      updated.image = image
    }
    if (blocked != undefined) {
      updated.blocked = blocked
    }

    socialFeed.isAdmin(req.user.id, req, function (err, u) {
      if (err && updated.roles) {
        return res.forbidden(err)
      }

      User.update({
        id: uid
      }, updated).exec(function (err, user) {
        if (err) {
          return res.negotiate(err)
        }
        if (password != undefined && password.length > 6) {
          Passport.update({
            user: uid,
            protocol: 'local'
          }, {password: password}).exec(function (err, passport) {
            if (err) {
              return res.serverError(err)
            }
            res.ok(user[0])
          })
        } else {
          res.ok(user[0])
        }
      })
    })
  },

  /**
   * @override
   */
  destroy: function (req, res, next) {
    var uid = req.params.id
    if (uid == 1) {
      return res.forbidden()
    } else {
      User.destroy({id: uid}).exec(function (err) {
        if (err) {
          return res.negotiate(err)
        }
        return res.ok()
      })
    }
  },

  me: function (req, res) {
    var user = req.user
    if (user == undefined) {
      return res.json()
    }
    User.findOne({id: user.id}).populate('roles').populate('groups').populate('passports').exec(function (e, r) {
      user = r
      return res.jsonx({
        username: user.username,
        roles: user.roles,
        id: user.id,
        displayname: user.displayname,
        picture: user.picture,
        meta: user.meta,
        protocol: user.passports[0].protocol,
        email: user.email})
    })
  },

  updateme: (req, res) => {
    const uid = req.user.id
    const displayname = req.param('displayname')
    const image = req.param('image')
    const password = req.param('password')
    const oldPassword = req.param('oldPassword')
    const email = req.param('email')

    const updated = {}
    if (displayname && displayname.length > 0) {
      updated.displayname = displayname
    }
    if (image) {
      updated.image = image
    }
    if (email != undefined && email.length > 0) {
      updated.email = email
    }
    const toLog = {...updated, image: updated.image ? 'image present' : null}
    sails.log.verbose(toLog)

    return Promise.all([
      new Promise((resolve, reject) => {
        User.update({
          id: uid
        }, updated).exec((err, user) => {
          if (err) {
            return reject(err)
          }
          return resolve(user[0])
        })
      }),
      new Promise((resolve, reject) => {
        if (password && password.length > 6) {
          sails.log.verbose('Try password change')
          return Passport.findOne({
            user: uid,
            protocol: 'local'
          }).then(passport => {
            sails.log.verbose('Passport found', passport)
            return new Promise((resolve1, reject1) => {
              passport.validatePassword(oldPassword, (err, result) => {
                if (err) {
                  sails.log.error('Password validation error', err)
                  return reject1(err)
                }
                if (!result) {
                  sails.log.verbose('Passport check', result)
                  return reject1(req.__('Error.Passport.Password.Wrong'))
                }
                sails.log.verbose('Passport check passed')
                Passport.update({
                  user: uid,
                  protocol: 'local'
                }, {password: password}).exec((err, result) => {
                  if (err) {
                    return reject1(err)
                  }
                  return resolve1()
                })
              })
            }).catch(reject)
          })
        }
        return resolve()
      })
    ]
    ).then(results => {
      return res.ok()
    }).catch(err => {
      return res.negotiate(err)
    })
  },

  /**
   * Unsubscribe from rooms related to this item
   */
  unsubscribe: function(req, res, next) {
    if (!req.isSocket) {
      return res.badRequest()
    } else {
      var id = req.param('id') ? req.param('id') : ''
      socialFeed.unsubscribe(req, res, 'user', id)
    }
  },

  /**
   * Override default find and add permissions key
   */
  find(req, res) {
    // Look up the model
    const Model = actionUtil.parseModel(req)

    // If an `id` param was specified, use the findOne blueprint action
    // to grab the particular instance with its primary key === the value
    // of the `id` param.   (mainly here for compatibility for 0.9, where
    // there was no separate `findOne` action)
    if (actionUtil.parsePk(req)) {
      return require('./findOne')(req, res)
    }

    let criteria = actionUtil.parseCriteria(req)
    if (req.param('fulltext')) {
      const fulltext = req.param('fulltext')
      criteria = {
        or: [
          {
            'username': {
              'contains': fulltext
            }
          },
          {
            'email': {
              'contains': fulltext
            }
          },
          {
            'displayname': {
              'contains': fulltext
            }
          }
        ]
      }
    }
    // Lookup for records that match the specified criteria
    let query = Model.find().where(criteria).limit(actionUtil.parseLimit(req)).skip(actionUtil.parseSkip(req)).sort(actionUtil.parseSort(req))
    query = actionUtil.populateRequest(query, req)
    query.exec(function found(err, matchingRecords) {
      if (err) {
        return res.serverError(err)
      }
      // Only `.watch()` for new instances of the model if
      // `autoWatch` is enabled.
      permissions.setPermissions(matchingRecords, 'user', req.user)

      res.ok(matchingRecords.filter((value) => {
        return value.permissions.r
      }))
    })
  },

  /**
   * Override default findOne.
   * Add permissions info.
   */
  findOne(req, res) {

    var Model = actionUtil.parseModel(req)
    var pk = actionUtil.requirePk(req)

    var query = Model.findOne(pk)
    query = actionUtil.populateRequest(query, req)
    query.exec(function found(err, matchingRecord) {
      if (err) {
        return res.serverError(err)
      }
      if (!matchingRecord) {
        return res.notFound('No record found with the specified `id`.')
      }

      permissions.addPermissions(matchingRecord, 'user', req.user)
      res.ok(matchingRecord)
    })
  },

  /**
   * Return total count of users
   */
  count(req, res) {
    User.count().then((count) => {
      return res.json({count: count})
    }).catch((err) => {
      res.negotiate(err)
    })
  }
}
