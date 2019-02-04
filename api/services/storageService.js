var Upload = require('s3-uploader')
var fs = require('fs')
var uuid = require('node-uuid')
var client = new Upload(
  sails.config.image.s3_bucket,
  sails.config.image.options
)
var avatarClient = new Upload(
  sails.config.image.s3_bucket,
  sails.config.image.avatarOptions
)

module.exports = {
  uploadImage: function(file) {
    return new Promise((resolve, reject) => {
      storageService.saveTmp(file).then(filename => {
        client.upload(filename, {}, (err, versions, meta) => {
          if (err) {
            return reject(err)
          }
          fs.unlink(filename, sails.log.verbose)
          return resolve(versions)
        })
      })
    })
  },
  uploadAvatar: function(file) {
    return new Promise((resolve, reject) => {
      storageService.saveTmp(file).then(filename => {
        avatarClient.upload(filename, {}, (err, versions, meta) => {
          if (err) {
            return reject(err)
          }
          fs.unlink(filename, sails.log.verbose)
          return resolve(versions)
        })
      })
    })
  },
  saveTmp: function(file) {
    return new Promise((resolve, reject) => {
      var filename = sails.config.image.tmp + uuid.v4() + file.name
      fs.writeFile(filename, file.data, err => {
        if (err) {
          sails.log.err('Error saving temp file', err)
          return reject(err)
        }
        sails.log.debug('Temporary image saved', filename)
        return resolve(filename)
      })
    })
  }
}
