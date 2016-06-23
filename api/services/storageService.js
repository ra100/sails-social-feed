module.exports = {
  upload: function(file) {
    sails.log.verbose(file);
    return new Promise((res, rej) => {
      res({filename: 'asdfasdf'});
    });
  }
};
