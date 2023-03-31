// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link 
// This data file should export all functions using the ES6 standard as shown in the lecture code

import { reviewCollection } from '../config/mongoCollections.js';
import { gymCollection } from '../config/mongoCollections.js';
import { userCollection } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import { validation } from '../helpers.js';
import { userDataFunctions } from './users.js'

// get review by review's id, return the review object
async function getReview(id) {
    id = validation.checkId(id, 'id')
    const reviewsCollection = await reviewCollection();
    const review = await reviewsCollection.findOne({ _id: new ObjectId(id) });
    if (review === null) throw 'No review with that id';
    // convert all objectId to string
    review._id = review._id.toString();
    for (const comment of band.comments) {
        comment._id = comment._id.toString()
    }
    return review;
}

// get a user's all previous review, return a list of reviewIds (string)
async function getUserReviews(userId) {
    userId = validation.checkId(userId, 'userId')
    const reviewsCollection = await reviewCollection();
    const userCollection = await userCollection();
    // check is user id exist in database, TBD.
    if (!userDataFunctions.get(id)) {
        throw `no user have such id`
    }
    const reviewList = await reviewsCollection.find({ user_id: new ObjectId(userId) }).toArray();
    // if (reviewList.length === 0) {
    //   throw `invalid user id`
    // }
    // If there are no review for the user, this function will return an empty array
    let userReview = [];
    for (const review of reviewList) {
        userReview.push(review._id.toString());
    }
}
return userReview;

// create a review
async function createReview(
    gymId,
    userId,
    dataOfReview,
    content,
    rating) {

    [gymId, userId, dataOfReview, content, rating] = validation.checkReviewInputCreatePut(gymId, userId, dataOfReview, content, rating)
    let newReview = {
        gymId: gymId,
        userId: userId,
        dataOfReview: dataOfReview,
        content: content,
        comments: new Array(),
        rating: rating
    }
    //TODO: since the content of the review is optional, 1)check if could just be empty string 2)check if empty review, there's no comment option.
    const reviewsCollection = await reviewCollection();
    const insertInfo = await reviewsCollection.insertOne(newReview);
    if (!insertInfo || !insertInfo.insertedId) {
        throw 'Could not add review';
    }
    const newId = insertInfo.insertedId.toString();
    const review = await this.get(newId);
    return review;
}

// remove a review
async function removeReview(id) {
    id = validation.checkId(id, 'id')
    const reviewsCollection = await reviewCollection();
    const deletionInfo = await reviewsCollection.findOneAndDelete({
        _id: new ObjectId(id)
    });
    if (deletionInfo.lastErrorObject.n === 0) {
        throw `Could not delete review with id of ${id}`;
    }
    return `${deletionInfo.value.name} has been successfully deleted!`;

}

// update a review, only possible for the content?
async function updateReview(
    id,
    content,
    dataOfReview
) {
    id = validation.checkId(id, 'id');
    // how to check content?
    const oldreview = await get(id);
    // how to check date?
    const oldReview = await get(id);
    const updatedReview = {
        content: content,
        overallRating: grade
    }
    const reviewsCollection = await reviewCollection();
    const updatedInfo = await reviewsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { content: content, dataOfReview: date } },
        { returnDocument: 'after' }
    );
    const newReview = await get(id);
    if (JSON.stringify(oldReview) === JSON.stringify(newReview)) {
        throw `there's no real update, everything is the same`;
    }
    if (updatedInfo.lastErrorObject.n === 0) {
        throw 'could not update review successfully';
    }
    return await this.get(id);
}

export const reviewDataFunctions = { getReview, getUserReviews, createReview, removeReview, updateReview }

