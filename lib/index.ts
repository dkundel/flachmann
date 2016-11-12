import { Application, Router, RequestHandler } from 'express';
import { kebabCase } from 'lodash';
import { plural } from 'pluralize';
import 'reflect-metadata';

import { 
  RequestType, 
  ClassDecorator, 
  ResourceDecoratorFactory, 
  BaseDecoratorFactory, 
  MethodDecorator, 
  RouteDecoratorFactory, 
  FlachmannApp, 
  BaseConfig, 
  ResourceConfig, 
  RouteConfig
} from './interfaces';

const DEFAULT_BASE_CONFIG: BaseConfig = {
  middleware: []
}
const DEFAULT_RESOURCE_CONFIG: ResourceConfig = {
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

let FLACHMANN_APP: FlachmannApp;

function setDefaults<T>(defaults: T, config: T): T {
  return Object.assign({}, defaults, config);
}

function getOrCreateRouter(target: any): Router {
  let router = Reflect.getMetadata(ROUTER_KEY, target);
  if (!router) {
    router = Router();
  }
  return router;
}

export default function FlachmannApp(app?: Application): FlachmannApp {
  if (!app) {
    if (FLACHMANN_APP) {
      return FLACHMANN_APP;
    } else {
      throw new SyntaxError('No Express app registered. Make sure to first call FlachmannApp with a valid Express app before calling it in other files.');
    }
  }
  function Base(config?: BaseConfig): ClassDecorator {
    return function (target: Function) {
      config = setDefaults(DEFAULT_BASE_CONFIG, config);

      let router: Router = Reflect.getMetadata(ROUTER_KEY, target.prototype);
      app.use(...config.middleware, router);
    }
  }

  function Resource(resourceOrConfig?: string | ResourceConfig): ClassDecorator {
    return function (target: Function) {
      let config: ResourceConfig;
      if (typeof resourceOrConfig === 'string') {
        config = {
          name: resourceOrConfig
        };
      } else {
        config = resourceOrConfig;
      }

      config = setDefaults<ResourceConfig>(DEFAULT_RESOURCE_CONFIG, config);

      if (!config.name) {
        config.name = plural(kebabCase(target.name));
      }

      let router: Router = Reflect.getMetadata(ROUTER_KEY, target.prototype);
      app.use(`${config.prefix}/${config.name}`, ...config.middleware, router);
    }
  }

  function routeHandlerFactory(requestType: string): RouteDecoratorFactory {
    return function (routeOrConfig?: string | RouteConfig): MethodDecorator {
      return function (target: any, fnName: string, descriptor: PropertyDescriptor) {
        let config: RouteConfig;

        if (typeof routeOrConfig === 'undefined') {
          config = {
            route: `/${kebabCase(fnName)}`
          }
        } else {
          config = routeOrConfig
        }

        config = setDefaults<RouteConfig>(DEFAULT_ROUTE_CONFIG, config);

        if (!config.route) {
          config.route = `/${kebabCase(fnName)}`
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
            } else {
              res.send(response);
            }
          });
        } else {
          router[requestType](config.route, ...config.middleware, descriptor.value);
        } 

        Reflect.defineMetadata(ROUTER_KEY, router, target);

        return descriptor;
      }
    }
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

export { 
  RequestType, 
  ClassDecorator, 
  ResourceDecoratorFactory, 
  BaseDecoratorFactory, 
  MethodDecorator, 
  RouteDecoratorFactory, 
  FlachmannApp, 
  BaseConfig, 
  ResourceConfig, 
  RouteConfig
} from './interfaces';