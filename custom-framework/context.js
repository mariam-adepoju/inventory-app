function context(req, res) {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    req.path = parsedUrl.pathname;

    // Convert URLSearchParams into a clean plain JavaScript object
    req.query = Object.fromEntries(parsedUrl.searchParams.entries());
    req.params = {};

    // Add a method to get headers in a case-insensitive way
    req.get = function (name) {
        return req.headers[name.toLowerCase()];
    };
    // Add a method to check the content type of the request
    req.is = function (type) {
        const contentType = req.get("content-type");
        if (!contentType) { return false; }
        return contentType.includes(type);
    };

    // set HTTP status code and return the response object for chaining
    res.status = function (code) {
        res.statusCode = code;
        return res;
    };

    // set HTTP headers and return the response object for chaining
    res.set = function (field, value) {
        res.setHeader(field, value);
        return res;
    };

    //  Shortcut for Content-Type
    res.type = function (type) {
        return res.set("Content-Type", type);
    };

    // JSON response helper
    res.json = function (data) {
        if (res.writableEnded) return;
        res.type('application/json');
        res.end(JSON.stringify(data));
    };

    res.send = function (data) {
        if (res.writableEnded) return;
        if (Buffer.isBuffer(data)) {
            return res.end(data);
        }
        if (typeof data === "object") {
            return res.json(data);
        }
        if (typeof data === "string") {
            if (!res.getHeader("Content-Type")) {
                res.type("text/plain");
            }
            return res.end(data);
        }
        return res.end(String(data));
    }
    res.sendStatus = function (status) {
        const messages = {
            200: "OK",
            201: "Created",
            204: "No Content",
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            405: "Method Not Allowed",
            500: "Internal Server Error"
        };

        return res
            .status(status)
            .send(messages[status] || "");
    };

    res.redirect = function (url, status = 302) {
        return res
            .status(status)
            .set("Location", url)
            .end();
    };

    return { req, res };
}

module.exports = { context };