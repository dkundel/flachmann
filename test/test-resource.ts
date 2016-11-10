import FlachmannApp from '../lib';

const App = FlachmannApp();

function middleware(req, res, next) {
  res.set('X-TEST-HEADER','flachmann');
  next();
}

@App.Resource({
  middleware: [middleware]
})
class Person {
  @App.get({
    useResponse: true
  })
  hello(req, res, next) {
    res.send('Hello from flachmann');
  }

  @App.get()
  hey() {
    return 'hey you!';
  }

  @App.get({
    route: '/moin/:name'
  })
  moin(req) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ greeting: `Moin ${req.params.name}!`});
      }, 1000);
    });
  }
}