import { RequestHandler } from 'express';

export type RequestType = 'get' | 'post' | 'delete' | 'put' | 'patch' | 'use';
export type ClassDecorator = (target: Function) => void;
export type ResourceDecoratorFactory = (nameOrConfig?: string | ResourceConfig) => ClassDecorator;
export type BaseDecoratorFactory = (config?: BaseConfig) => ClassDecorator; 
export type MethodDecorator = (target: any, fnName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export type RouteDecoratorFactory = (routeOrConfig?: string | RouteConfig) => MethodDecorator;

export interface FlachmannApp {
  Base: BaseDecoratorFactory;
  Resource: ResourceDecoratorFactory;
  get: RouteDecoratorFactory;
  post: RouteDecoratorFactory;
  delete: RouteDecoratorFactory;
  put: RouteDecoratorFactory;
  patch: RouteDecoratorFactory;
  use: RouteDecoratorFactory;
}

export interface BaseConfig {
  middleware?: RequestHandler[];
}

export interface ResourceConfig {
  name?: string;
  prefix?: string;
  middleware?: RequestHandler[];
}

export interface RouteConfig {
  route?: string;
  useResponse?: boolean;
  middleware?: RequestHandler[];
}