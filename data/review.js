// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link 
// This data file should export all functions using the ES6 standard as shown in the lecture code

import { reviewCollection } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import * as validation from '../public/js/validation.js';
import { userDataFunctions } from './user.js'
import { gymDataFunctions } from './gym.js'

// get review by review's id, return the review object
async function get(id) {
    await validation.checkArgumentsExist(id);
    id = await validation.checkObjectId(id, 'review id')
    const reviewsCollection = await reviewCollection();
    const review = await reviewsCollection.findOne({ _id: new ObjectId(id) });
    if (review === null)
        throw [400, `ERROR: ${id} No review with that id`]
    // convert all objectId to string
    review._id = review._id.toString();
    for (const comment of review.comments) {
        comment._id = comment._id.toString()
    }
    return review;
}
// get All, return list of review ids
async function getAll() {
    const reviewsCollection = await reviewCollection();
    let reviewList = await reviewsCollection.find({}).toArray();
    reviewList = reviewList.map((element) => {
        return element._id.toString();
    });
    return reviewList;
}

// get a gym's all  review, return a list of reviewIds (string)
async function getGymReviews(gymId) {
    await validation.checkArgumentsExist(gymId);
    gymId = await validation.checkObjectId(gymId, 'gym id')
    const reviewsCollection = await reviewCollection();
    if (!await gymDataFunctions.getByGymId(gymId)) {
        throw `no gym have such id`
    }
    const reviewList = await reviewsCollection.find({ gymId: gymId }).toArray();
    // If there are no review for the user, this function will return an empty array
    let gymReview = [];
    for (const review of reviewList) {
        gymReview.push(review._id.toString());
    }
    return gymReview;
}

// get a user's all previous review, return a list of reviewIds (string)
async function getUserReviews(userId) {
    await validation.checkArgumentsExist(userId);
    userId = await validation.checkObjectId(userId, 'userId')
    const reviewsCollection = await reviewCollection();
    // check is user id exist in database, TBD.
    if (!userDataFunctions.getByUserId(userId)) {
        throw `no user have such id`
    }
    const reviewList = await reviewsCollection.find({ userId: userId }).toArray();

    // If there are no review for the user, this function will return an empty array
    let userReview = [];
    for (const review of reviewList) {
        userReview.push(review._id.toString());
    }
    return userReview;
}

// create a review

async function create(
    gymId,
    userId,
    dateOfReview,
    content,
    rating) {
    validation.checkArgumentsExist(gymId, userId, dateOfReview, content, rating)
    validation.checkNonEmptyStrings(gymId, userId, dateOfReview);
    gymId = await validation.checkObjectId(gymId);
    userId = await validation.checkObjectId(userId);
    dateOfReview = await validation.checkValidDate(dateOfReview);

    rating = await validation.checkValidRating(rating);

    if (!userDataFunctions.getByUserId(userId)) {
        throw `no user have such id`;
    }
    if (!gymDataFunctions.getByGymId(gymId)) {
        throw `no gym have such id`;
    }
    const gymGet = await gymDataFunctions.getByGymId(gymId);

    let newReview = {
        gymId: gymId,
        userId: userId,
        dateOfReview: dateOfReview,
        content: content,
        comments: [],
        rating: rating
    }
    const reviewsCollection = await reviewCollection();
    const insertInfo = await reviewsCollection.insertOne(newReview);
    if (!insertInfo || !insertInfo.insertedId) {
        throw 'Could not add review';
    }
    const newId = insertInfo.insertedId.toString();

    // user collection add a review
    let updatedUser = await userDataFunctions.getByUserId(userId)

    let updatedReview = await this.getUserReviews(userId)
    updatedUser.reviews = updatedReview;
    await userDataFunctions.update(userId, updatedUser)

    // gym collection add a review
    let UpdatedgymReviews = await this.getGymReviews(gymId)
    let updatedGym = await gymDataFunctions.getByGymId(gymId)
    let ratings = []
    for (let review of UpdatedgymReviews) {
        ratings.push(review.rating)
    }

    ratings.push(rating)
    let total = ratings.reduce((acc, c) => acc + c, 0)
    let grade = ((Math.floor((total / ratings.length) * 10)) / 10)
    updatedGym.reviews = UpdatedgymReviews;
    updatedGym.rating = grade;


    await gymDataFunctions.update(gymId, updatedGym)
    // finally
    const review = await this.get(newId);

    return review;
}

// remove a review
async function removeReview(id) {
    await validation.checkArgumentsExist(id);
    id = await validation.checkObjectId(id, 'review id');
    if (!await this.get(id)) {
        throw `no review have this id`;
    }
    //get the user and gym before deletion
    let review = await this.get(id)
    let userId = review.userId;
    let gymId = review.gymId;
    // deletion
    const reviewsCollection = await reviewCollection();
    const deletionInfo = await reviewsCollection.findOneAndDelete({
        _id: new ObjectId(id)
    });
    if (deletionInfo.lastErrorObject.n === 0) {
        throw `Could not delete review with id of ${id}`;
    }

    // user collection remove a review

    let newReviewsUser = await getUserReviews(userId);
    let updatedUser = await userDataFunctions.getByUserId(userId);
    updatedUser.reviews = newReviewsUser;
    await userDataFunctions.update(userId, updatedUser)

    // gym collection remove a review
    let updatedGym = await gymDataFunctions.getByGymId(gymId) // the gym object
    let newReviewGym = await this.getGymReviews(gymId); // updated review
    updatedGym.reviews = newReviewGym; // update review list
    let allRatings = []
    for (review of newReviewGym) {
        allRatings.push(review.rating)
    }
    let total = allRatings.reduce((acc, c) => acc + c, 0)
    let grade = ((Math.floor((total / allRatings.length) * 10)) / 10)
    updatedGym.rating = grade;  // update rating 
    await gymDataFunctions.update(gymId, updatedGym)

    // finally
    return `${deletionInfo.value.name} has been successfully deleted!`;

}

// update a review, only possible for the content and rating?
// todo: update on rating --> gym rating?
async function updateReviewContent(
    id,
    content,
    dateOfReview
) {
    await validation.checkArgumentsExist(id, content, dateOfReview);
    dateOfReview = await validation.checkValidDate(dateOfReview);
    id = await validation.checkObjectId(id, 'review id');
    // how to check content and date?
    const oldReview = await get(id);
    const reviewsCollection = await reviewCollection();
    const updatedInfo = await reviewsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { content: content, dateOfReview: dateOfReview } },
        { returnDocument: 'after' }
    );
    const newReview = await get(id);
    if (JSON.stringify(newReview) === JSON.stringify(oldReview)) {
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
    dateOfReview
) {
    id = await validation.checkObjectId(id, 'review id');
    // how to check content and date?

    const reviewsCollection = await reviewCollection();
    const oldReview = await this.get(id);
    const updatedInfo = await reviewsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { rating: rating, dateOfReview: dateOfReview } },
        { returnDocument: 'after' }
    );
    const newReview = await get(id);
    if (JSON.stringify(oldReview) === JSON.stringify(newReview)) {
        throw `there's no real update, everything is the same`;
    }
    if (updatedInfo.lastErrorObject.n === 0) {
        throw 'could not update review successfully';
    }
    let review = await this.get(id);
    let gymId = await review.gymId; // get the gym of the review
    let updatedgymReviews = await this.getGymReviews(gymId) // get the updated review list
    let updatedGym = await gymDataFunctions.getByGymId(gymId) // get the gym object
    updatedGym.reviews = updatedgymReviews; // update gym review list

    let ratings = []
    for (review of updatedgymReviews) {
        ratings.push(review.rating)
    }
    let total = ratings.reduce((acc, c) => acc + c, 0)
    let grade = ((Math.floor((total / ratings.length) * 10)) / 10)
    updatedGym.rating = grade;

    await gymDataFunctions.update(gymId, updatedGym)

    // finally 
    return await this.get(id);
}

async function updateReviewComment(id, updatedReview) {
    await validation.checkArgumentsExist(id, updatedReview);
    id = await validation.checkObjectId(id, 'review id');

    const reviewsCollection = await reviewCollection();
    const updatedInfo = await reviewsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updatedReview },
        { returnDocument: 'after' }
    );
    if (updatedInfo.lastErrorObject.n === 0) {
        throw 'could not update review successfully';
    }
    return await get(id);

}

export const reviewDataFunctions = { get, getAll, getGymReviews, getUserReviews, create, removeReview, updateReviewContent, updateReviewComment, updateReviewRating }

