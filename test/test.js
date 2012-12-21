assert = require('assert')
appender = require('../lib/connect-appender');

describe('appender', function() {
    it('should exist', function() {
        assert.ok(appender);
    });

    it('should not expose private stuff', function() {
        assert.ok(!appender.stripContentLength);
    });

    it('should be a function', function() {
        assert.ok(typeof appender == 'function');
    });

    it('should return a function', function() {
        assert.ok(typeof appender('noop') == 'function');
    });
});
