const http = require('http');
const Router = require('./router');
const { context } = require('./context');
const { errorHandler } = require('./middleware');

function createApplication() {
    const router = new Router();
    const middlewares = [];
    let customErrorHandler = errorHandler();

    function use(arg) {
        if (typeof arg !== "function") {
            throw new TypeError(
                "Middleware must be a function."
            );
        } else {
            // Check if it's an error-handling middleware: function(err, req, res, next)
            if (arg.length === 4) {
                customErrorHandler = arg;
            } else {
                middlewares.push(arg);
            }
        }
    }
    function register(method, path, handlers) {
        if (!handlers.length) {
            throw new Error(
                `Route "${method} ${path}" requires at least one handler.`
            );
        }
        router.add(method, path, handlers);
    }

    const app = {
        use,
        get: (path, ...handlers) => register('GET', path, handlers),
        post: (path, ...handlers) => register('POST', path, handlers),
        patch: (path, ...handlers) => register('PATCH', path, handlers),
        put: (path, ...handlers) => register('PUT', path, handlers),
        delete: (path, ...handlers) => register('DELETE', path, handlers),

        listen(port, callback) {
            const server = http.createServer((req, res) => {
                context(req, res);
                const routeMatch = router.match(req.method.toUpperCase(), req.path);
                const routeHandlers = routeMatch.found
                    ? routeMatch.handlers
                    : [
                        (req, res, next) => {
                            const err = new Error(
                                routeMatch.status === 404
                                    ? "Route not found"
                                    : "Method Not Allowed"
                            );
                            err.status = routeMatch.status;
                            next(err);
                        }
                    ];
                if (routeMatch.found) {
                    req.params = routeMatch.params;
                }
                const allHandlers = [...middlewares, ...routeHandlers];
                let index = 0;
                function next(err) {
                    if (res.writableEnded) {
                        return;
                    }
                    if (err) {
                        return customErrorHandler(err, req, res, next);
                    }
                    if (index >= allHandlers.length) {
                        return;
                    }
                    const handler = allHandlers[index++];
                    Promise.resolve()
                        .then(() => handler(req, res, next))
                        .catch(next);
                }
                next();
            });

            server.listen(port, callback);
            return server;
        }
    };

    return app;
}

module.exports = createApplication;