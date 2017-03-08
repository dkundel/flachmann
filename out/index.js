"use strict";
const express_1 = require('express');
const lodash_1 = require('lodash');
const pluralize_1 = require('pluralize');
require('reflect-metadata');
const DEFAULT_BASE_CONFIG = {
    middleware: []
};
const DEFAULT_RESOURCE_CONFIG = {
    name: undefined,
    prefix: '',
    middleware: []
};
const DEFAULT_ROUTE_CONFIG = {
    route: undefined,
    useResponse: false,
    middleware: []
};
const ROUTER_KEY = Symbol('flachmann:router');
let FLACHMANN_APP;
function setDefaults(defaults, config) {
    return Object.assign({}, defaults, config);
}
function getOrCreateRouter(target) {
    let router = Reflect.getMetadata(ROUTER_KEY, target);
    if (!router) {
        router = express_1.Router();
    }
    return router;
}
function FlachmannApp(app) {
    if (!app) {
        if (FLACHMANN_APP) {
            return FLACHMANN_APP;
        }
        else {
            throw new SyntaxError('No Express app registered. Make sure to first call FlachmannApp with a valid Express app before calling it in other files.');
        }
    }
    function Base(config) {
        return function (target) {
            config = setDefaults(DEFAULT_BASE_CONFIG, config);
            let router = Reflect.getMetadata(ROUTER_KEY, target.prototype);
            app.use(...config.middleware, router);
        };
    }
    function Resource(resourceOrConfig) {
        return function (target) {
            let config;
            if (typeof resourceOrConfig === 'string') {
                config = {
                    name: resourceOrConfig
                };
            }
            else {
                config = resourceOrConfig;
            }
            config = setDefaults(DEFAULT_RESOURCE_CONFIG, config);
            if (!config.name) {
                config.name = pluralize_1.plural(lodash_1.kebabCase(target.name));
            }
            let router = Reflect.getMetadata(ROUTER_KEY, target.prototype);
            app.use(`${config.prefix}/${config.name}`, ...config.middleware, router);
        };
    }
    function routeHandlerFactory(requestType) {
        return function (routeOrConfig) {
            return function (target, fnName, descriptor) {
                let config;
                if (typeof routeOrConfig === 'undefined') {
                    config = {
                        route: `/${lodash_1.kebabCase(fnName)}`
                    };
                }
                else {
                    config = routeOrConfig;
                }
                config = setDefaults(DEFAULT_ROUTE_CONFIG, config);
                if (!config.route) {
                    config.route = `/${lodash_1.kebabCase(fnName)}`;
                }
                let router = getOrCreateRouter(target);
                if (!config.useResponse) {
                    router[requestType](config.route, ...config.middleware, function (...args) {
                        let [, res] = args;
                        let response = descriptor.value.apply(this, args);
                        if (typeof response.then === 'function') {
                            response.then(responseObject => {
                                res.send(responseObject);
                            }).catch(err => {
                                res.status(500).send(err);
                            });
                        }
                        else {
                            res.send(response);
                        }
                    });
                }
                else {
                    router[requestType](config.route, ...config.middleware, descriptor.value);
                }
                Reflect.defineMetadata(ROUTER_KEY, router, target);
                return descriptor;
            };
        };
    }
    FLACHMANN_APP = {
        Base,
        Resource,
        get: routeHandlerFactory('get'),
        post: routeHandlerFactory('post'),
        delete: routeHandlerFactory('delete'),
        put: routeHandlerFactory('put'),
        patch: routeHandlerFactory('patch'),
        all: routeHandlerFactory('all')
    };
    return FLACHMANN_APP;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FlachmannApp;
