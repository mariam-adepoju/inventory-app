const http = require('http');
const Router = require('./router');
const { context } = require('./context');
const { jsonParser, errorHandler } = require('./middleware');

function createApplication() {
    const router = new Router();
    const middlewares = [];
    let customErrorHandler = errorHandler();

    function use(arg) {
        if (typeof arg === 'function') {
            // Check if it's an error-handling middleware: function(err, req, res, next)
            if (arg.length === 4) {
                customErrorHandler = arg;
            } else {
                middlewares.push(arg);
            }
        }
    }

    const app = {
        use,
        get: (path, ...handlers) => router.add('GET', path, handlers),
        post: (path, ...handlers) => router.add('POST', path, handlers),
        patch: (path, ...handlers) => router.add('PATCH', path, handlers),
        put: (path, ...handlers) => router.add('PUT', path, handlers),
        delete: (path, ...handlers) => router.add('DELETE', path, handlers),

        listen(port, callback) {
            const server = http.createServer((req, res) => {
                context(req, res);

                const routeMatch = router.match(req.method.toUpperCase(), req.path);
                const routeHandlers = routeMatch ? routeMatch.handlers : [(req, res, next) => {
                    const err = new Error('Route not found');
                    err.status = 404;
                    next(err);
                }];

                if (routeMatch) {
                    req.params = routeMatch.params;
                }

                const allHandlers = [...middlewares, ...routeHandlers];
                let index = 0;

                function next(err) {
                    // Prevent further execution if headers/response have already been sent
                    if (res.writableEnded) return;
                    try {
                        if (err) {
                            return customErrorHandler(err, req, res, next);
                        }
                        if (index < allHandlers.length) {
                            const handler = allHandlers[index++];
                            // Wrap handler execution in Promise.resolve to catch async rejections
                            Promise.resolve(handler(req, res, next)).catch(asyncError => {
                                next(asyncError);
                            });
                        }
                    } catch (error) {
                        customErrorHandler(error, req, res, next);
                    }
                }

                next();
            });

            server.listen(port, callback);
        }
    };

    return app;
}

createApplication.json = jsonParser;
module.exports = createApplication;