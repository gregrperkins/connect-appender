# connect-appender

Middleware to append some text to the body of outgoing responses.

Includes pre-filter and post-filter functions
so that it doesn't have to buffer a request we don't care about,
and can selectively append text
based on the body of the response.

### Development

* init: ``npm install``
* tests: ``npm test``
* dev: ``npm run-script tdd``

NOTE: this relies on outstanding pull requests to: *connect*, *grunt*, and *grunt-simple-mocha* for the tests. Uses my forks.

### TODOs

* response.write() with different encodings
