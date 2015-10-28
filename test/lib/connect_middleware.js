'use strict';

var should = require('should');
var request = require('supertest');
var path = require('path');
var _ = require('lodash');

var SwaggerRunner = require('../..');

var TEST_PROJECT_ROOT = path.resolve(__dirname, '..', 'assets', 'project');
var TEST_PROJECT_CONFIG = { appRoot: TEST_PROJECT_ROOT };

describe('connect_middleware', function() {

  before(function(done) {
    this.app = require('connect')();
    var self = this;
    SwaggerRunner.create(TEST_PROJECT_CONFIG, function(err, r) {
      if (err) { return done(err); }
      self.runner = r;
      var middleware = self.runner.connectMiddleware();
      middleware.register(self.app);
      done();
    });
  });

  require('./common')();

});

describe('mock', function() {

  before(function(done) {
    this.app = require('connect')();
    var self = this;
    var config = {
      appRoot: TEST_PROJECT_ROOT,
      bagpipes: { _router: { mockMode: true }}
    };
    SwaggerRunner.create(config, function(err, r) {
      if (err) { return done(err); }
      self.runner = r;
      var middleware = self.runner.connectMiddleware();
      middleware.register(self.app);
      done();
    });
  });

  it('should return from mock controller handler if exists', function(done) {
    request(this.app)
      .get('/hello_with_mock')
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        should.not.exist(err);
        res.body.should.eql({ message: 'mocking from the controller!'});
        done();
      });
  });

  it('should return sample if exists and no mock controller', function(done) {
    request(this.app)
      .get('/hello')
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        should.not.exist(err);
        res.body.should.eql({ message: 'An example message' });
        done();
      });
  });

  it('should return example based on _mockReturnStatus header', function(done) {
    request(this.app)
      .get('/hello_form')
      .send('name=Scott')
      .set('Accept', 'application/json')
      .set('_mockReturnStatus', '201')
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        should.not.exist(err);
        res.body.should.not.eql({ message: 'An example message' });
        res.body.should.not.eql({ message: 'mocking from the controller!'});
        res.body.should.have.property('string');
        res.body.string.should.be.a.String;
        res.body.should.have.property('integer');
        res.body.integer.should.be.a.Integer;
        done();
      });
  });

  it('should return example based on accept header', function(done) {
    request(this.app)
      .get('/hello_form')
      .send('name=Scott')
      .set('Accept', 'text/plain')
      .expect(200)
      //.expect('Content-Type', 'text/plain')
      .end(function(err, res) {
        should.not.exist(err);
        res.body.should.be.a.String;
        //res.body.should.not.eql({ message: 'An example message' });
        //res.body.should.not.eql({ message: 'mocking from the controller!'});
        //res.body.should.have.property('string');
        //res.body.string.should.be.a.String;
        //res.body.should.have.property('integer');
        //res.body.integer.should.be.a.Integer;
        done();
      });
  });
});
