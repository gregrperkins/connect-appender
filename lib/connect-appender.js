
/*!
 * Connect - appender
 * MIT Licensed
 */


/**
 * Utility functions
 */

/**
 * Strips any header that might pass for content-length from the given
 *  headers array.
 *
 * @param {Object.<string, string>} headers
 */
function stripContentLength(headers) {
    for (var key in headers) {
        if (key.toLowerCase() == 'content-length') {
            delete headers[key];
        }
    }
    return headers;
};


/**
 * Appender:
 *
 *      Appends the given text to outgoing responses that pass opt_preFilter
 *          and opt_postFilter.
 *
 *      If trailer is a function, calls it with the request, response, and
 *          all the buffered text so far, appending its return value if truthy.
 *          The function when is called as the response is ending.
 *
 * @param {string|(function({request: http.ServerRequest,
 *                           response: http.ServerResponse,
 *                           statusCode: number,
 *                           headers: Object.<string, string>,
 *                           output: string}): string)} trailer
 * @param {(?function(http.ServerRequest,
 *                    http.ServerResponse): boolean)=} opt_preFilter
 * @param {(?function({request: http.ServerRequest,
 *                     response: http.ServerResponse,
 *                     statusCode: number,
 *                     headers: Object.<string, string>,
 *                     output: string}): boolean)=} opt_postFilter
 *
 * @return {Function}
 * @api public
 */
module.exports = function appender(trailer, opt_preFilter, opt_postFilter) {
    var debugFn = function() {};

    var defaultPostFilter = function(spec) {
        return spec.statusCode == 200;
    };
    var postFilter = opt_postFilter || defaultPostFilter;

    var middleware = function(req, res, next) {
        // If no prefilter is given, we assume we should set up shop
        if (!opt_preFilter || opt_preFilter(req, res)) {
            // Retain the original functions to pass through functionality
            var writeHead = res.writeHead;
            var write = res.write;
            var end = res.end;

            // Build up a string buffer of the output
            // TODO(gregp): use a real Buffer?
            var output = '';

            // Keep the headers around if writeHead is called
            // We don't write them till the end, since we need to rewrite
            //  the content-length header.
            var headers = [];

            // Keep the status code as well; we use it for the postFilter
            var statusCode = 0;

            // Instead of writing to the stream, we have to write to our
            //  string, since we're not yet sure whether to do the appending.
            res.write = function(chunk, encoding) {
                debugFn('calling write');
                if (!chunk) {
                    return;
                } else if (Buffer.isBuffer(chunk)) {
                    output += chunk.toString(encoding);
                } else {
                    output += chunk;
                }
            };

            // We don't write the headers immediately.
            // We just keep this information until the end.
            res.writeHead = function(new_statusCode, new_headers) {
                debugFn('calling writeHead');
                statusCode = new_statusCode;
                headers = new_headers;
            };

            // Now we can actually append our text
            res.end = function(chunk, encoding) {
                debugFn('calling end', ' ...w/... ', chunk);

                // First use the incoming new data (if any...)
                if (chunk) {
                    res.write(chunk, encoding);
                }

                var resultObj = {
                    request: req,
                    response: res,
                    statusCode: res.statusCode || statusCode,
                    headers: headers,
                    body: output
                };

                // Check whether we should do any modification
                if (postFilter(resultObj)) {
                    var trailerVal;
                    if (typeof trailer == 'function') {
                        // Calculate the value of the function call
                        trailerVal = trailer(resultObj);
                    } else {
                        // Or just coerce to string
                        trailerVal = '' + trailer;
                    }

                    // Then append the value
                    output += trailerVal;

                    // Rewrite the content length
                    var contentLength = Buffer.byteLength(output);
                    headers = stripContentLength(headers);
                    headers['Content-Length'] = contentLength;
                }

                // Finally write the head
                writeHead.call(res, statusCode, headers);

                // Revert the wrapped functions
                res.writeHead = writeHead;
                res.write = write;
                res.end = end;

                // Then end with the collected data + trailer.
                res.end(output);
            };
        }

        next();
    };

    middleware.debug = function(name) {
        debugFn = function() {
            console.log('[' + name + ']: ' +
                Array.prototype.join.call(arguments, ''));
        };
    };

    return middleware;
};
