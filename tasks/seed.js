//seed file

import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import { userData as users, gymData as gyms, reviewData as reviews, commentData as comments } from '../data/index.js';
const db = await dbConnection();
await db.dropDatabase();

let userA = undefined;
let gymA = undefined;
let gymOwnerA = undefined;
let reviewA = undefined;
let reviewB = undefined;
let commentA = undefined;
let commentB = undefined;


try {
    userA = await users.create(
        "John",
        "Doe",
        "johndoe",
        "dohndoe@stevens.edu",
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
        "Jane",
        "Foster",
        "janefoster",
        "janefoster@stevens.edu",
        "NY",
        "NY",
        "01/01/2000",
        1,
        "asfjdpojahsr3jsdfo!*-2"
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
let reviewA_id = await reviewA._id.toString();

try {
    reviewB = await reviews.create(
        gymA_id,
        userA_id,
        "01/04/2023",
        "I like this gym",
        5
    )
    console.log("reviewB is created!")
} catch (e) {
    console.log(e);
}
let reviewB_id = reviewB._id.toString();
//get, getAll, getGymReviews, getUserReviews, create, removeReview, updateReviewContent, updateReviewComment, updateReviewRating
//console.log("this is get review A")
//console.log(await reviews.get(reviewA_id));
//console.log("this is get all")
//console.log(await reviews.getAll())
//console.log("this is get gym all reviews")
//console.log(await reviews.getGymReviews(gymA_id));
//console.log("this is get user all reviews")
//console.log(await reviews.getUserReviews(userA_id));
// console.log(await reviews.removeReview(reviewB_id));
console.log("reviewB is removed!");
await reviews.updateReviewContent(reviewA_id, "great!", "01/30/2023");
console.log("reviewA content is updated!")
await reviews.updateReviewRating(reviewA_id, 4.5, "01/30/2023");
console.log("reviewA grading is updated!")


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


try {
    commentB = await comments.create(
        userA_id,
        "01/04/2023",
        "I agree",
        reviewA_id
    )
    console.log("commentB is created!")

} catch (e) {
    console.log(e);
}
let commentB_id = commentB._id.toString();

//get, getAllByReview, getAllByUser, create, remove, update
//console.log(await comments.get(commentA_id));
// console.log(await comments.getAllByReview(reviewA_id));
// console.log("this is commentB remove!")
await comments.remove(commentB_id);
console.log("commentB is removed!")
await comments.update(commentA_id, "awesome", "04/07/2023");
console.log("commentA is updated!")



console.log('Done seeding database');

await closeConnection();



