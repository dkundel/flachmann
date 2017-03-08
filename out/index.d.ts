/// <reference types="express" />
import { Application } from 'express';
import 'reflect-metadata';
import { FlachmannApp } from './interfaces';
export default function FlachmannApp(app?: Application): FlachmannApp;
export { RequestType, ClassDecorator, ResourceDecoratorFactory, BaseDecoratorFactory, MethodDecorator, RouteDecoratorFactory, FlachmannApp, BaseConfig, ResourceConfig, RouteConfig } from './interfaces';
