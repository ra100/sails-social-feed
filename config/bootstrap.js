/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function (cb) {

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)

  sails.services.passport.loadStrategies();

  User.find({username: 'admin'}).exec(function (err, adminUser) {
    // If an admin user exists, skip the bootstrap data
    if (adminUser.length > 0) {
      return cb();
    }
    console.log('Creating roles and admin...');
    var adminId = 0;
    Role.create({name: process.env.ADMIN_NAME || 'admin'}).exec(function (err, adminRole) {
      console.log(adminRole);
      User.create({
        username: 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        'roles': [adminRole.id]
      }).exec(function (err, user) {
        console.log(user);
        var crypto = require('crypto');
        var token = crypto.randomBytes(48).toString('base64');

        Passport.create({
          protocol: 'local',
          password: process.env.ADMIN_PASSWORD || 'admin123',
          user: user.id,
          accessToken: token
        }, function (err, passport) {
          if (err) {
            if (err.code === 'E_VALIDATION') {
              req.flash('error', 'Error.Passport.Password.Invalid');
            }
          }
        });
      });
    });
    Role.create({name: 'editor'}).exec(console.log);
    Role.create({name: 'user'}).exec(console.log);
    return cb();
  });
};
