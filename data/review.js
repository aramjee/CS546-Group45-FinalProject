// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link
// This data file should export all functions using the ES6 standard as shown in the lecture code

import { reviewCollection } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import * as validation from '../public/js/validation.js';
import { userDataFunctions } from './user.js'
import { gymDataFunctions } from './gym.js'
import { commentDataFunctions } from './comment.js';

// get review by review's id, return the review object
async function get(id) {
    validation.checkArgumentsExist(id);
    id = validation.checkObjectId(id, 'review id')
    const reviewsCollection = await reviewCollection();
    const review = await reviewsCollection.findOne({ _id: new ObjectId(id) });
    if (review === null)
        throw [400, `ERROR: ${id} No review with that id`]
    // convert all objectId to string
    review._id = review._id.toString();
    let userNameR = await userDataFunctions.getUserName(review.userId)
    review.userName = userNameR
    review.user = await userDataFunctions.getByUserId(review.userId);
    for (const comment of review.comments) {
        comment._id = comment._id.toString()
        let userNameC = await userDataFunctions.getUserName(comment.userId)
        comment.userName = userNameC;
        comment.user = await userDataFunctions.getByUserId(comment.userId);
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
    validation.checkArgumentsExist(gymId);
    gymId = validation.checkObjectId(gymId, 'gym id')
    const reviewsCollection = await reviewCollection();
    if (!await gymDataFunctions.getByGymId(gymId)) {
        throw [400, `no gym have such id`]
    }
    const reviewList = await reviewsCollection.find({ gymId: gymId }).toArray();
    // If there are no review for the user, this function will return an empty array
    let gymReview = [];
    for (const review of reviewList) {
        gymReview.push(review._id.toString());
    }
    return gymReview;
}

async function getGymReviewsListObjects(gymId) {
    validation.checkArgumentsExist(gymId);
    gymId = validation.checkObjectId(gymId, 'gym id')
    if (!await gymDataFunctions.getByGymId(gymId)) {
        throw [400, `no gym have such id`]
    }
    let gym = await gymDataFunctions.getByGymId(gymId);
    let reviewList = []
    if (gym.reviews) {
        for (const reviewId of gym.reviews) {
            const review = await this.get(reviewId);
            let userNameR = await userDataFunctions.getUserName(review.userId)
            review.userName = userNameR;
            let commentList = [];
            // Retrieve comments
            for (const comm of review.comments) {
                const comment = await commentDataFunctions.get(comm._id);
                let userNameC = await userDataFunctions.getUserName(comment.userId)
                comment.userName = userNameC;
                commentList.push(comment);
            }
            review.commentsList = commentList
            reviewList.push(review);
        }
    }
    return reviewList;
}
async function getUserReviewsListObjects(userId) {
    validation.checkArgumentsExist(userId);
    userId = validation.checkObjectId(userId, 'user id')
    if (!await userDataFunctions.getByUserId(userId)) {
        throw [400, `no user have such id`]
    }
    let user = await userDataFunctions.getByUserId(userId);
    let reviewList = []
    if (user.reviews) {
        for (const reviewId of user.reviews) {
            const review = await this.get(reviewId);
            let userNameR = await userDataFunctions.getUserName(review.userId)
            review.userName = userNameR;
            let commentList = [];
            // Retrieve comments
            for (const comm of review.comments) {
                const comment = await commentDataFunctions.get(comm._id);
                let userNameC = await userDataFunctions.getUserName(comment.userId)
                comment.userName = userNameC;
                commentList.push(comment);
            }
            review.commentsList = commentList
            reviewList.push(review);
        }
    }
    return reviewList;
}


// get a user's all previous review, return a list of reviewIds (string)
async function getUserReviews(userId) {
    validation.checkArgumentsExist(userId);
    userId = validation.checkObjectId(userId, 'userId')
    const reviewsCollection = await reviewCollection();
    // check is user id exist in database, TBD.
    if (!userDataFunctions.getByUserId(userId)) {
        throw [400, `no user have such id`]
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
    gymId = validation.checkObjectId(gymId);
    userId = validation.checkObjectId(userId);
    dateOfReview = validation.checkValidDate(dateOfReview);

    rating = validation.checkValidRating(rating);

    if (!userDataFunctions.getByUserId(userId)) {
        throw [400, `no user have such id`];
    }
    if (!gymDataFunctions.getByGymId(gymId)) {
        throw [400, `no gym have such id`];
    }

    //let gym = await gymDataFunctions.getByGymId(gymId);
    // this is a bug, will fix later!
    // for (let rId of gym.reviews) {
    //     let r = await this.get(rId);
    //     if (r.userId === userId) {
    //         throw [400, `User have posted review for this gym!`]
    //     }
    // }
    // const userReviews = await this.getUserReviewsListObjects(userId);
    // for (let review of userReviews) {
    //     if (review.userId === userId) {
    //         throw [400, "This user already reviewed this gym"];
    //     }
    // }
    const reviewsCollection = await reviewCollection();
    const alreadyReviewed = await reviewsCollection.findOne({
        $and: [{
            gymId: gymId
        }, {
            userId: userId
        }]
    });
    if (alreadyReviewed) throw [400, "This user already reviewed this gym"];
    let user = await userDataFunctions.getByUserId(userId)
    let userName = user.userName;
    let newReview = {
        gymId: gymId,
        userId: userId,
        userName: userName,
        dateOfReview: dateOfReview,
        content: content,
        comments: [],
        rating: rating
    }
    //const reviewsCollection = await reviewCollection();
    const insertInfo = await reviewsCollection.insertOne(newReview);
    if (!insertInfo || !insertInfo.insertedId) {
        throw [400, 'Could not add review'];
    }
    const newId = insertInfo.insertedId.toString();

    // user collection add a review
    let updatedUser = await userDataFunctions.getByUserId(userId)

    let updatedReview = await this.getUserReviews(userId)
    updatedUser.reviews = updatedReview;
    await userDataFunctions.update(userId, updatedUser)

    // gym collection add a review
    let UpdatedgymReviewsIds = await this.getGymReviews(gymId)
    let UpdatedgymReviews = []
    for (let reviewIds of UpdatedgymReviewsIds) {
        UpdatedgymReviews.push(await this.get(reviewIds))
    }
    let updatedGym = await gymDataFunctions.getByGymId(gymId)
    let ratings = []
    for (let review of UpdatedgymReviews) {
        ratings.push(review.rating)
    }

    ratings.push(rating)
    let total = ratings.reduce((acc, c) => acc + c, 0)
    let grade = ((Math.floor((total / ratings.length) * 10)) / 10)
    updatedGym.reviews = UpdatedgymReviewsIds;
    updatedGym.rating = grade;


    await gymDataFunctions.update(gymId, updatedGym)
    // finally
    const review = await this.get(newId);

    return review;
}

// remove a review
async function removeReview(id) {
    validation.checkArgumentsExist(id);
    id = validation.checkObjectId(id, 'review id');
    if (!await this.get(id)) {
        throw [400, `no review have this id`];
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
        throw [400, `Could not delete review with id of ${id}`];
    }

    // user collection remove a review

    let newReviewsUser = await getUserReviews(userId);
    let updatedUser = await userDataFunctions.getByUserId(userId);
    updatedUser.reviews = newReviewsUser;
    await userDataFunctions.update(userId, updatedUser)

    // gym collection remove a review
    let updatedGym = await gymDataFunctions.getByGymId(gymId) // the gym object
    let newReviewGymIds = await this.getGymReviews(gymId); // updated reviewList
    updatedGym.reviews = newReviewGymIds; // update review list
    let allRatings = []
    for (let reviewIds of newReviewGymIds) {
        let review = await this.get(reviewIds)
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
    validation.checkArgumentsExist(id, content, dateOfReview);
    dateOfReview = validation.checkValidDate(dateOfReview);
    id = validation.checkObjectId(id, 'review id');
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
        throw [400, `there's no real update, everything is the same`];
    }
    if (updatedInfo.lastErrorObject.n === 0) {
        throw [400, 'could not update review successfully'];
    }
    return await this.get(id);
}

// todo: update on rating --> gym rating?
async function updateReviewRating(
    id,
    rating,
    dateOfReview
) {
    id = validation.checkObjectId(id, 'review id');
    rating = validation.checkValidRating(rating);

    const reviewsCollection = await reviewCollection();
    const oldReview = await this.get(id);
    const updatedInfo = await reviewsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { rating: rating, dateOfReview: dateOfReview } },
        { returnDocument: 'after' }
    );
    const newReview = await get(id);
    if (JSON.stringify(oldReview) === JSON.stringify(newReview)) {
        throw [400, `there's no real update, everything is the same`];
    }
    if (updatedInfo.lastErrorObject.n === 0) {
        throw [400, 'could not update review successfully'];
    }
    let review = await this.get(id);
    let gymId = await review.gymId; // get the gym of the review
    let updatedgymReviewsIds = await this.getGymReviews(gymId) // get the updated review list
    let updatedGym = await gymDataFunctions.getByGymId(gymId) // get the gym object
    updatedGym.reviews = updatedgymReviewsIds; // update gym review list

    let ratings = []
    for (let reviewIds of updatedgymReviewsIds) {
        let review = await this.get(reviewIds)
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
    validation.checkArgumentsExist(id, updatedReview);
    id = validation.checkObjectId(id, 'review id');

    const reviewsCollection = await reviewCollection();
    const updatedInfo = await reviewsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updatedReview },
        { returnDocument: 'after' }
    );
    if (updatedInfo.lastErrorObject.n === 0) {
        throw [400, 'could not update review successfully'];
    }
    return await get(id);

}

export const reviewDataFunctions = { get, getAll, getGymReviews, getGymReviewsListObjects, getUserReviewsListObjects, getUserReviews, create, removeReview, updateReviewContent, updateReviewComment, updateReviewRating }
