[![build status](https://secure.travis-ci.org/gregrperkins/connect-appender.png)](http://travis-ci.org/gregrperkins/connect-appender)

# connect-appender

Middleware to append some text to the body of outgoing responses.

Includes pre-filter and post-filter functions
so that it doesn't have to buffer a request we don't care about,
and can selectively append text
based on the body of the response.

### Example

The basic usage:

```javascript
var connect = require('connect');
var appender = require('connect-appender');
var app = connect()
  .use(appender('zorz\n'))
  .use(function(req, res) {
    res.end('response');
  })
  .listen(9001);
```

More advanced, choosing which request/responses to affect:

```javascript
var connect = require('connect');
var appender = require('..');

var prefilter = function(req, res) {
  // called before the request is passed through
  //  determines whether to wrap the resulting response
  return /only_here/.test(req.url);
};

var postfilter = function(spec) {
  // called as the response is ending
  //  determines whether to append the text
  return !(/not_here/.test(spec.request.url));
};

var trailer = function(spec) {
  // called to determine what text to append
  return 'zorz\n' + spec.statusCode + '\n';
};

// Spec is generated when ending the response, and looks like: {
//   request: http.ServerRequest,
//   response: http.ServerResponse,
//   statusCode: number,
//   headers: Object.<string, string>,
//   output: string
// }

var app = connect()
  .use(appender(trailer, prefilter, postfilter))
  .use(function(req, res) {
    res.end('[' + req.url + ']: response\n');
  })
  .listen(9001);
```

### TODOs

* response.write() with different encodings

### Development

* init: ``npm install``
* tests: ``npm test``
* dev: ``npm run-script tdd``

NOTE: The tests rely on custom forks of: *connect*, *grunt*, and *grunt-simple-mocha*.
