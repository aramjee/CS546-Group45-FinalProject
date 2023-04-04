// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link 

// This data file should export all functions using the ES6 standard as shown in the lecture code
import { reviewCollection } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import { validation } from '../helpers.js';
import { userDataFunctions } from './user.js'
import { reviewDataFunctions } from './review.js'

// return one comment object
async function get(commentId) {
    commentId = validation.checkId(commentId, 'commentId')
    const reviewsCollection = await reviewCollection();
    const allReview = await reviewsCollection.find().toArray();
    for (const review of allReview) {
        for (const comment of review.comments) {
            if (comment._id.toString() === commentId) {
                comment._id = comment._id.toString()
                return comment;
            }
        }
    }
    throw `the comment doesn't exist`
}
// return a list of comment object under a review
async function getAllByReview(reviewId) {
    reviewId = validation.checkId(reviewId, 'reviewId')
    const reviewsCollection = await reviewCollection();
    const review = await reviewsCollection.find({ _id: new ObjectId(reviewId) }).toArray();
    if (review.length === 0) {
        throw `invalid reviewId`
    }
    // If there are no comment for the review, this function will return an empty array
    let comments = [];
    for (const review of review) {
        for (const comment of review.comments) {
            comment._id = comment._id.toString()
            comments.push(comment);
        }
    }
    return comments;
}

// return a list of comment object posted by the user
async function getAllByUser(userId) {
    userId = validation.checkId(userId, 'userId');
    if (!userDataFunctions.get(id)) {
        throw `no user have such id`
    }
    const reviewsCollection = await reviewCollection();
    const reviews = await reviewsCollection.find().toArray();
    if (reviews.length === 0) {
        throw `invalid review`
    }
    let comments = [];
    for (const review of reviews) {
        for (const comment of review.comments) {
            if (comment.userId === userId) {
                comment._id = comment._id.toString();
                comments.push(comment);
            }
        }
    }
    return comments;
}

async function create(
    userId,
    dateOfComment,
    content,
    reviewId
) {
    [userId, dateOfComment, content, reviewId] = validation.checkCommentInputCreatePut(userId, dateOfComment, content, reviewId)
    const newComment = { _id: new ObjectId(), userId: userId, dateOfComment: dateOfComment, content: content, reviewId: reviewId };

    const reviewsCollection = await reviewCollection();
    const oldReviews = await reviewsCollection.find({ _id: new ObjectId(reviewId) }).toArray();
    let oldComments = [];
    for (const review of oldReviews) {
        for (const comment of review.comments) {
            oldComments.push(comment);
        }
    }
    const updatedReview = {
        comments: oldComments,
    }
    updatedReview.comments.push(newComment)

    const updatedInfo = await reviewsCollection.findOneAndUpdate(
        { _id: new ObjectId(reviewId) },
        { $set: updatedReview },
        { returnDocument: 'after' }
    );
    if (updatedInfo.lastErrorObject.n === 0) {
        throw 'could not update review successfully';
    }
    const newId = newComment._id.toString()

    // add the comment to the user
    let user = await userDataFunctions.get(userId)
    let updatedComment = await this.getAllByUser(userId)
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
        user.reviews,
        updatedComment)

    // finally

    return await get(newId);
}




async function remove(commentId) {
    commentId = validation.checkId(commentId, 'commentId')
    let comment = this.get(commentId)

    const reviewsCollection = await reviewCollection();
    let reviews = await reviewsCollection.find().toArray();
    for (const review of reviews) {
        for (const comment of review.comments) {
            if (comment._id.toString() === commentId) {
                removeReview = review;
            }
        }
    }
    if (removeReview === undefined) {
        throw `the comment doesn't exist`;
    }
    const updatedInfo = await reviewsCollection.findOneAndUpdate(
        { _id: removeReview._id },
        {
            $set: { overallRating: grade },
            $pull: { "comments": { _id: new ObjectId(commentId) } }
        },
        { returnDocument: 'after' })
    if (updatedInfo.lastErrorObject.n === 0) {
        throw 'could not update review successfully';
    }

    // user collection remove a review
    let user = await userDataFunctions.get(comment.userId)
    let updatedComments = await reviewDataFunctions.getUserReviews(comment.userId)
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
        user.reviews,
        updatedComments)

    return await reviewDataFunctions.get(removeReview._id.toString())

}
async function update(
    id,
    content,
    dataOfReview
) {
    id = validation.checkId(id, 'id');

    // todo: how to check content?
    // pull the old review first, and then create a new review
    let Updatedcomment = this.get(id);
    Updatedcomment.content = content;
    Updatedcomment.dataOfReview = dataOfReview;
    let allComments = this.getAllByReview(updatedComment.reviewId);
    for (comment of allComments) {
        if (comment._id === id) {
            comment = Updatedcomment;
            break
        }
    }
    const updatedInfo = await bandsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: allComments },
        { returnDocument: 'after' }
    );
    if (updatedInfo.lastErrorObject.n === 0) {
        throw 'could not update band successfully';
    }



}
export const commentDataFunctions = { get, getAllByReview, getAllByUser, create, remove, update } 
