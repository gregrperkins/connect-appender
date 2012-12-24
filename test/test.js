var appender = require('../lib/connect-appender');
var connect = require('connect');
var should = require('should');
var assert = require('assert')
var path = require('path');
var http = require('http');

// This requires an outstanding pull request to work...
// See: https://github.com/senchalabs/connect/pull/716
require('connect/test/support/http');

// Test some preconditions for this test file
describe('connect', function() {
  // Ensure you're using ``npm link`` or the modified version
  it('should include shared test suites through npm', function() {
    var resolved = require.resolve('connect/test/support/http');
    resolved.should.be.a('string');
    var endString = 'test/support/http.js'
    resolved.substr(-endString.length).should.eql(endString);
  });

  it('should produce an empty response', function(done) {
    var app = connect();

    app.use(function(req, res){
      res.end('body');
    });

    app.request()
    .get('/')
    .expect('body', done);
  });

  it('should have a working json implementation', function(done) {
    var app = connect();
    app.use(connect.json({ limit: '1mb' }));

    app.use(function(req, res){
      res.end(JSON.stringify({'data':[1, 'array']}));
    });

    app.request()
    .post('/')
    .expect('{"data":[1,"array"]}', done);
  });
});

describe('appender', function() {
  // Stupid simple proof-of-concept testing stuff
  it('should exist', function() {
    should.exist(appender);
  });

  it('should not expose private stuff', function() {
    should.not.exist(appender.stripContentLength);
  });

  it('should be a function', function() {
    appender.should.be.a('function');
  });

  it('should return a function', function() {
    appender('noop').should.be.a('function');
  });

  it('should append a string to the response body', function(done) {
    var app = connect();
    app.use(appender('an_ending'));

    app.use(function(req, res){
      res.statusCode = 200;
      res.end('make_me_');
    });

    var req = app.request();
    req.get('/');
    req.expect('make_me_an_ending', done);
  });

  it('should do nothing when given an empty string', function(done) {
    var app = connect();
    app.use(appender(''));
    app.use(function(req, res){
      res.end('foo');
    });

    app.request()
    .get('/')
    .expect('foo', done);
  });
});
