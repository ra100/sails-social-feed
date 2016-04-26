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

  describe '#findOne()', ->
    it 'should check findOne function', ->
      User.findOne({username: 'editor'})
      .then (user) =>
        user.username.should.be.a 'string'
      .catch (err) =>
        throw err

  describe '#find()', ->
    it 'should check find function', ->
      User.find()
      .then (users) =>
        users.should.have.length 2
      .catch (err) =>
        throw err

  describe '#destroy()', ->
    it 'should check destroy function', ->
      User.destroy({username: 'editor'})
      .then (users) =>
        users.should.have.length 1
      .catch (err) =>
        throw err