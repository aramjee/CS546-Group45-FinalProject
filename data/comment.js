// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link 

// This data file should export all functions using the ES6 standard as shown in the lecture code
import { ObjectId } from 'mongodb';
import * as validation from '../public/validation.js';
import { userDataFunctions } from './user.js'
import { reviewDataFunctions } from './review.js'

// return one comment object
async function get(commentId) {
    await validation.checkArgumentsExist(commentId);
    commentId = await validation.checkObjectId(commentId, 'commentId')
    const allReviewIds = await reviewDataFunctions.getAll();
    const allReview = []
    for (let id of allReviewIds) {
        allReview.push(await reviewDataFunctions.get(id));
    }
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
// return a list of comment ids under a review
async function getAllByReview(reviewId) {
    await validation.checkArgumentsExist(reviewId);

    reviewId = await validation.checkObjectId(reviewId, 'reviewId')
    const review = await reviewDataFunctions.get(reviewId);
    if (review.length === 0) {
        throw `invalid reviewId`;
    }
    // If there are no comment for the review, this function will return an empty array
    let comments = [];
    for (const review of review) {
        for (const comment of review.comments) {
            comments.push(comment._id.toString());
        }
    }
    return comments;
}

// return a list of comment ids posted by the user
async function getAllByUser(userId) {
    await validation.checkArgumentsExist(userId);
    userId = await validation.checkObjectId(userId, 'userId');
    if (!userDataFunctions.getByUserId(userId)) {
        throw `no user have such id`
    }
    const allReviewsIds = await reviewDataFunctions.getAll();
    const allReviews = []
    for (let id of allReviewsIds) {
        allReviews.push(await reviewDataFunctions.get(id));
    }
    let comments = [];
    for (const review of allReviews) {
        console.log(review.comments)
        for (let i = 0; i < review.comments.length; i++) {
            if (review.comments[i].userId === userId) {
                comments.push(review.comments[i]._id.toString());
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
    await validation.checkArgumentsExist(userId, dateOfComment, content, reviewId);
    dateOfComment = validation.checkValidDate(dateOfComment);
    content = validation.checkNonEmptyStrings(content);
    userId = await validation.checkObjectId(userId);
    reviewId = await validation.checkObjectId(reviewId);

    const newComment = { _id: new ObjectId(), userId: userId, dateOfComment: dateOfComment, content: content, reviewId: reviewId };
    const newCommentId = newComment._id.toString()

    // add the comment to the review, note that comment is a subcollection of the review
    let updatedReview = await reviewDataFunctions.get(reviewId);
    updatedReview.comments.push(newComment);
    await reviewDataFunctions.updateReviewComment(reviewId, updatedReview);
    // add the comment to the user
    let user = await userDataFunctions.getByUserId(userId)
    let userCommentList = await this.getAllByUser(userId);
    userCommentList.push(newCommentId);
    user.comments = userCommentList;
    await userDataFunctions.update(userId, user)
    console.log("almost")
    // finally
    return await get(newCommentId);
}




async function remove(commentId) {
    validation.checkArgumentsExist(commentId);
    commentId = await validation.checkObjectId(commentId, 'commentId')
    const userId = await this.get(commentId).userId;
    const reviewId = await this.get(commentId).reviewId;
    let review = reviewDataFunctions.get(reviewId);
    let updatedCommentsReview = []
    for (let comment of review.comments) {
        if (comment._id.toString() !== commentId) {
            updatedReviews.push(comment)
        }
    }
    review.comments = updatedCommentsReview;
    await reviewDataFunctions.updateReviewComment(reviewId, updatedReview);

    // user collection remove a review
    // safe to use the getUserReviews bc: it goes in the review collection, and the comment is removed there
    let user = await userDataFunctions.getByUserId(userId)
    let updatedComments = await reviewDataFunctions.getUserReviews(userId)
    user.comments = updatedComments;
    await userDataFunctions.update(userId, user)
    return await reviewDataFunctions.get(reviewId)

}

async function update(
    id,
    content,
    dateOfComment
) {
    await validation.checkArgumentsExist(id, content, dateOfComment);
    dateOfComment = validation.checkValidDate(dateOfComment);
    content = validation.checkNonEmptyStrings(content);
    id = await validation.checkObjectId(id, 'id');

    // todo: how to check content?
    // pull the old review first, and then create a new review (only update the review collection since in the user collection it's a list of ids not list of object)
    let updatedComment = this.get(id);
    updatedComment.content = content;
    updatedComment.dateOfComment = dateOfComment;
    let allCommentsIds = this.getAllByReview(updatedComment.reviewId);
    let allComments = [];
    for (let id of allCommentsIds) {
        allComments.push(id);
    }

    for (comment of allComments) {
        if (comment._id === id) {
            comment = updatedComment;
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
