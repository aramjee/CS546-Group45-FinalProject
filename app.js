import * as user from  "./data/user.js";
import * as gym from  "./data/gym.js";

import {dbConnection, closeConnection} from './config/mongoConnection.js';

await main();

async function main() {
  let testUser = undefined;

  //drop the database each time this is run
  const db = await dbConnection();
  await db.dropDatabase();

  console.log('-------------------------------------------');
  testUser = await user.create("Pink", "Floyd", "UsernameTest", "email@gg.com", "North Bergen", "NJ", "04/26/1994", 1, "asdmoa1!%asd");
  console.log(testUser);
  // console.log(testUser._id)
  testUser.firstName = "aaa"
  await user.update(testUser._id, testUser)
  console.log('-------------------------------------------');
  console.log(await user.getAll());
  let testGym = await gym.create("TestGym", "https://www.netflix.com", "Training", testUser._id, "Add", "Cit", "NJ", "07047");
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