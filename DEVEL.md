# Development notes

## Disclaimer

I'll use this file as development notes. To map process of creating this app.

Some `atom` configurations files will be here too.

## Preinstall process

```shell
nvm install 5.1.0
sudo npm install sails -g
sails new socialFeed
mv socialFeed/* ./*
npm install
bower install
npm install grunt-browserify grunt-mocha-test grunt-typescript-compile mocha --save-dev
npm install babelify grunt-browserify --save-dev
npm install babel-eslint eslint-plugin-react --save-dev
npm install -g babel-cli
```

create `start.sh`:

```shell
#!/bin/bash

export BASE_URL='https://example.com'
export ORIGIN='https://shoutbox.rozhlas.cz,http://localhost:8082'
export APP_NAME='socialFeed'
export PORT=1338
export ADMIN_NAME='admin'
export ADMIN_PASSWORD='admin123'
export ADMIN_EMAIL='admin@example.com'
export GOOGLE_CLIENT_ID=''
export GOOGLE_CLIENT_SECRET=''
export FACEBOOK_APP_ID=''
export FACEBOOK_APP_SECRET=''
export FACEBOOK_API_VERSION='2.6'
export TWITTER_CONSUMER_KEY=''
export TWITTER_CONSUMER_SECRET=''
export JWT_SECRET=''
export S3_KEY=''
export S3_SECRET=''
export S3_BUCKET=''
export S3_ROOT=''
export S3_REGION=''
export PORT=1338
export NODE_ENV=development
export STREAMS=true

sails lift
```

Setup MongoDB server, create database `social_feed`.

Roles and users are created in `config/bootstrap.js`.
