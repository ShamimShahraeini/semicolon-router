class Router {
    // class methods  
    constructor(eventEmitter) {
        // each router should contain it's route list and should be aware of emitts of the server
        this.routes = {}
        this.routerEventEmitter = eventEmitter
        this.routerEventEmitter.on('routerReq', (req, res) => {
            this.route(req, res)
        })
    }

    route(req, res) {

        const reqUrl = req.url.split('?')[0]
        const reqMethod = req.method
        const globalRegex = new RegExp('\B\/\B', 'g')
        const Regex = new RegExp('\/public', 'g')
        const re = globalRegex.test(reqUrl)
        const rere = Regex.test(reqUrl)
        // looking for route that was requested; if exists in routes list do the middlewares (and handler) by order
        if (reqUrl === "/" || reqUrl === "/public") {
            req.url = "index.html"
            let middlewares = this.routes["/"][reqMethod].middlewares
            let handler = this.routes["/"][reqMethod].handler
            let firstMiddleware = prepareMiddlewares(middlewares, middlewares.length - 1, req, res, () => handler(req, res))
            firstMiddleware()
        } else if(re || rere){
            let middlewares = this.routes["/"][reqMethod].middlewares
            let handler = this.routes["/"][reqMethod].handler
            let firstMiddleware = prepareMiddlewares(middlewares, middlewares.length - 1, req, res, () => handler(req, res))
            firstMiddleware()
        } else if (this.routes.hasOwnProperty(reqUrl) && this.routes[reqUrl].hasOwnProperty(reqMethod)) {
            let middlewares = this.routes[reqUrl][reqMethod].middlewares
            let handler = this.routes[reqUrl][reqMethod].handler
            let firstMiddleware = prepareMiddlewares(middlewares, middlewares.length - 1, req, res, () => handler(req, res))
            firstMiddleware()
        } else {
            console.log(`Route ${reqMethod} ${reqUrl} not found!`)
            // send error via res here
            res.statusCode = 404
            res.end('Invalid Route!!!')
            return
        }
        // recursive func for adding each api middlewars
        function prepareMiddlewares(middlewares, index, req, res, next) {
            if (index === -1)
                return next
            return prepareMiddlewares(middlewares, index - 1, req, res, () => middlewares[index](req, res, next))
        }
    }

    addRoute(url, method, handler, middlewares) {
        // adding route and it's information to routes list of router
        if (!this.routes[url]) {
            this.routes[url] = {}
        }
        this.routes[url][method] = {
            handler: handler,
            middlewares: middlewares
        }
    }

    app(appRoutes) {
        // each app should introduse it's routes to router
        appRoutes.forEach((route) => {
            this.addRoute(route.url, route.method, route.handler, route.middlewares)
        })
    }

}

module.exports = Router