class Router {
    constructor() {
        this.routes = [];
    }

    add(method, path, handlers) {
        const paramNames = [];
        const parsedPath = path.replace(/:([^\/]+)/g, (_, key) => {
            paramNames.push(key);
            return '([^\\/]+)';
        });
        const regex = new RegExp(`^${parsedPath}$`);
        this.routes.push({ method: method.toUpperCase(), regex, paramNames, handlers });
    }

    match(method, pathname) {
        for (const route of this.routes) {
            if (route.method === method) {
                const match = pathname.match(route.regex);
                if (match) {
                    const params = {};
                    route.paramNames.forEach((name, index) => {
                        params[name] = match[index + 1];
                    });
                    return { handlers: route.handlers, params };
                }
            }
        }
        return null;
    }
}

module.exports = Router;