// const winston = require('winston')

// const logger = winston.createLogger({
//   level: 'silly',
//   format: winston.format.json(),
//   transports: [
//     //
//     // - Write to all logs with level `info` and below to `combined.log`
//     // - Write all logs error (and below) to `error.log`.
//     //
//     new winston.transports.File({
//       filename: 'error.log',
//       level: 'error'
//     }),
//     new winston.transports.File({
//       filename: 'app.log'
//     })
//   ]
// })

// //
// // If we're not in production then log to the `console` with the format:
// // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// //
// if (process.env.NODE_ENV !== 'production') {
//   logger.add(new winston.transports.Console({
//     format: winston.format.simple()
//   }))
// }

module.exports.log = {
  /***************************************************************************
   *                                                                          *
   * Valid `level` configs: i.e. the minimum log level to capture with        *
   * sails.log.*()                                                            *
   *                                                                          *
   * The order of precedence for log levels from lowest to highest is:        *
   * silly, verbose, info, debug, warn, error                                 *
   *                                                                          *
   * You may also set the level to "silent" to suppress all logs.             *
   *                                                                          *
   ***************************************************************************/

  // Pass in our custom logger, and pass all log levels through.
  // custom: logger,
  level: 'silly',

  // Disable captain's log so it doesn't prefix or stringify our meta data.
  inspect: false
}
