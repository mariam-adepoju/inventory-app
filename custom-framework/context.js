const url = require('url');

function context(req, res) {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    req.path = parsedUrl.pathname;

    // Convert URLSearchParams into a clean plain JavaScript object
    req.query = Object.fromEntries(parsedUrl.searchParams.entries());
    req.params = {};

    res.status = function (code) {
        res.statusCode = code;
        return res;
    };

    res.json = function (data) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
    };

    res.send = function (data) {
        if (typeof data === 'object') return res.json(data);
        res.setHeader('Content-Type', 'text/plain');
        res.end(data);
    };
}

module.exports = { context };