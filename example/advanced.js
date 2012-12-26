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
