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
    if (req.session.userId === review.userId) {
      let title = 'ERROR'
      const currentUser = await userData.getByUserId(req.session.userId);

      return res.status(400).render("error", { title: title, hasErrors: true, errors: ["Please do not post under your own review!"], currentUser: currentUser });
    }
    let gym = await gymData.getByGymId(review.gymId);
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    const currentUser = await userData.getByUserId(req.session.userId);
    res.render('newComment', { UserLoggedIn: userLoggedIn, title: 'Comment on Review', gym: gym, review: review, hasErrors: false, errors: [], currentUser: currentUser });
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
    reviewId = validation.checkObjectId(reviewId);
    let review = await reviewData.get(reviewId);
    if (req.session.userId === review.userId) {
      let title = 'ERROR'
      const currentUser = await userData.getByUserId(req.session.userId);
      return res.status(400).render("error", { title: title, hasErrors: true, errors: ["Please do not post under your own review!"], currentUser: currentUser });
    }
    // input check
    console.log("you're inside the comment router.route('/new/:reviewId').post")
    const event = new Date();
    let s = event.toISOString();
    const date = s.slice(0, 10);
    let userId = req.session.userId;
    validation.checkArgumentsExist(newComment.content);
    let content = validation.checkString(newComment.content);
    userId = validation.checkObjectId(userId);
    // create the comment
    await commentData.create(userId, date, content, reviewId);
    // render the singleGym
    let gym = await gymData.getByGymId(review.gymId);
    let reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    gym.reviews = reviewList;
    const currentUser = await userData.getByUserId(req.session.userId);
    res.status(200).render('singleGym', { gym: gym, userLoggedIn: userLoggedIn, currentUser: currentUser });
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
      const currentUser = await userData.getByUserId(req.session.userId);
      return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors, currentUser: currentUser });
    }
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    const currentUser = await userData.getByUserId(req.session.userId);
    return res.status(status).render("newComment", { userLoggedIn: userLoggedIn, title: 'Comment on Review', gym: gym, hasErrors: hasErrors, errors: errors, review: review, currentUser: currentUser });
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
    if (req.session.userId !== comment.userId) {
      let title = 'ERROR'
      const currentUser = await userData.getByUserId(req.session.userId);
      return res.status(400).render("error", { title: title, hasErrors: true, errors: ["Please do not post under your own review!"], currentUser: currentUser });
    }
    let review = await reviewData.get(req.params.reviewId)
    let gym = await gymData.getByGymId(review.gymId);
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    const currentUser = await userData.getByUserId(req.session.userId);
    res.render('updateComment', { userLoggedIn: userLoggedIn, title: 'Update Comment', comment: comment, review: review, gym: gym, currentUser: currentUser });
  }
});
router.route('/update/:reviewId/:commentId').post(async (req, res) => {
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    console.log("You're inside the DELETE Comment POST!")
    let commentId = req.params.commentId;
    let updatedComment = req.body;
    const event = new Date();
    let s = event.toISOString();
    const date = s.slice(0, 10);
    validation.checkArgumentsExist(commentId, updatedComment.content);
    updatedComment.content = validation.checkString(updatedComment.content);
    updatedComment.commentId = validation.checkObjectId(commentId, 'comment id');
    // update comment
    await commentData.update(commentId, updatedComment.content, date);
    let comment = await commentData.get(commentId);
    if (req.session.userId !== comment.userId) {
      let title = 'ERROR'
      const currentUser = await userData.getByUserId(req.session.userId);
      return res.status(400).render("error", { title: title, hasErrors: true, currentUser: currentUser, errors: ["Please do not post under your own review!"] });
    }
    let review = await reviewData.get(comment.reviewId);
    // return the correct gym
    let gym = await gymData.getByGymId(review.gymId);
    let reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    gym.reviews = reviewList;
    const currentUser = await userData.getByUserId(req.session.userId);
    res.status(200).render('singleGym', { gym: gym, userLoggedIn: userLoggedIn, currentUser: currentUser });
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
      const currentUser = await userData.getByUserId(req.session.userId);
      return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors, currentUser: currentUser });
    }
    let commentId = req.params.commentId;
    let comment = await commentData.get(commentId);
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    const currentUser = await userData.getByUserId(req.session.userId);
    return res.status(status).render("updateComment", { userLoggedIn: userLoggedIn, title: 'Update Comment', gym: gym, hasErrors: hasErrors, errors: errors, review: review, comment: comment, currentUser: currentUser });

  }
})

// here the :id is commentId
router.route('/delete/:reviewId/:commentId').get(async (req, res) => {
  //console.log(req.params);
  if (!helpers.checkIfLoggedIn(req)) {
    return res.status(401).redirect("/user/login");
  } else {
    console.log("You're inside the GET comment '/delete/:id'")
    let commentId = req.params.commentId;
    try {
      let comment = await commentData.get(commentId);
    } catch (e) {
      let title = 'ERROR'
      let status = e[0] ? e[0] : 500;
      let message = e[1] ? e[1] : 'Internal Server Error';
      let errors = []
      let hasErrors = true
      errors.push(message)
      const currentUser = await userData.getByUserId(req.session.userId);
      return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors, currentUser: currentUser });
    }
    let comment = await commentData.get(commentId);
    if (req.session.userId !== comment.userId) {
      let title = 'ERROR'
      const currentUser = await userData.getByUserId(req.session.userId);
      return res.status(400).render("error", { title: title, hasErrors: true, errors: ["Please do not post under your own review!"], currentUser: currentUser });
    }
    let review = await reviewData.get(comment.reviewId);
    let gym = await gymData.getByGymId(review.gymId);
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    const currentUser = await userData.getByUserId(req.session.userId);
    return res.render('commentConfirmDelete', { userLoggedIn: userLoggedIn, title: 'Delete Comment', comment: comment, review: review, gym: gym, currentUser: currentUser });
  }
});
router.route('/delete/:reviewId/:commentId').post(async (req, res) => {
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    //const userId = req.session.userId;
    console.log("You're inside the DELETE Comment POST!")
    let commentId = req.params.commentId;
    commentId = validation.checkObjectId(commentId);
    let comment = await commentData.get(commentId);
    if (req.session.userId !== comment.userId) {
      let title = 'ERROR'
      const currentUser = await userData.getByUserId(req.session.userId);
      return res.status(400).render("error", { title: title, hasErrors: true, errors: ["Please do not post under your own review!"], currentUser: currentUser });
    }
    let review = await reviewData.get(comment.reviewId);
    let gymId = review.gymId;
    await commentData.remove(commentId);
    let gym = await gymData.getByGymId(gymId);
    let reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    gym.reviews = reviewList;
    const currentUser = await userData.getByUserId(req.session.userId);
    res.status(200).render('singleGym', { gym: gym, userLoggedIn: userLoggedIn, currentUser: currentUser });
  } catch (e) {
    console.log(e)
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    // if not known single gym, redirect to error page (there exist an input error)
    let review = await reviewData.get(req.params.reviewId)
    let gymReviewList = await reviewData.getGymReviewsListObjects(review.gymId);
    if (!gymReviewList) {
      let title = 'ERROR'
      const currentUser = await userData.getByUserId(req.session.userId);
      return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors, currentUser: currentUser });
    }
    let gym = await gymData.getByGymId(review.gymId);
    let reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    gym.reviews = reviewList;
    let commentId = req.params.commentId;
    try {
      await commentData.get(commentId);
    } catch (e) {
      let title = 'ERROR'
      const currentUser = await userData.getByUserId(req.session.userId);
      return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors, currentUser: currentUser });
    }
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    const currentUser = await userData.getByUserId(req.session.userId);
    let comment = await commentData.get(commentId);
    return res.status(status).render("commentConfirmDelete", { userLoggedIn: userLoggedIn, title: 'Delete Comment', gym: gym, hasErrors: hasErrors, errors: errors, review: review, comment: comment, currentUser: currentUser });
  }
})
export default router;
