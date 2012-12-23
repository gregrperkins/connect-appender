# connect-appender

Middleware to append some text to the body of outgoing responses.

Includes pre-filter and post-filter functions so that it doesn't have to
buffer a request we don't care about, and can selectively apply text based
on the body of the response.

## WIP

This doesn't work yet; it worked within the context of node-http-proxy,
but not yet as true connect middleware, as far as my tests can see.

Also, I'm hitting some problems figuring out how to get good log output from
grunt-simple-mocha, and somehow what's being included from that modified
connect repo is just not failing properly: when making the
``app.request().get().expect()`` chain, a failed assertion will cause

```
>> File "test/test.js" changed.
Running "simplemocha:all" (simplemocha) task

  ․․․․․․․․Fatal error: expected 'make_me_' to equal 'make_me_an_ending'
```

### Development

NOTE: this relies on an unmerged pull request to connect.js for the tests.
Go and check out
[my fork](https://github.com/gregrperkins/connect/tree/npm_include),
then ``npm link ../.../connect``.

* init: ``npm install``
* tests: ``npm test``
* dev: ``npm run-script tdd``
