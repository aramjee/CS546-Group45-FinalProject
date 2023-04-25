import * as user from './data/user.js';
import * as gym from './data/gym.js';
import express from 'express';
const app = express();
import configRoutes from './routes/index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import exphbs from 'express-handlebars';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import session from 'express-session';

const staticDir = express.static(__dirname + '/public');

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  // If the user posts to the server with a property called _method, rewrite the request's method
  // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
  // rewritten in this middleware to a PUT route
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }

  // let the next middleware run:
  next();
};

app.use('/public', staticDir);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);

// Session middleware configuration
app.use(
  session({
    secret: 'zft7mxy2xvc.gax!WXD',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 3600000}
  })
);

//TODO: Pass login info in main handler bar, or request log
app.use((req, res, next) => {
  res.locals.userId = req.session.userId;
  next();
});

app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});

import { dbConnection, closeConnection } from './config/mongoConnection.js';

//await main();

async function main() {
  let testUser = undefined;

  //drop the database each time this is run
  const db = await dbConnection();
  await db.dropDatabase();

  console.log('-------------------------------------------');
  testUser = await user.create(
    'Pink',
    'Floyd',
    'UsernameTest',
    'email@gg.com',
    'North Bergen',
    'NJ',
    '04/26/1994',
    1,
    'asdmoa1!%asd'
  );
  console.log(testUser);
  // console.log(testUser._id)
  testUser.firstName = 'aaa';
  await user.update(testUser._id, testUser);
  console.log('-------------------------------------------');
  console.log(await user.getAll());
  let testGym = await gym.create(
    'TestGym',
    'https://www.netflix.com',
    'Training',
    testUser._id,
    'Add',
    'Cit',
    'NJ',
    '07047'
  );
  console.log(await gym.getAll());
  console.log(await user.getAll());
  console.log('-------------------------------------------');
  testGym.gymName = 'AAA';
  await gym.update(testGym._id, testGym);
  console.log(await gym.getAll());
  await gym.remove(testGym._id);
  console.log(await user.getAll());
  await closeConnection();
  console.log('closeConnection');
}
