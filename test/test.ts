import Flachmann from '../lib';
import * as express from 'express';

const app = express();
const App = Flachmann(app);

const PORT = process.env.PORT || 9999;

@App.Base()
class Api {
  @App.get()
  ahoy() {
    return 'Ahoy from Flachmann!';
  }
}

import './test-resource';

// This app has the following routes
// GET /ahoy => 'Ahoy from Flachmann!'
// GET /people/hello => 'Hello from flachmann'
// GET /people/hey => 'hey you!'
// GET /people/moin/:name => { greeting: 'Moin Dominik' } 
app.listen(PORT, () => console.log('listening'));