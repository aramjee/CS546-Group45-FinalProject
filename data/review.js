// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link 
// This data file should export all functions using the ES6 standard as shown in the lecture code

import { reviewCollection } from '../config/mongoCollections.js';

import { ObjectId } from 'mongodb';
import { validation } from '../helpers.js';
import { userDataFunctions } from './user.js'
import { gymDataFunctions } from './user.js'

// get review by review's id, return the review object
async function getReview(id) {
    id = validation.checkId(id, 'id')
    const reviewsCollection = await reviewCollection();
    const review = await reviewsCollection.findOne({ _id: new ObjectId(id) });
    if (review === null) throw 'No review with that id';
    // convert all objectId to string
    review._id = review._id.toString();
    for (const comment of review.comments) {
        comment._id = comment._id.toString()
    }
    return review;
}

// get a gym's all  review, return a list of reviewIds (string)
async function getGymReviews(gymId) {
    userId = validation.checkId(userId, 'userId')
    const reviewsCollection = await reviewCollection();
    if (!gymDataFunctions.get(id)) {
        throw `no user have such id`
    }
    const reviewList = await reviewsCollection.find({ gymId: new ObjectId(gymId) }).toArray();
    // If there are no review for the user, this function will return an empty array
    let gymReview = [];
    for (const review of reviewList) {
        gymReview.push(review._id.toString());
    }
    return gymReview;
}

// get a user's all previous review, return a list of reviewIds (string)
async function getUserReviews(userId) {
    userId = validation.checkId(userId, 'userId')
    const reviewsCollection = await reviewCollection();
    // check is user id exist in database, TBD.
    if (!userDataFunctions.get(id)) {
        throw `no user have such id`
    }
    const reviewList = await reviewsCollection.find({ userId: new ObjectId(userId) }).toArray();

    // If there are no review for the user, this function will return an empty array
    let userReview = [];
    for (const review of reviewList) {
        userReview.push(review._id.toString());
    }
    return userReview;
}

// create a review
// also add a review to user collection 
// and add a review to the gym and adjust its rating
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

    // user collection add a review
    let user = await userDataFunctions.get(userId)
    let updatedReview = await this.getUserReviews(userId)
    await userDataFunctions.update(
        user._id,
        user.firstName,
        user.lastName,
        user.userName,
        user.email,
        user.city,
        user.state,
        user.dateOfBirth,
        user.isGymOwner,
        user.hashedPassword,
        updatedReview,
        user.comments)
    // TODO: need to check user function


    // gym collection add a review
    let UpdatedgymReviews = await this.getGymReviews(gymId)
    let gym = await gymDataFunctions.get(gymId)
    let ratings = []
    for (review of UpdatedgymReviews) {
        ratings.push(review.rating)
    }
    let total = ratings.reduce((acc, c) => acc + c, 0)
    let grade = ((Math.floor((total / ratings.length) * 10)) / 10)

    await gymDataFunctions.update(
        gym.gymId,
        gym.website,
        gym.gymOwnerId,
        gym.city,
        gym.state,
        gym.zip,
        UpdatedgymReviews,
        gym.likedGymsCnt,
        gym.dislikedGymsCnt,
        grade)
    // finally
    const review = await this.get(newId);
    return review;
}

// remove a review
// todo: user collection delete the review
// todo: gym collection delete the review, adjust the rating
async function removeReview(id) {
    id = validation.checkId(id, 'id')
    const reviewsCollection = await reviewCollection();
    const deletionInfo = await reviewsCollection.findOneAndDelete({
        _id: new ObjectId(id)
    });
    if (deletionInfo.lastErrorObject.n === 0) {
        throw `Could not delete review with id of ${id}`;
    }


    // user collection remove a review
    let user = await userDataFunctions.get(userId)
    let updatedReviews = await this.getUserReviews(userId)
    await userDataFunctions.update(
        user._id,
        user.firstName,
        user.lastName,
        user.userName,
        user.email,
        user.city,
        user.state,
        user.dateOfBirth,
        user.isGymOwner,
        user.hashedPassword,
        updatedReviews,
        user.comments)
    // TODO: need to check user function


    // gym collection remove a review
    // gym collection add a review
    let UpdatedgymReviews = await this.getGymReviews(gymId)
    let gym = await gymDataFunctions.get(newReview.gymId)
    let ratings = []
    for (review of UpdatedgymReviews) {
        ratings.push(review.rating)
    }
    let total = ratings.reduce((acc, c) => acc + c, 0)
    let grade = ((Math.floor((total / ratings.length) * 10)) / 10)

    await gymDataFunctions.update(
        gym.gymId,
        gym.website,
        gym.gymOwnerId,
        gym.city,
        gym.state,
        gym.zip,
        UpdatedgymReviews,
        gym.likedGymsCnt,
        gym.dislikedGymsCnt,
        grade)

    // finally
    return `${deletionInfo.value.name} has been successfully deleted!`;

}

// update a review, only possible for the content and rating?
// todo: update on rating --> gym rating?
async function updateReviewContent(
    id,
    content,
    dataOfReview
) {
    id = validation.checkId(id, 'id');
    // how to check content and date?

    const reviewsCollection = await reviewCollection();
    const updatedInfo = await reviewsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { content: content, dataOfReview: dataOfReview } },
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

// todo: update on rating --> gym rating?
async function updateReviewRating(
    id,
    rating,
    dataOfReview
) {
    id = validation.checkId(id, 'id');
    // how to check content and date?

    const reviewsCollection = await reviewCollection();
    const updatedInfo = await reviewsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { rating: rating, dataOfReview: dataOfReview } },
        { returnDocument: 'after' }
    );
    const newReview = await get(id);
    if (JSON.stringify(oldReview) === JSON.stringify(newReview)) {
        throw `there's no real update, everything is the same`;
    }
    if (updatedInfo.lastErrorObject.n === 0) {
        throw 'could not update review successfully';
    }

    let UpdatedgymReviews = await this.getGymReviews(newReview.gymId)
    let gym = await gymDataFunctions.get(newReview.gymId)
    let ratings = []
    for (review of UpdatedgymReviews) {
        ratings.push(review.rating)
    }
    let total = ratings.reduce((acc, c) => acc + c, 0)
    let grade = ((Math.floor((total / ratings.length) * 10)) / 10)

    await gymDataFunctions.update(
        gym.gymId,
        gym.website,
        gym.gymOwnerId,
        gym.city,
        gym.state,
        gym.zip,
        UpdatedgymReviews,
        gym.likedGymsCnt,
        gym.dislikedGymsCnt,
        grade)

    // finally 
    return await this.get(id);
}


export const reviewDataFunctions = { getReview, getGymReviews, getUserReviews, createReview, removeReview, updateReviewContent, updateReviewRating }

