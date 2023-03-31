import * as user from  "./data/user.js";
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
  console.log('-------------------------------------------');
  await user.update(testUser._id, "Blue", "Floyd", "UsernameTest", "email@gg.com", "North Bergen", "NJ", "04/26/1994", 1, "asdmoa1!%asd")
  console.log('-------------------------------------------');
  console.log(await user.getAll());
  await closeConnection();
  console.log('closeConnection');
}