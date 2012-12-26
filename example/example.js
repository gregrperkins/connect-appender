var connect = require('connect');
var appender = require('../lib/connect-appender');

var app = connect()
  .use(appender('zorz\n'))
  .use(function(req, res) {
    res.end('response');
  })
  .listen(9001);
