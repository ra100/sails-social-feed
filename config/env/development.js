/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {
  /***************************************************************************
   * Set the default database connection for models in the development       *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  // models: {
  //   connection: 'someMongodbServer'
  // }
  log: {
    level: 'verbose'
  },

  session: {
    adapter: 'connect-redis',
    host: 'localhost',
    port: 6379,
    db: 0,
    prefix: 'sess:'
  },

  sockets: {
    adapter: 'socket.io-redis',
    host: 'localhost',
    port: 6379,
    db: 1,
    prefix: 'socket:'
  },

  appname: process.env.APP_NAME,
  baseurl: process.env.BASE_URL,
  streams: process.env.NODE_APP_INSTANCE === '0'
}
