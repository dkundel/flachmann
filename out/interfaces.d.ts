/// <reference types="express" />
import { RequestHandler } from 'express';
export declare type RequestType = 'get' | 'post' | 'delete' | 'put' | 'patch' | 'all';
export declare type ClassDecorator = (target: Function) => void;
export declare type ResourceDecoratorFactory = (nameOrConfig?: string | ResourceConfig) => ClassDecorator;
export declare type BaseDecoratorFactory = (config?: BaseConfig) => ClassDecorator;
export declare type MethodDecorator = (target: any, fnName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare type RouteDecoratorFactory = (routeOrConfig?: string | RouteConfig) => MethodDecorator;
export interface FlachmannApp {
    Base: BaseDecoratorFactory;
    Resource: ResourceDecoratorFactory;
    get: RouteDecoratorFactory;
    post: RouteDecoratorFactory;
    delete: RouteDecoratorFactory;
    put: RouteDecoratorFactory;
    patch: RouteDecoratorFactory;
    all: RouteDecoratorFactory;
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
