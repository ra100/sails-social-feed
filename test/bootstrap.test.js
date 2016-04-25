var sails = require('sails');

before(function (done) {

  // Increase the Mocha timeout so that Sails has enough time to lift.
  this.timeout(5000);

  sails.lift({
    port: 1337,
    environment: 'development',
    log: {
      level: 'silent'
    },
    models: {
      connection: 'localTestDb',
      migrate: 'drop'
    }
  }, function (err, server) {
    if (err) {
      return done(err);
    }
    done(err, sails);
  });
});

after(function (done) {
  // here you can clear fixtures, etc.
  sails.lower(done);
});