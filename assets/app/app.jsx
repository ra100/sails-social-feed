var CONST_ES6_BUILD_PATH = './build/';

//var _  = require('lodash');
var React = require('react');
var socketIOClient = require('socket.io-client');
var io = require('sails.io.js')(socketIOClient);
io.connect();
