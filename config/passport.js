/**
 * Passport configuration
 *
 * This is the configuration for your Passport.js setup and where you
 * define the authentication strategies you want your application to employ.
 *
 * I have tested the service with all of the providers listed below - if you
 * come across a provider that for some reason doesn't work, feel free to open
 * an issue on GitHub.
 *
 * Also, authentication scopes can be set through the `scope` property.
 *
 * For more information on the available providers, check out:
 * http://passportjs.org/guide/providers/
 */

module.exports.passport = {
  local: {
    strategy: require('passport-local').Strategy
  },

  twitter: {
    name: 'Twitter',
    protocol: 'oauth',
    strategy: require('passport-twitter').Strategy,
    options: {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: process.env.BASE_URL + '/auth/twitter/callback'
    }
  },

  facebook: {
    name: 'Facebook',
    protocol: 'oauth2',
    strategy: require('passport-facebook').Strategy,
    options: {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      scope: [
        'email',
        'public_profile'
      ] /* email is necessary for login behavior */,
      callbackURL: process.env.BASE_URL + '/auth/facebook/callback',
      enableProof: true
    }
  },

  google: {
    name: 'Google',
    protocol: 'oauth2',
    strategy: require('passport-google-oauth').OAuth2Strategy,
    options: {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.BASE_URL + '/auth/google/callback',
      scope: ['profile', 'email']
    }
  },

  instagram: {
    name: 'Instagram',
    protocol: 'oauth2',
    strategy: require('passport-instagram').Strategy,
    options: {
      clientID: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
      callbackURL: process.env.BASE_URL + '/auth/instagram/callback'
    }
  },

  soundcloud: {
    name: 'Soundcloud',
    protocol: 'oauth2',
    strategy: require('passport-soundcloud').Strategy,
    options: {
      clientID: process.env.SOUNDCLOUD_CLIENT_ID,
      clientSecret: process.env.SOUNDCLOUD_CLIENT_SECRET,
      callbackURL: process.env.BASE_URL + '/auth/soundcloud/callback'
    }
  }
}
