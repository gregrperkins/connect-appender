# connect-appender

Middleware to append some text to the body of outgoing responses.

Includes pre-filter and post-filter functions
so that it doesn't have to buffer a request we don't care about,
and can selectively append text
based on the body of the response.

## WIP

I'm not done with the test suite for this yet.
I especially wouldn't trust the filter functions yet.
It worked within the context of node-http-proxy but
the interface has changed significantly since then.

### Development

* init: ``npm install``
* tests: ``npm test``
* dev: ``npm run-script tdd``

NOTE: this relies on outstanding pull requests to: *connect*, *grunt*, and *grunt-simple-mocha* for the tests.
Go and check out my forks of:
* [connect](https://github.com/gregrperkins/connect/tree/gregp)
* [grunt](https://github.com/gregrperkins/grunt/tree/gregp)
* [grunt-simple-mocha](https://github.com/gregrperkins/grunt-simple-mocha/tree/gregp)

then ``npm link ../.../{connect,grunt,grunt-simple-mocha}``.
