function jsonParser() {
    return (req, res, next) => {
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            let body = [];
            req.on('data', chunk => body.push(chunk));
            req.on('end', () => {
                try {
                    const raw = Buffer.concat(body).toString();
                    req.body = raw ? JSON.parse(raw) : {};
                    next();
                } catch (err) {
                    // Create a 400 Bad Request error for malformed JSON
                    const parseError = new Error('Invalid JSON payload');
                    parseError.status = 400;
                    next(parseError);
                }
            });
        } else {
            next();
        }
    };
}

function errorHandler() {
    return (err, req, res, next) => {
        const statusCode = err.status || 500;
        res.status(statusCode).json({
            success: false,
            error: err.message || 'Internal Server Error'
        });
    };
}

module.exports = { jsonParser, errorHandler };
