var ImageService = require('sails-service-image');
var sizeOf = require('image-size');

const is = ImageService('im');

module.exports = {
  upload: function (file) {
    var config = sails.config.image.sizes;
    var dimensions = sizeOf(file);
    sails.log.verbose('DIMENSIONS', dimensions);
    var promises = [];
    for (var type in sails.config.image.sizes) {
      var fn = sails.config.image.sizes[type].fn;
      var config = sails.config.image.sizes[type].config;
      var p = new Promise((res, rej) => {
        imageService[fn](file, dimensions, config).then((f) => {
          sails.log.verbose(f);
          storageService.upload(f).then((filename) => {
            res({filename: filename, type: type});
          }).catch(rej);
        });
      });
      promises.push(p);
    }
    sails.log.debug(promises);
    return Promise.all(promises);
  },
  crop: function (file, dimensions, config) {
    if (dimensions.width > dimensions.height) {
      return is.resize(file, {
        width: config.width,
        x: 0,
        y: 0
      }).then((file) => {
        return is.crop(file, config);
      });
    } else {
      return is.resize(file, {
        height: config.width,
        x: 0,
        y: 0
      }).then((file) => {
        return is.crop(file, config);
      });
    }
  },
  resize: function (file, dimensions, config) {
    if (dimensions.height > (2 * dimensions.width)) {
      return is.resize(file, {height: config.width});
    } else {
      return is.resize(file, config);
    }
  }
  // large: function(req, res) {
  //   return ImageService
  //     .resize(req.param('file'), sails.config.image.large)
  //     .then(StorageService.upload);
  // },
  // medium: function(req, res) {
  //   return ImageService
  //     .resize(req.param('file'), sails.config.image.medium)
  //     .then(StorageService.upload);
  // },
  // thumb: function(req, res) {
  //   return ImageService[sails.config.image.thumb.fn]
  //     (req.param('file'), sails.config.image.thumb.config)
  //     .then(StorageService.upload);
  // }
};