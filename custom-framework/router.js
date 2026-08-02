class Router {
    constructor() {
        this.routes = [];
    }
    add(method, path, handlers) {
        const { regex, keys } = this.compile(path);
        this.routes.push({
            method: method.toUpperCase(),
            path,
            regex,
            keys,
            handlers
        });
    }

    compile(path) {
        const keys = [];
        const pattern = path.replace(/:([^/]+)/g, (_, key) => {
            keys.push(key);
            return "([^/]+)";
        });

        return {
            regex: new RegExp(`^${pattern}$`),
            keys
        };
    }

    match(method, pathname) {
        let pathExists = false;
        for (const route of this.routes) {
            const match = pathname.match(route.regex);
            if (!match) {
                continue;
            }
            pathExists = true;
            if (route.method !== method.toUpperCase()) {
                continue;
            }
            const params = {};
            route.keys.forEach((key, index) => {
                params[key] = decodeURIComponent(match[index + 1]);
            });

            return {
                found: true,
                status: 200,
                route,
                params,
                handlers: route.handlers
            };
        }

        return {
            found: false,
            status: pathExists ? 405 : 404
        };
    }
    list() {
        return this.routes.map(route => ({
            method: route.method,
            path: route.path
        }));
    }
}

module.exports = Router;