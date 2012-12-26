var appender = require('../lib/connect-appender');
var connect = require('connect');
var should = require('should');
var assert = require('assert')
var path = require('path');
var http = require('http');

// This requires an outstanding pull request to work...
// See: https://github.com/senchalabs/connect/pull/716
require('connect/test/support/http');

// Test some preconditions about Connect
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

describe('preFilter function', function() {
  var filterHeaderName = 'No-Filter'.toLowerCase();
  var sundayExtraAppender = appender('_extra', function(req, res) {
    if (req.headers[filterHeaderName]) {
      return false;
    }
    return /sunday/.test(req.url);
  });

  var sundayExtraServer = function(req, res){
    res.end('news');
  };

  it('should append when null', function(done) {
    var app = connect();
    app.use(appender('_extra', null));
    app.use(sundayExtraServer);

    app.request()
    .get('/sunday')
    .expect('news_extra', done);
  });

  it('should append when a request is caught', function(done) {
    var app = connect();
    app.use(sundayExtraAppender);
    app.use(sundayExtraServer);

    app.request()
    .get('/sunday')
    .expect('news_extra', done);
  });

  it('should be able to filter out based on url', function(done) {
    var app = connect();
    app.use(sundayExtraAppender);
    app.use(sundayExtraServer);

    app.request()
    .get('/')
    .expect('news', done);
  });

  it('should be able to filter out based on headers', function(done) {
    var app = connect();
    app.use(sundayExtraAppender);
    app.use(sundayExtraServer);

    app.request()
    .get('/sunday')
    .set(filterHeaderName, 'notToday')
    .expect('news', done);
  });
});

describe('postFilter function', function() {
  var filterHeaderName = 'No-Filter'.toLowerCase();
  var sundayExtraAppender = appender('_extra', null, function(spec) {
    if (spec.request.headers[filterHeaderName]) {
      return false;
    }
    if (/nyan/.test(spec.body)) {
      return false;
    }
    return /sunday/.test(spec.request.url);
  });

  var sundayExtraServer = function(req, res){
    if (/funday/.test(req.url)) {
      req.statusCode = 420;
    }

    if (/caturday/.test(req.url)) {
      res.end('nyan');
    } else {
      res.end('news');
    }
  };

  it('should append when null', function(done) {
    var app = connect();
    app.use(appender('_extra', null, null));
    app.use(sundayExtraServer);

    app.request()
    .get('/sunday')
    .expect('news_extra', done);
  });

  it('should append when a request is caught', function(done) {
    var app = connect();
    app.use(sundayExtraAppender);
    app.use(sundayExtraServer);

    app.request()
    .get('/sunday')
    .expect('news_extra', done);
  });

  it('should be able to filter out based on url', function(done) {
    var app = connect();
    app.use(sundayExtraAppender);
    app.use(sundayExtraServer);

    app.request()
    .get('/')
    .expect('news', done);
  });

  it('should be able to filter out based on headers', function(done) {
    var app = connect();
    app.use(sundayExtraAppender);
    app.use(sundayExtraServer);

    app.request()
    .get('/sunday')
    .set(filterHeaderName, 'notToday')
    .expect('news', done);
  });

  it('should be able to filter out based on statusCode', function(done) {
    var app = connect();
    app.use(sundayExtraAppender);
    app.use(sundayExtraServer);

    app.request()
    .get('/sunday')
    .set(filterHeaderName, 'notToday')
    .expect('news', done);
  });

  it('should be able to filter out based on text content', function(done) {
    var app = connect();
    app.use(sundayExtraAppender);
    app.use(sundayExtraServer);

    app.request()
    .get('/caturday_sunday')
    .expect('nyan', done);
  });
});

describe('appenders with trailer functions', function() {
  var x = 0;
  var countingAppender = appender(function() {
    return '' + x++;
  });

  var serve = function(req, res) {
    res.end('_');
  };

  var app = connect();
  app.use(countingAppender);
  app.use(serve);

  it('should append the value of the function', function(done) {
    app.request().get('/').expect('_0', done);
  });

  it('should call the trailer function once per request', function(done) {
    app.request().get('/').expect('_1', done);
  });
});

describe('appender middleware', function() {
  var serve = function(req, res) {
    res.end('yo_dawg_');
  };
  var appenderA = appender('A');
  var appenderB = appender('B');
  // appenderA.debug('A');
  // appenderB.debug('B');

  it('should work in isolation (A)', function(done) {
    var appA = connect();
    appA.use(appenderA);
    appA.use(serve);
    appA.request().get('/').expect('yo_dawg_A', done);
  });

  it('should work in isolation (B)', function(done) {
    var appB = connect();
    appB.use(appenderB);
    appB.use(serve);
    appB.request().get('/').expect('yo_dawg_B', done);
  });

  it('should properly stack before a basic prepending middleware', function(done) {
    var app = connect();
    app.use(appenderA);
    app.use(function(req, res, next) {
      res.write('before_');
      next();
    });
    app.use(serve);

    app.request().get('/').expect('before_yo_dawg_A', done);
  });

  it('should work with other appenders (req -> A -> B -> serve -> B -> A -> res)', function(done) {
    var app = connect();
    app.use(appenderA);
    app.use(appenderB);
    app.use(serve);
    app.request().get('/').expect('yo_dawg_BA', done);
  });
});
