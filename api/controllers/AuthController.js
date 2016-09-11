/**
 * Authentication Controller
 *
 * This is merely meant as an example of how your Authentication controller
 * should look. It currently includes the minimum amount of functionality for
 * the basics of Passport.js to work.
 */
var AuthController = {
  /**
   * Render the login page
   *
   * The login form itself is just a simple HTML form:
   *
      <form role="form" action="/auth/local" method="post">
        <input type="text" name="identifier" placeholder="Username or Email">
        <input type="password" name="password" placeholder="Password">
        <button type="submit">Sign in</button>
      </form>
   *
   * You could optionally add CSRF-protection as outlined in the documentation:
   * http://sailsjs.org/#!documentation/config.csrf
   *
   * A simple example of automatically listing all available providers in a
   * Handlebars template would look like this:
   *
      {{#each providers}}
        <a href="/auth/{{slug}}" role="button">{{name}}</a>
      {{/each}}
   *
   * @param {Object} req
   * @param {Object} res
   */
  login: function (req, res) {
    var strategies = sails.config.passport,
      providers = {};

    // Get a list of available providers for use in your templates.
    Object.keys(strategies).forEach(function (key) {
      if (key === 'local') {
        return;
      }

      providers[key] = {
        name: strategies[key].name,
        slug: key
      };
    });

    if (req.session.authenticated) {
      var user = req.user;
      if (typeof user.roles == 'undefined' || user.roles.length == 0) {
        return res.view('pop');
      }
      return res.redirect('/');
    }

    // Render the `auth/login.ext` view
    res.view({
      providers: providers,
      errors: req.flash('error')
    });
  },

  /**
   * Log out a user and return them to the homepage
   *
   * Passport exposes a logout() function on req (also aliased as logOut()) that
   * can be called from any route handler which needs to terminate a login
   * session. Invoking logout() will remove the req.user property and clear the
   * login session (if any).
   *
   * For more information on logging out users in Passport.js, check out:
   * http://passportjs.org/guide/logout/
   *
   * @param {Object} req
   * @param {Object} res
   */
  logout: function (req, res) {
    if (req.logout) {
      req.logout();
    }

    // mark the user as logged out for auth purposes
    req.session.authenticated = false;

    if (req.xhr) {
      return res.ok({
        status: 'ok'
      });
    }

    res.redirect('/');
  },

  /**
   * Render the registration page
   *
   * Just like the login form, the registration form is just simple HTML:
   *
      <form role="form" action="/auth/local/register" method="post">
        <input type="text" name="username" placeholder="Username">
        <input type="text" name="email" placeholder="Email">
        <input type="password" name="password" placeholder="Password">
        <button type="submit">Sign up</button>
      </form>
   *
   * @param {Object} req
   * @param {Object} res
   */
  register: function (req, res) {
    res.view({
      errors: req.flash('error')
    });
  },

  /**
   * Create a third-party authentication endpoint
   *
   * @param {Object} req
   * @param {Object} res
   */
  provider: function (req, res) {
    passport.endpoint(req, res);
  },

  /**
   * Create a authentication callback endpoint
   *
   * This endpoint handles everything related to creating and verifying Pass-
   * ports and users, both locally and from third-aprty providers.
   *
   * Passport exposes a login() function on req (also aliased as logIn()) that
   * can be used to establish a login session. When the login operation
   * completes, user will be assigned to req.user.
   *
   * For more information on logging in users in Passport.js, check out:
   * http://passportjs.org/guide/login/
   *
   * @param {Object} req
   * @param {Object} res
   */
  callback: function (req, res) {
    if (req.session.authenticated) {
      var user = req.user;
      if (typeof user.roles == 'undefined' || user.roles.length == 0) {
        return res.view('pop');
      }
      return res.redirect('/');
    }

    function tryAgain(err) {

      // Only certain error messages are returned via req.flash('error', someError)
      // because we shouldn't expose internal authorization errors to the user.
      // We do return a generic error and the original request body.
      var flashError = req.flash('error')[0];

      if (err && !flashError) {
        req.flash('error', 'Error.Passport.Generic');
      } else if (flashError) {
        req.flash('error', flashError);
      }
      req.flash('form', req.body);

      // If an error was thrown, redirect the user to the
      // login, register or disconnect action initiator view.
      // These views should take care of rendering the error messages.
      var action = req.param('action');

      switch (action) {
        case 'register':
          res.redirect('/register');
          break;
        case 'disconnect':
          res.redirect('back');
          break;
        default:
          res.redirect('/login');
      }
    }

    passport.callback(req, res, function (err, user, challenges, statuses) {
      if (err || !user) {
        return tryAgain(challenges);
      }

      req.login(user, function (err) {
        if (err) {
          return tryAgain(err);
        }

        // Mark the session as authenticated to work with default Sails sessionAuth.js policy
        req.session.authenticated = true;
        if (typeof user.roles == 'undefined' || user.roles.length == 0) {
          return res.view('pop');
        }
        // Upon successful login, send the user to the homepage were req.user
        // will be available.
        res.redirect('/');
      });
    });
  },

  /**
   * Create a authentication callback endpoint
   *
   * This endpoint handles everything related to creating and verifying Pass-
   * ports and users, both locally and from third-aprty providers.
   *
   * Passport exposes a login() function on req (also aliased as logIn()) that
   * can be used to establish a login session. When the login operation
   * completes, user will be assigned to req.user.
   *
   * For more information on logging in users in Passport.js, check out:
   * http://passportjs.org/guide/login/
   *
   * @param {Object} req
   * @param {Object} res
   */
  ajaxCallback: function (req, res) {
    function returnError(err) {

      // Only certain error messages are returned via req.flash('error', someError)
      // because we shouldn't expose internal authorization errors to the user.
      // We do return a generic error and the original request body.
      var flashError = req.flash('error')[0];

      if (err && !flashError) {
        res.json({
          'status': 'error',
          'message': req.__('Error.Passport.Generic'),
          error: 'Error.Passport.Generic'
        });
      } else if (flashError) {
        res.json({
          'status': 'error',
          'message': req.__(flashError),
          'error': flashError
        });
      }
    }

    if (req.session.authenticated) {
      return res.jsonx({
        'status': 'error',
        'message': req.__('Error.Passport.Already.Authenticated'),
        error: 'Error.Passport.Already.Authenticated'
      });
    }

    passport.callback(req, res, function (err, user, challenges, statuses) {
      if (err || !user) {
        return returnError(challenges);
      }

      req.login(user, function (err) {
        if (err) {
          return returnError(err);
        }

        // Mark the session as authenticated to work with default Sails sessionAuth.js policy
        req.session.authenticated = true;

        // Upon successful login, send the user to the homepage were req.user
        // will be available.
        res.json({
          'status': 'ok',
          'message': req.__('Status.Passport.Logged')
        });
      });
    });
  },

  /**
   * Disconnect a passport from a user
   *
   * @param {Object} req
   * @param {Object} res
   */
  disconnect: function (req, res) {
    passport.disconnect(req, res);
  },

  /**
   * Handle simple login just by email,
   * if login not found, create new registration
   */
  emaillogin(req, res) {
    var user = req.param('user');
    if (typeof user !== 'object') {
      return res.forbidden();
    }
    var email = user.email.toLowerCase();
    req.body.password = email;
    req.body.username = email;
    req.body.identifier = email;
    req.body.email = email;
    req.body.displayname = user.name;
    // TODO FIX THIS
    passport.callback(req, res, function (err, user, challenges, statuses) {
      if (user !== false) {
        req.login(user, function (err) {
          if (err) {
            return res.negotiate(err);
          }
          req.session.authenticated = true;
          return res.json(user);
        });
      } else {
        sails.services.passport.protocols.local.register(req, res, (err, user) => {
          if (err) {
            return res.negotiate(err);
          }
          req.login(user, function (err) {
            if (err) {
              return res.negotiate(err);
            }
            req.session.authenticated = true;
            return res.json(user);
          });
        });
      }
    });
  }
};

module.exports = AuthController;
