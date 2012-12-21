var appender = require('../lib/connect-appender');
var assert = require('assert')
var connect = require('connect');
var request = require('supertest');
var should = require('should');

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

    // Stupid connect stuff
    it('should work as connect middleware', function() {
        var app = connect();
        // app.use();
        // appender('noop')
        request(app).get('/').end(function(err, res) {
            res.body.should.eql({});
        });
    })
});
