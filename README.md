[![npm](https://img.shields.io/npm/v/flachmann.svg?style=flat-square)]() [![npm](https://img.shields.io/npm/dt/flachmann.svg?style=flat-square)]() [![npm](https://img.shields.io/npm/l/flachmann.svg?style=flat-square)]()

# [flachmann](https://npmjs.org/package/flachmann) - Resource oriented API development

## :warning: ATTENTION! :warning: 
This is very much work in progress. I started this to learn a bit more about TypeScript's Decorator support. More coming soon

## Requirements

This package currently only works with [TypeScript](https://typescriptlang.org) and is an extension to [Express](http://expressjs.com/en/4x/api.html).

## Installation

You can install this package via [`npm`](https://npmjs.org) or [`yarn`](https://yarnpkg.com).

### Using `npm`:
```bash
npm install flachman --save
```

### Using `yarn`:
```bash
yarn add flachmann
```

## Usage

### 1. Import the library in your file:

```ts
import Flachmann from 'flachmann';
```

### 2. Initialize App:

#### a) The first time you use it in your app:

```ts
const App = Flachmann(yourExpressApp);
```

#### b) Subsequent files don't have to pass in an express app.

```ts
const App = Flachmann(yourExpressApp);
```

### 3. Use the different decorators on classes and methods

## :books: API

### `@App.Base(config?: BaseConfig)`

**Type**: Class Decorator

**Info**: Registers the class as the main router for the application. Meaning it does not generate any base route.

**Config Parameters**:

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `middleware` | `RequestHandler[]` | `false` | Array of ExpressJS request handlers ([middleware](http://expressjs.com/en/guide/using-middleware.html)) that should be executed on every request to any subroute. |

**Example**:
```ts
@App.Base()
class Api {
  @App.get('/')
  someMethod() {
    return 'Ahoy!'
  }
}
// Creates the following endpoints:
// GET / => 'Ahoy!'
```

### `@App.Resource(resourceNameOrConfig?: string | ResourceConfig)`

**Type**: Class Decorator

**Info**: Registers the class as a route while taking the class name and turning it into a base route. For this it will modify the name using [`kebab case`](https://lodash.com/docs/4.16.6#kebabCase) and [`pluralize`](https://www.npmjs.com/package/pluralize) to determine the the base route. 

**Config Parameters**:

| Property | Type | Required | Description | Example |
| --- | --- | --- | --- | --- |
| `name` | `string` | `false` | Overrides the default behavior of using the class name for the base route. Also does not *pluralize* or use *kebab case* | `'demo'` |
| `prefix` | `boolean` | `false` | URL prefix that will be appended before the name | `'/api'` |
| `middleware` | `RequestHandler[]` | `false` | Array of ExpressJS request handlers ([middleware](http://expressjs.com/en/guide/using-middleware.html)) that should be executed on every request to any subroute. |  |

**Example**:
```ts
@App.Resource()
class Person {
  @App.get('/')
  someMethod() {
    return 'Ahoy!'
  }
}
// Creates the following endpoints:
// GET /people => 'Ahoy!'
```

### `@App.get(routeOrConfig: string | RouteConfig)` <br> `@App.post(routeOrConfig: string | RouteConfig)` <br> `@App.delete(routeOrConfig: string | RouteConfig)` <br> `@App.patch(routeOrConfig: string | RouteConfig)` <br> `@App.put(routeOrConfig: string | RouteConfig)`

**Type**: Method Decorator

**Info**: Registers the method as a route handler using the respective HTTP request type: `GET`, `POST`, `DELETE`, `PATCH`, `PUT`. If you don't specify a name it will [`kebab case`](https://lodash.com/docs/4.16.6#kebabCase) the function name.

:warning: **Behavior**: Unless you set the `useResponse` config to `true` the system will check the return value of the method you tagged and send that as a response. Alternatively your method can return a `Promise` for async operations.

**Config Parameters**:

| Property | Type | Required | Description | Example |
| --- | --- | --- | --- | --- |
| `route` | `string` | `false` | Overrides the default of using the *kebab case* version of the function name and let's you specify your own. Supports the same path syntax as [`ExpressJS`](http://expressjs.com/en/4x/api.html#router) | `'/hello/:name'` |
| `useResponse` | `boolean` | `false` | If set to `true` it will behave like a normal [ExpressJS request handler](http://expressjs.com/en/guide/using-middleware.html) and expect you to use `res.send()` rather than returning a value or `Promise` | `true` |
| `middleware` | `RequestHandler[]` | `false` | Array of ExpressJS request handlers ([middleware](http://expressjs.com/en/guide/using-middleware.html)) that should be executed on every request to any subroute. |  |

**Example**:
```ts
@App.Resource()
class Greeting {
  @App.get()
  hello(req: Request) {
    return 'Hello';
  }

  @App.get({ useResponse: true })
  ahoy(req: Request, res: Response) {
    res.status(418).type('text/xml').send('<Say>Ahoy!</Say>');
  }

  @App.post({
    route: '/moin',
    middleware: [bodyParser.urlencoded({ extended: false })]
  })
  someMethodName() {
    return 'Moin moin!';
  }

  @App.delete('/bye')
  someOtherMethod() {
    return 'Bye :(';
  }
}
// Creates the following endpoints:
// GET /greetings/hello => 'Hello'
// GET /greetings/ahoy => <Say>Ahoy!</Say>
// POST /greetings/moin => 'Moin moin!'
// DELETE /greetings/bye => 'Bye :('
```

### `@App.all(routeOrConfig: string | RouteConfig)`

**Type**: Method Decorator

**Info**: Behaves the same way as the other method decorators and has the same options. It will respond to all HTTP types though. 

## Examples

Check out the [test/test.ts](test/test.ts) and [test/test-resource.ts](test/test-resource.ts) for example code.

## Contribute

1. Fork the repository
2. `git clone` your forked repository
3. Install the dependencies using `npm install` or `yarn` inside the document
4. Create a new branch
5. Do the respective changes, update the `README.md` file and test files if necessary.
6. Test your changes by running `npm test`
7. Push your changes and open a new Pull Request.
8. :tada: Get merged :tada:

## License

MIT

## Contributors

Dominik Kundel <dominik.kundel@gmail.com>