var Upload = require('s3-uploader');
var fs = require('fs');
var uuid = require('node-uuid');
var client = new Upload(sails.config.image.s3_bucket, sails.config.image.options);
var avatarClient = new Upload(sails.config.image.s3_bucket, sails.config.image.avatarOptions);

module.exports = {
  uploadImage: function (file) {
    return new Promise((res, rej) => {
      storageService.saveTmp(file).then((filename) => {
        client.upload(filename, {}, (err, versions, meta) => {
          if (err) {
            return rej(err);
          }
          res(versions);
        });
      });
    });
  },
  uploadAvatar: function (file) {
    return new Promise((res, rej) => {
      storageService.saveTmp(file).then((filename) => {
        avatarClient.upload(filename, {}, (err, versions, meta) => {
          if (err) {
            return rej(err);
          }
          res(versions);
        });
      });
    });
  },
  saveTmp: function (file) {
    return new Promise((res, rej) => {
      var filename = '/tmp/' + uuid.v4() + file.name;
      fs.writeFile(filename, file.data, (err) => {
        if (err) {
          sails.log.err('Error saving temp file', err);
          return rej(err);
        }
        sails.log.debug('Temporary image saved', filename);
        res(filename);
      });
    });
  }
};
