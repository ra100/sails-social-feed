chai = require 'chai'
chai.should()

describe 'UserModel', ->

  describe '#create()', ->
    it 'should check create function', ->
      User.create({username: 'editor'})
      .then (user) =>
        user.should.be.an 'object'
      .catch (err) =>
        throw err

  describe '#fineOne()', ->
    it 'should check findOne function', ->
      User.findOne({username: 'editor'})
      .then (user) =>
        user.username.should.be.a 'string'
      .catch (err) =>
        throw err