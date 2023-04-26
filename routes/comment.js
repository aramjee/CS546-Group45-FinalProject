// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link
import { Router } from 'express';
import { gymData, commentData, userData, reviewData } from '../data/index.js';
import * as validation from "../public/js/validation.js";
import middleware from '../middleware.js';

const router = Router();

// a logged-in user to create a new comment under a specific gym and specific review
router.route('/new').post(async (req, res) => {
  //code here for POST
  try {
    let userLoggedIn = middleware.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/users/login");
    }

    let newComment = req.body;

    await validation.checkArgumentsExist(newComment.userId, newComment.dateOfComment, newComment.content, newComment.reviewId);
    newComment.userId, newComment.dateOfComment, newComment.content, newComment.reviewId = await validation.checkNonEmptyStrings(newComment.userId, newComment.dateOfComment, newComment.content, newComment.reviewId);
    newComment.userId = await validation.checkObjectId(newComment.userId);
    newComment.reviewId = await validation.checkObjectId(newComment.reviewId);
    dateOfReview = await validation.checkValidDate(newComment.dateOfReview);

    let review = await reviewData.get(newComment.reviewId);
    await commentData.create(newComment.userId, newComment.dateOfComment, newComment.content, newComment.reviewId);
    res.status(200).render('gym', { gym: review.gymId, userLoggedIn: userLoggedIn });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    res.status(status).json({ error: message });
  }

});

// a logged-in user to update a old post under a specific gym and specific review
router.route('/update/:id').put(async (req, res) => {
  try {
    let userLoggedIn = middleware.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/users/login");
    }
    let commentId = req.params.id;
    let updatedComment = req.body;
    await validation.checkArgumentsExist(commentId, updatedComment.content, updatedComment.dateOfComment);
    updatedComment.dateOfComment = await validation.checkValidDate(updatedComment.dateOfComment);
    updatedComment.content = await validation.checkNonEmptyStrings(updatedComment.content);
    updatedComment.commentId = await validation.checkObjectId(commentId, 'comment id');



    await commentData.update(commentId, updatedComment.content, updatedComment.dateOfComment);
    let comment = commentData.get(commentId);
    let review = await reviewData.get(comment.reviewId);
    res.status(200).render('gym', { gym: review.gymId, userLoggedIn: userLoggedIn });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    res.status(status).json({ error: message });
  }
})

router.route('/delete/:id').delete(async (req, res) => {
  try {
    let userLoggedIn = middleware.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/users/login");
    }
    let commentId = req.params.id;
    commentId = validation.checkObjectId(commentId);
    let comment = await commentData.get(commentId);
    let review = await reviewData.get(comment.reviewId);
    let gym = review.gymId;
    await commentData.removeReview(commentId);
    res.status(200).render('gym', { gym: gym, userLoggedIn: userLoggedIn });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    res.status(status).json({ error: message });
  }
})
export default router;
