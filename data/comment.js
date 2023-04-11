// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link 

// This data file should export all functions using the ES6 standard as shown in the lecture code
import { ObjectId } from 'mongodb';
import * as validation from '../public/js/validation.js';
import { userDataFunctions } from './user.js'
import { reviewDataFunctions } from './review.js'
import { reviewCollection } from '../config/mongoCollections.js';

// return one comment object
async function get(commentId) {
    await validation.checkArgumentsExist(commentId);
    commentId = await validation.checkObjectId(commentId, 'commentId')
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
    content = validation.checkNonEmptyStrings(content)[0];
    userId = await validation.checkObjectId(userId);
    reviewId = await validation.checkObjectId(reviewId);

    let newComment = {
        _id: new ObjectId(),
        userId: userId,
        dateOfComment: dateOfComment,
        content: content,
        reviewId: reviewId
    };
    const newCommentId = newComment._id.toString()

    // add the comment to the review, note that comment is a subcollection of the review
    const reviewsCollection = await reviewCollection();
    const updatedReview = await reviewsCollection.findOne({ _id: new ObjectId(reviewId) });
    updatedReview.comments.push(newComment);
    await reviewDataFunctions.updateReviewComment(reviewId, updatedReview);

    // add the comment to the user
    let user = await userDataFunctions.getByUserId(userId)

    let userCommentList = await getAllByUser(userId);
    userCommentList.push(newCommentId);
    user.comments = userCommentList;
    await userDataFunctions.update(userId, user)
    // finally
    return await get(newCommentId);
}




async function remove(commentId) {
    validation.checkArgumentsExist(commentId);
    commentId = await validation.checkObjectId(commentId, 'commentId');

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
    await userDataFunctions.update(userId, updateUser)
    return await reviewDataFunctions.get(reviewId)
}

async function update(
    id,
    content,
    dateOfComment
) {
    await validation.checkArgumentsExist(id, content, dateOfComment);
    dateOfComment = validation.checkValidDate(dateOfComment);
    content = validation.checkNonEmptyStrings(content)[0];
    id = await validation.checkObjectId(id, 'id');

    // todo: how to check content?
    // pull the old review first, and then create a new review (only update the review collection since in the user collection it's a list of ids not list of object)
    let updatedComment = await this.get(id);
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
