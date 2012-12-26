var connect = require('connect');
var appender = require('..');

var app = connect()
  .use(appender('zorz\n'))
  .use(function(req, res) {
    res.end('response');
  })
  .listen(9001);
