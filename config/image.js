/**
 * Setup for image uploads and thumbnail generation
 */
module.exports.image = {
  s3_bucket: process.env.S3_BUCKET,
  options: {
    aws: {
      region: process.env.S3_REGION,
      path: process.env.S3_ROOT + '/',
      acl: 'public-read',
      accessKeyId: process.env.S3_KEY,
      secretAccessKey: process.env.S3_SECRET
    },
    resize: {
      quality: 90
    },
    versions: [
      {
        maxHeight: 1200,
        maxWidth: 1600,
        suffix: '-large',
        quality: 85
      },
      {
        maxHeight: 500,
        maxWidth: 500,
        suffix: '-medium',
        quality: 90,
      },
      {
        maxHeight: 150,
        maxWidth: 150,
        suffix: '-thumb',
        quality: 90,
        aspect: '1:1'
      }
    ]
  },

  sizes: {
    large: {
      'fn': 'resize',
      'config': {
        width: 1600
      }
    },
    medium: {
      'fn': 'resize',
      'config': {
        width: 400
      }
    },
    thumb: {
      'fn': 'crop',
      'config': {
        width: 150,
        height: 150
      }
    }
  }
};
