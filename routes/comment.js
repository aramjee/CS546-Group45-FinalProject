// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link
import { Router } from 'express';
import { gymData, commentData, userData, reviewData } from '../data/index.js';
import * as validation from "../public/js/validation.js";
import helpers from '../public/js/helpers.js';

const router = Router();
router.route('/new/:reviewId').get(async (req, res) => {
  //console.log(req.params);
  if (!helpers.checkIfLoggedIn(req)) {
    res.status(401).redirect("/user/login");
  } else {
    let review = await reviewData.get(req.params.reviewId)
    let gym = await gymData.getByGymId(review.gymId);
    res.render('newComment', { title: 'Comment on Review', gym: gym, review: review });
  }
});
// a logged-in user to create a new comment under a specific gym and specific review
router.route('/new/:reviewId').post(async (req, res) => {
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    let newComment = req.body;
    let reviewId = req.params.reviewId;
    reviewId = await validation.checkObjectId(reviewId);
    let review = await reviewData.get(reviewId);
    // input check
    console.log("you're inside the comment router.route('/new/:reviewId').post")
    const event = new Date();
    let s = event.toISOString();
    const date = s.slice(0, 10);
    let userId = req.session.userId;
    validation.checkArgumentsExist(newComment.content);
    let content = validation.checkString(newComment.content);
    userId = await validation.checkObjectId(userId);
    // create the comment
    await commentData.create(userId, date, content, reviewId);
    // render the singleGym
    let gym = await gymData.getByGymId(review.gymId);
    let reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    gym.reviews = reviewList;

    res.status(200).render('singleGym', { gym: gym, userLoggedIn: userLoggedIn });
  } catch (e) {
    console.log(e)
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    // if not known single gym, redirect to error page (there exist an input error)
    let review = await reviewData.get(req.params.reviewId)
    let gym = await reviewData.getGymReviewsListObjects(review.gymId);
    if (!gym) {
      let title = 'ERROR'
      return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors });
    }
    return res.status(status).render("singleGym", { gym: gym, hasErrors: hasErrors, errors: errors });
  }
});

// a logged-in user to update a old post under a specific gym and specific review
router.route('/update/:reviewId/:commentId').get(async (req, res) => {
  //console.log(req.params);
  if (!helpers.checkIfLoggedIn(req)) {
    console.log("You're inside the GET comment '/update/:id'")
    res.status(401).redirect("/user/login");
  } else {
    let commentId = req.params.commentId;
    let comment = await commentData.get(commentId);
    let review = await reviewData.get(req.params.reviewId)
    let gym = await gymData.getByGymId(review.gymId);
    res.render('updateComment', { title: 'Update Comment', comment: comment, review: review, gym: gym });
  }
});
router.route('/update/:reviewId/:commentId').put(async (req, res) => {
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    let commentId = req.params.commentId;
    let updatedComment = req.body;
    const event = new Date();
    let s = event.toISOString();
    const date = s.slice(0, 10);
    validation.checkArgumentsExist(commentId, updatedComment.content);
    updatedComment.content = validation.checkNonEmptyStrings(updatedComment.content);
    updatedComment.commentId = await validation.checkObjectId(commentId, 'comment id');
    // update comment
    await commentData.update(commentId, updatedComment.content, date);
    let comment = await commentData.get(commentId);
    let review = await reviewData.get(comment.reviewId);
    // return the correct gym
    let gym = await gymData.getByGymId(review.gymId);
    let reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    gym.reviews = reviewList;
    res.status(200).render('singleGym', { gym: gym, userLoggedIn: userLoggedIn });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    // if not known single gym, redirect to error page (there exist an input error)
    let review = await reviewData.get(req.params.reviewId)
    let gym = await reviewData.getGymReviewsListObjects(review.gymId);
    if (!gym) {
      let title = 'ERROR'
      return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors });
    }
    return res.status(status).render("singleGym", { gym: gym, hasErrors: hasErrors, errors: errors });

  }
})

// here the :id is commentId
router.route('/delete/:reviewId/:commentId').get(async (req, res) => {
  //console.log(req.params);
  if (!helpers.checkIfLoggedIn(req)) {
    console.log("You're inside the GET comment '/delete/:id'")
    res.status(401).redirect("/user/login");
  } else {
    let commentId = req.params.commentId;
    let comment = await commentData.get(commentId);
    let review = await reviewData.get(comment.reviewId);
    let gym = await gymData.getByGymId(review.gymId);
    res.render('commentConfirmDelete', { title: 'Delete Comment', comment: comment, review: review, gym: gym });
  }
});
router.route('/delete/:reviewId/:commentId').delete(async (req, res) => {
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    //const userId = req.session.userId;
    let commentId = req.params.commentId;
    commentId = validation.checkObjectId(commentId);
    let comment = await commentData.get(commentId);
    let review = await reviewData.get(comment.reviewId);
    await commentData.removeReview(commentId);
    let gym = await gymData.getByGymId(review.gymId);
    let reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    gym.reviews = reviewList;
    res.status(200).render('singleGym', { gym: gym, userLoggedIn: userLoggedIn });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    // if not known single gym, redirect to error page (there exist an input error)
    let review = await reviewData.get(req.params.reviewId)
    let gym = await reviewData.getGymReviewsListObjects(review.gymId);
    if (!gym) {
      let title = 'ERROR'
      return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors });
    }
    return res.status(status).render("singleGym", { gym: gym, hasErrors: hasErrors, errors: errors });
  }
})
export default router;
