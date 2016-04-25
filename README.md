# Social feed
[Sails](http://sailsjs.org) application to collect messages from social networks and publish to more social streams.

Used technologies:
- nodejs
- sails
- react
- react-bootstrap
- react-router
- passport
- babel
- es6
- ...

## How to start
- install sailsjs and other global modules

```shell
npm install -g sails babel-cli bower
```

- install local modules

```shell
npm install
bower install
```

- lift sails

```shell
sails lift
```

- or create `local.js` script end set environment variables, e.g. `start.sh`:

```shell
#!/bin/bash

export BASE_URL='https://mygreatapp.com'
export APP_NAME='socialFeed'
export PORT=1338
export ADMIN_NAME='admin'
export ADMIN_PASSWORD='nbusr123'
export ADMIN_EMAIL='admin@mygreatapp.com'
export TWITTER_CONSUMER_KEY='TWITTER_CONSUMER_KEY'
export TWITTER_CONSUMER_SECRET='TWITTER_CONSUMER_SECRET'
export FACEBOOK_APP_ID='FACEBOOK_APP_ID'
export FACEBOOK_APP_SECRET='FACEBOOK_APP_SECRET'
export FACEBOOK_API_VERSION='2.6'

sails lift
```

### Setup SSL

Add to `local.js`:

```js
  ssl: {
    ca: require('fs').readFileSync(__dirname + './ssl/my_apps_ssl.ca'),
    key: require('fs').readFileSync(__dirname + './ssl/my_apps_ssl.key'),
    cert: require('fs').readFileSync(__dirname + './ssl/my_apps_ssl.crt')
  },
```

### Set persistent sessions between restarts

In `local.js`, e.g. use redis

```js
  session: {
    adapter: 'redis',
    host: 'localhost',
    port: 6379,
    db: 0,
    prefix: 'sess:',
  }
```

More info on `local.js` file in  [sailsjs.org documentation](http://sailsjs.org/#!/documentation/anatomy/myApp/config/local.js.html).

## What works
- [x] administration
  - [x] users
  - [x] streams
  - [x] groups
  - [x] feeds

- [x] twitter Streaming API
  - [x] listening for users and hashtags
