// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link 
// This data file should export all functions using the ES6 standard as shown in the lecture code

import { reviewCollection } from '../config/mongoCollections.js';
import { gymCollection } from '../config/mongoCollections.js';
import { userCollection } from '../config/mongoCollections.js';
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
    const usersCollection = await userCollection();
    let users = await usersCollection.find({ _id: new ObjectId(newReview.userId) }).toArray();
    let oldUserReviews = []
    for (const user of users) {
        for (const review of user.reviews) {
            oldUserReviews.push(review)
        }
    }
    const updatedUser = {
        reviews: oldUserReviews
    }
    updatedUser.reviews.push(newId)
    const updatedInfoUser = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId(newReview.userId) },
        { $set: updatedUser },
        { returnDocument: 'after' }
    );
    if (updatedInfoUser.lastErrorObject.n === 0) {
        throw 'could not update user successfully';
    }

    // gym collection add a review
    const gymsCollection = await gymCollection();
    let gyms = await gymsCollection.find({ _id: new ObjectId(newReview.gymId) }).toArray();
    let oldGymReviews = []
    let ratings = []
    for (const gym of gyms) {
        for (const review of gym.reviews) {
            oldGymReviews.push(review)
            ratings.push(review.rating)
        }
    }
    ratings.push(newReview.rating)
    let total = ratings.reduce((acc, c) => acc + c, 0)
    let grade = ((Math.floor((total / ratings.length) * 10)) / 10)

    const updatedGym = {
        reviews: oldGymReviews,
        OverallRating: grade
    }
    updatedGym.reviews.push(newId)
    const updatedInfoGym = await gymsCollection.findOneAndUpdate(
        { _id: new ObjectId(newReview.gymId) },
        { $set: updatedGym },
        { returnDocument: 'after' }
    );
    if (updatedInfoGym.lastErrorObject.n === 0) {
        throw 'could not update gym successfully';
    }

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
    const usersCollection = await userCollection();
    let users = await usersCollection.find({ _id: new ObjectId(newReview.userId) }).toArray();
    let oldUserReviews = []
    for (const user of users) {
        for (const review of user.reviews) {
            if (review === id) {
                continue
            }
            else { oldUserReviews.push(review) }
        }
    }
    const updatedUser = {
        reviews: oldUserReviews
    }
    const updatedInfoUser = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId(newReview.userId) },
        { $set: updatedUser },
        { returnDocument: 'after' }
    );
    if (updatedInfoUser.lastErrorObject.n === 0) {
        throw 'could not update user successfully';
    }

    // gym collection remove a review
    const gymsCollection = await gymCollection();
    let gyms = await gymsCollection.find({ _id: new ObjectId(newReview.gymId) }).toArray();
    let oldGymReviews = []
    let ratings = []
    for (const gym of gyms) {
        for (const review of gym.reviews) {
            if (review === id) {
                continue;
            }
            else {
                oldGymReviews.push(review)
                ratings.push(review.rating)
            }

        }
    }
    let total = ratings.reduce((acc, c) => acc + c, 0)
    let grade = ((Math.floor((total / ratings.length) * 10)) / 10)

    const updatedGym = {
        reviews: oldGymReviews,
        OverallRating: grade
    }
    const updatedInfoGym = await gymsCollection.findOneAndUpdate(
        { _id: new ObjectId(newReview.gymId) },
        { $set: updatedGym },
        { returnDocument: 'after' }
    );
    if (updatedInfoGym.lastErrorObject.n === 0) {
        throw 'could not update gym successfully';
    }


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

    // update gym overall rating
    const gymsCollection = await gymCollection();
    let gyms = await gymsCollection.find({ _id: new ObjectId(newReview.gymId) }).toArray();
    let ratings = []
    for (const gym of gyms) {
        for (const review of gym.reviews) {
            ratings.push(review.rating)
        }
    }
    let total = ratings.reduce((acc, c) => acc + c, 0)
    let grade = ((Math.floor((total / ratings.length) * 10)) / 10)

    const updatedGym = {
        OverallRating: grade
    }
    const updatedInfoGym = await gymsCollection.findOneAndUpdate(
        { _id: new ObjectId(newReview.gymId) },
        { $set: updatedGym },
        { returnDocument: 'after' }
    );
    if (updatedInfoGym.lastErrorObject.n === 0) {
        throw 'could not update gym successfully';
    }

    // finally 
    return await this.get(id);
}


export const reviewDataFunctions = { getReview, getGymReviews, getUserReviews, createReview, removeReview, updateReviewContent, updateReviewRating }

