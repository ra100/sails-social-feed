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

export BASE_URL='INSERT BASE URL'
export APP_NAME='socialFeed'
export PORT=1338
export ADMIN_NAME='admin'
export ADMIN_PASSWORD='admin123'
export ADMIN_EMAIL='admin@thissite.com'

sails lift
```

Setup MongoDB server, create database `social_feed`.

Roles and users are created in `config/bootstrap.js`.
