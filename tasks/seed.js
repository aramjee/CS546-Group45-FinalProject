// this is the seed file for the database. 

import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import { userData as users, gymData as gyms, reviewData as reviews, commentData as comments } from '../data/index.js';
const db = await dbConnection();
await db.dropDatabase();

let userA = undefined;
let gymA = undefined;
let gymOwnerA = undefined;
let reviewA = undefined;
let commentA = undefined;

try {
    userA = await users.create(
        "firstName",
        "lastName",
        "userName",
        "email@stevens.edu",
        "NY",
        "NY",
        "01/01/2000",
        0,
        "safdsavd9bjdasnf13456yu*-2"
    );
    console.log('userA has been created');
} catch (e) {
    console.log(e);
}
let userA_id = userA._id.toString();

try {
    gymOwnerA = await users.create(
        "firstName",
        "lastName",
        "userName",
        "email1@stevens.edu",
        "NY",
        "NY",
        "01/01/2000",
        1,
        "safdsavd9bjdasnf13456yu*-2"
    );
    console.log('gymOwnerA has been created');
} catch (e) {
    console.log(e);
}
let gymOwnerA_id = gymOwnerA._id.toString();



try {
    gymA = await gyms.create(
        "Equinox",
        "https://www.linkinpark.com",
        "gym",
        gymOwnerA_id,
        "35 Hudson Yards",
        "New York",
        "New York",
        "10001"
    )
    console.log('gymA has been created');
} catch (e) {
    console.log(e);
}
let gymA_id = gymA._id.toString();

try {
    reviewA = await reviews.create(
        gymA_id,
        userA_id,
        "01/04/2023",
        "I like this gym",
        5
    )
    console.log("reviewA is created!")
} catch (e) {
    console.log(e);
}
let reviewA_id = reviewA._id.toString();

try {
    commentA = await comments.create(
        userA_id,
        "01/04/2023",
        "I agree",
        reviewA_id
    )
    console.log("commentA is created!")

} catch (e) {
    console.log(e);
}
let commentA_id = commentA._id.toString();










console.log('Done seeding database');

await closeConnection();