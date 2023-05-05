// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link
import { Router } from 'express';
import { gymData, commentData, userData, reviewData } from '../data/index.js';
import * as validation from "../public/js/validation.js";
import helpers from '../public/js/helpers.js';
import xss from 'xss';

const router = Router();
router.route('/new/:reviewId').get(async (req, res) => {
  try {
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
      let currentUser = undefined;
      let userLoggedIn = helpers.checkIfLoggedIn(req);
      if (userLoggedIn) {
        currentUser = await userData.getByUserId(req.session.userId);
      } else {
        currentUser = null;
      }
      res.render('newComment', { UserLoggedIn: userLoggedIn, title: 'Comment on Review', gym: gym, review: review, hasErrors: false, errors: [], currentUser: currentUser });
    }
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    let title = 'ERROR'
    let currentUser = undefined;
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (userLoggedIn) { currentUser = await userData.getByUserId(req.session.userId); } else { currentUser = null; }
    return res.status(status).render("error", { title: title, hasErrors: hasErrors, userLoggedIn: userLoggedIn, errors: errors, currentUser: currentUser });
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
    const event = new Date();
    let s = event.toISOString();
    const date = s.slice(0, 10);
    let userId = req.session.userId;
    validation.checkArgumentsExist(newComment.content);
    let content = validation.checkString(newComment.content);
    content = validation.checkContent(content);
    userId = validation.checkObjectId(userId);
    // create the comment
    await commentData.create(xss(userId), xss(date), xss(content), xss(reviewId));
    // render the singleGym
    let gym = await gymData.getByGymId(review.gymId);
    let reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    gym.reviews = reviewList;
    const currentUser = await userData.getByUserId(req.session.userId);
    let path = '/gym/' + review.gymId
    return res.redirect(path);
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    let currentUser = undefined;
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (userLoggedIn) {
      currentUser = await userData.getByUserId(req.session.userId);
    } else {
      currentUser = null;
    }
    // if not known single gym, redirect to error page (there exist an input error)
    try {
      let review = await reviewData.get(req.params.reviewId);
      let gym = await gymData.getByGymId(review.gymId);
      return res.status(status).render("newComment", { userLoggedIn: userLoggedIn, title: 'Comment on Review', gym: gym, hasErrors: hasErrors, errors: errors, review: review, currentUser: currentUser });
    } catch (e) {
      let title = 'ERROR'
      let status = e[0] ? e[0] : 500;
      let message = e[1] ? e[1] : 'Internal Server Error';
      let errors = []
      let hasErrors = true
      errors.push(message);
      return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors, currentUser: currentUser });
    }
  }
});

// a logged-in user to update a old post under a specific gym and specific review
router.route('/update/:reviewId/:commentId').get(async (req, res) => {
  try {
    if (!helpers.checkIfLoggedIn(req)) {
      res.status(401).redirect("/user/login");
    } else {
      let commentId = req.params.commentId;
      let comment = await commentData.get(commentId);
      if (req.session.userId !== comment.userId) {
        let title = 'ERROR'
        const currentUser = await userData.getByUserId(req.session.userId);
        return res.status(400).render("error", { title: title, hasErrors: true, errors: ["This comment does not belong to you!"], currentUser: currentUser });
      }
      let review = await reviewData.get(req.params.reviewId)
      let gym = await gymData.getByGymId(review.gymId);
      let currentUser = undefined;
      let userLoggedIn = helpers.checkIfLoggedIn(req);
      if (userLoggedIn) {
        currentUser = await userData.getByUserId(req.session.userId);
      } else {
        currentUser = null;
      }
      return res.render('updateComment', { userLoggedIn: userLoggedIn, title: 'Update Comment', comment: comment, review: review, gym: gym, currentUser: currentUser });
    }
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    let title = 'ERROR'
    let currentUser = undefined;
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (userLoggedIn) { currentUser = await userData.getByUserId(req.session.userId); } else { currentUser = null; }
    return res.status(status).render("error", { title: title, hasErrors: hasErrors, userLoggedIn: userLoggedIn, errors: errors, currentUser: currentUser });
  }
});
router.route('/update/:reviewId/:commentId').post(async (req, res) => {
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
    updatedComment.content = validation.checkString(updatedComment.content);
    updatedComment.content = validation.checkContent(updatedComment.content);
    updatedComment.commentId = validation.checkObjectId(commentId, 'comment id');
    // update comment
    await commentData.update(xss(commentId), xss(updatedComment.content), xss(date));
    let comment = await commentData.get(commentId);
    if (req.session.userId !== comment.userId) {
      let title = 'ERROR'
      const currentUser = await userData.getByUserId(req.session.userId);
      return res.status(400).render("error", { title: title, hasErrors: true, currentUser: currentUser, errors: ["This comment does not belong to you!"] });
    }
    let review = await reviewData.get(req.params.reviewId);
    // return the correct gym
    let gym = await gymData.getByGymId(review.gymId);
    let reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    gym.reviews = reviewList;
    const currentUser = await userData.getByUserId(req.session.userId);
    let path = '/gym/' + review.gymId
    return res.redirect(path);
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    let currentUser = undefined;
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (userLoggedIn) {
      currentUser = await userData.getByUserId(req.session.userId);
    } else {
      currentUser = null;
    }
    // if not known single gym, redirect to error page (there exist an input error)
    try {
      let review = await reviewData.get(req.params.reviewId);
      let gym = await gymData.getByGymId(review.gymId);
      let commentId = req.params.commentId;
      let comment = await commentData.get(commentId);
      return res.status(status).render("updateComment", { userLoggedIn: userLoggedIn, title: 'Update Comment', gym: gym, hasErrors: hasErrors, errors: errors, review: review, comment: comment, currentUser: currentUser });
    } catch (e) {
      let title = 'ERROR'
      let status = e[0] ? e[0] : 500;
      let message = e[1] ? e[1] : 'Internal Server Error';
      let errors = []
      let hasErrors = true
      errors.push(message);
      return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors, currentUser: currentUser });
    }
  }
})

// here the :id is commentId
router.route('/delete/:reviewId/:commentId').get(async (req, res) => {
  try {
    if (!helpers.checkIfLoggedIn(req)) {
      return res.status(401).redirect("/user/login");
    } else {
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
        return res.status(400).render("error", { title: title, hasErrors: true, errors: ["This comment does not belong to you!"], currentUser: currentUser });
      }
      let review = await reviewData.get(req.params.reviewId);
      let gym = await gymData.getByGymId(review.gymId);
      let currentUser = undefined;
      let userLoggedIn = helpers.checkIfLoggedIn(req);
      if (userLoggedIn) {
        currentUser = await userData.getByUserId(req.session.userId);
      } else {
        currentUser = null;
      }
      return res.render('commentConfirmDelete', { userLoggedIn: userLoggedIn, title: 'Delete Comment', comment: comment, review: review, gym: gym, currentUser: currentUser });
    }
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    let title = 'ERROR'
    let currentUser = undefined;
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (userLoggedIn) { currentUser = await userData.getByUserId(req.session.userId); } else { currentUser = null; }
    return res.status(status).render("error", { title: title, hasErrors: hasErrors, userLoggedIn: userLoggedIn, errors: errors, currentUser: currentUser });
  }
});
router.route('/delete/:reviewId/:commentId').post(async (req, res) => {
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    //const userId = req.session.userId;
    let commentId = req.params.commentId;
    commentId = validation.checkObjectId(commentId);
    let comment = await commentData.get(commentId);
    if (req.session.userId !== comment.userId) {
      let title = 'ERROR'
      const currentUser = await userData.getByUserId(req.session.userId);
      return res.status(400).render("error", { title: title, hasErrors: true, errors: ["This comment does not belong to you"], currentUser: currentUser });
    }
    let review = await reviewData.get(req.params.reviewId);
    let gymId = review.gymId;
    await commentData.remove(xss(commentId));
    let gym = await gymData.getByGymId(gymId);
    let reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    gym.reviews = reviewList;
    const currentUser = await userData.getByUserId(req.session.userId);
    let path = '/gym/' + review.gymId
    return res.redirect(path);
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    let currentUser = undefined;
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (userLoggedIn) {
      currentUser = await userData.getByUserId(req.session.userId);
    } else {
      currentUser = null;
    }
    // if not known single gym, redirect to error page (there exist an input error)
    try {
      let review = await reviewData.get(req.params.reviewId);
      let gym = await gymData.getByGymId(review.gymId);
      let commentId = req.params.commentId;
      let comment = await commentData.get(commentId);
      return res.status(status).render("commentConfirmDelete", { userLoggedIn: userLoggedIn, title: 'Delete Comment', gym: gym, hasErrors: hasErrors, errors: errors, review: review, comment: comment, currentUser: currentUser });
    } catch (e) {
      let title = 'ERROR'
      let status = e[0] ? e[0] : 500;
      let message = e[1] ? e[1] : 'Internal Server Error';
      let errors = []
      let hasErrors = true
      errors.push(message);
      return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors, currentUser: currentUser });
    }
  }
})
export default router;
