// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link 

// This data file should export all functions using the ES6 standard as shown in the lecture code
import { ObjectId } from 'mongodb';
import * as validation from '../public/js/validation.js';
import { userDataFunctions } from './user.js'
import { reviewDataFunctions } from './review.js'
import { gymDataFunctions } from './gym.js'
import { reviewCollection } from '../config/mongoCollections.js';

// return one comment object
async function get(commentId) {
    validation.checkArgumentsExist(commentId);
    commentId = validation.checkObjectId(commentId, 'commentId')
    const allReviewIds = await reviewDataFunctions.getAll();
    const allReview = []
    for (let id of allReviewIds) {
        let x = await reviewDataFunctions.get(id)
        allReview.push(x);
    }
    for (const review of allReview) {
        for (const comment of review.comments) {
            if (comment._id.toString() === commentId) {
                comment._id = comment._id.toString()
                comment.userName = await userDataFunctions.getUserName(comment.userId);
                return comment;
            }
        }
    }
    throw [400, `the comment doesn't exist`]
}
// return a list of comment ids under a review
async function getAllByReview(reviewId) {
    validation.checkArgumentsExist(reviewId);
    reviewId = validation.checkObjectId(reviewId, 'reviewId')
    const review = await reviewDataFunctions.get(reviewId);
    if (review.length === 0) {
        throw [400, `invalid reviewId`];
    }
    // console.log(reviewList)
    // If there are no comment for the review, this function will return an empty array
    let comments = [];

    for (const comment of review.comments) {
        comments.push(comment._id.toString());
    }

    return comments;
}

// return a list of comment ids posted by the user
async function getAllByUser(userId) {
    validation.checkArgumentsExist(userId);
    userId = validation.checkObjectId(userId, 'userId');
    if (!userDataFunctions.getByUserId(userId)) {
        throw [400, `no user have such id`]
    }
    const allReviewsIds = await reviewDataFunctions.getAll();
    const allReviews = []
    for (let id of allReviewsIds) {
        allReviews.push(await reviewDataFunctions.get(id));
    }

    let comments = [];
    for (const review of allReviews) {
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
    validation.checkArgumentsExist(userId, dateOfComment, content, reviewId);
    dateOfComment = validation.checkValidDate(dateOfComment);
    content = validation.checkNonEmptyStrings(content)[0];
    content = validation.checkContent(content);
    userId = validation.checkObjectId(userId);
    reviewId = validation.checkObjectId(reviewId);
    let userName = await userDataFunctions.getUserName(userId)
    let review = await reviewDataFunctions.get(reviewId)
    for (let c of review.comments) {
        if (userId === c.userId) {
            throw [400, `You have posted comment for this review! You can still post comments under other reviews for this gym`]
        }
    }
    if (review.userId === userId) {
        throw [400, "You cannot post a comment under your own review"]
    }
    let newComment = {
        _id: new ObjectId(),
        userId: userId,
        dateOfComment: dateOfComment,
        content: content,
        userName: userName,
        reviewId: reviewId
    };
    let newCommentId = newComment._id.toString()
    // add the comment to the review, note that comment is a subcollection of the review
    const updatedReview = await reviewDataFunctions.get(reviewId);
    updatedReview.comments.push(newComment);
    await reviewDataFunctions.updateReviewComment(reviewId, updatedReview);

    // add the comment to the user
    // let user = await userDataFunctions.getByUserId(userId)
    // console.log(user)
    // let userCommentList = await getAllByUser(userId);
    // userCommentList.push(newCommentId);
    // user.comments = userCommentList;
    // await userDataFunctions.update(userId, user)
    // console.log(await userDataFunctions.getByUserId(userId))
    // finally
    return await get(newCommentId);
}




async function remove(commentId) {
    validation.checkArgumentsExist(commentId);
    commentId = validation.checkObjectId(commentId, 'commentId');

    const comment = await this.get(commentId);
    const userId = comment.userId;
    const reviewId = comment.reviewId;
    const updatedComments = [];

    const reviewsCollection = await reviewCollection();
    const updatedReview = await reviewsCollection.findOne({ _id: new ObjectId(reviewId) });
    for (let commentR of updatedReview.comments) {
        if (commentR._id.toString() !== commentId) {
            updatedComments.push(commentR)
        }
    }
    updatedReview.comments = updatedComments
    await reviewDataFunctions.updateReviewComment(reviewId, updatedReview);
    // user collection remove a review
    // safe to use the getUserReviews bc: it goes in the review collection, and the comment is removed there
    let updateUser = await userDataFunctions.getByUserId(userId)
    let updatedCommentsU = await this.getAllByUser(userId)
    updateUser.comments = updatedCommentsU;
    //await userDataFunctions.update(userId, updateUser)
    return await reviewDataFunctions.get(reviewId)
}

async function update(
    id,
    content,
    dateOfComment
) {
    validation.checkArgumentsExist(id, content, dateOfComment);
    dateOfComment = validation.checkValidDate(dateOfComment);
    content = validation.checkNonEmptyStrings(content)[0];
    content = validation.checkContent(content);
    id = validation.checkObjectId(id, 'id');

    // todo: how to check content?
    // pull the old review first, and then create a new review (only update the review collection since in the user collection it's a list of ids not list of object)
    let updatedComment = await this.get(id);
    if (content === updatedComment.content) {
        throw [400, "no real update!"]
    }
    let reviewId = updatedComment.reviewId;
    updatedComment.content = content;
    updatedComment.dateOfComment = dateOfComment;

    let allCommentsIds = await this.getAllByReview(reviewId);
    let allComments = [];
    for (let cid of allCommentsIds) {
        if (cid === id) {
            continue
        }
        else {
            let c = await this.get(cid);
            allComments.push(c);
        }
    }
    allComments.push(updatedComment);

    const reviewsCollection = await reviewCollection();
    const updatedReview = await reviewsCollection.findOne({ _id: new ObjectId(reviewId) });
    updatedReview.comments = allComments;
    await reviewDataFunctions.updateReviewComment(reviewId, updatedReview);

}
export const commentDataFunctions = { get, getAllByReview, getAllByUser, create, remove, update } 
