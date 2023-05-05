// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link
import { Router } from 'express';
import { gymData, reviewData, commentData, userData } from '../data/index.js';
import * as validation from "../public/js/validation.js";
import helpers from '../public/js/helpers.js';
import xss from 'xss';
const router = Router();


//TODO: date must be after birthday

router.route('/new/:gymId').get(async (req, res) => {
  try {
    if (!helpers.checkIfLoggedIn(req)) {
      res.status(401).redirect("/user/login");
    } else {
      let gym = await gymData.getByGymId(req.params.gymId)
      let userLoggedIn = helpers.checkIfLoggedIn(req);
      const currentUser = await userData.getByUserId(req.session.userId);
      return res.render('newReview', { userLoggedIn: userLoggedIn, title: 'Review Gym', gym: gym, currentUser: currentUser });
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
    if (userLoggedIn) {
      currentUser = await userData.getByUserId(req.session.userId);
    } else {
      currentUser = null;
    }
    return res.status(status).render("error", { title: title, hasErrors: hasErrors, userLoggedIn: userLoggedIn, errors: errors, currentUser: currentUser });
  }
});

router.route('/new/:gymId').post(async (req, res) => {
  try {
    console.log("you should not be here new review!")
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      return res.status(401).redirect("/user/login");
    }
    let gymId = req.params.gymId;
    let newReview = req.body;
    // input check and then create this post
    const userId = req.session.userId;
    const currentUser = await userData.getByUserId(req.session.userId);
    const event = new Date();
    let s = event.toISOString();
    const date = s.slice(0, 10);
    if (!newReview.content) {
      throw [400, "You must supply review content"]
    }
    if (!newReview.rating) {
      throw [400, "You must supply rating"]
    }
    validation.checkNonEmptyStrings(newReview.content, newReview.rating);
    newReview.content = validation.checkContent(newReview.content);
    newReview.rating = parseFloat(newReview.rating)
    newReview.rating = validation.checkValidRating(newReview.rating);
    await reviewData.create(xss(gymId), xss(userId), xss(date), xss(newReview.content), parseFloat(xss(newReview.rating)));
    // make reviewList ids => review objects, get the gym for rendering the singleGymPage (since new review successfully created)
    let gym = await gymData.getByGymId(gymId);
    let reviewList = await reviewData.getGymReviewsListObjects(gymId)
    gym.reviews = reviewList;
    let path = '/gym/' + gymId
    return res.redirect(path);
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    let currentUser = undefined;
    if (userLoggedIn) {
      currentUser = await userData.getByUserId(req.session.userId);
    } else {
      currentUser = null;
    }
    try {
      let gym = await gymData.getByGymId(req.params.gymId)
      return res.status(status).render("newReview", { userLoggedIn: userLoggedIn, title: 'Review Gym', gym: gym, hasErrors: hasErrors, errors: errors, currentUser: currentUser })
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
// a logged-in user to update a old post under a specific gym
router.route('/updateContent/:gymId/:reviewId').get(async (req, res) => {
  if (!helpers.checkIfLoggedIn(req)) {
    return res.status(401).redirect("/user/login");
  }
  try {
    console.log("you're inside the get for updateContent")
    let reviewId = req.params.reviewId;
    let review = await reviewData.get(reviewId);
    let gym = await gymData.getByGymId(req.params.gymId)
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (req.session.userId !== review.userId) {
      throw [400, "This review does not belong to you!"]
    }
    const currentUser = await userData.getByUserId(req.session.userId);
    return res.render('updateReviewContent', { userLoggedIn: userLoggedIn, title: 'Update Review', gym: gym, review: review, currentUser: currentUser, hasErrors: false, errors: [] });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    let title = 'ERROR'
    let currentUser = undefined;
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (userLoggedIn) {
      currentUser = await userData.getByUserId(req.session.userId);
    } else {
      currentUser = null;
    }
    return res.status(status).render("error", { title: title, hasErrors: hasErrors, userLoggedIn: userLoggedIn, errors: errors, currentUser: currentUser });
  }
});
router.route('/updateContent/:gymId/:reviewId').post(async (req, res) => {
  try {
    console.log("you should not be here updateContent!")
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    const currentUser = await userData.getByUserId(req.session.userId);
    let reviewId = req.params.reviewId;
    // input check
    let updatedReview = req.body;
    let content = updatedReview.content;
    content = validation.checkContent(content);
    const event = new Date();
    let s = event.toISOString();
    const date = s.slice(0, 10);
    if (!content) {
      throw [400, "You must supply review content"]
    }
    validation.checkNonEmptyStrings(reviewId, content);
    content = content.trim();
    reviewId = validation.checkObjectId(reviewId);
    let review = await reviewData.get(reviewId);
    if (req.session.userId !== review.userId) {
      throw [400, "This review does not belong to you!"]
    }
    // update review content
    await reviewData.updateReviewContent(xss(reviewId), xss(content), xss(date));
    // make reviewList ids => review objects, get the gym for rendering the singleGymPage (since new review successfully created)
    let gym = await gymData.getByGymId(req.params.gymId);
    let reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    gym.reviews = reviewList;
    let path = '/gym/' + review.gymId
    return res.redirect(path);
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    // if not known single gym, redirect to error page (there exist an input error)

    let currentUser = undefined;
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (userLoggedIn) {
      currentUser = await userData.getByUserId(req.session.userId);
    } else {
      currentUser = null;
    }
    try {
      let review = await reviewData.get(req.params.reviewId);
      let gym = await reviewData.getGymReviewsListObjects(req.params.gymId);
      return res.status(status).render("updateReviewContent", { userLoggedIn: userLoggedIn, title: 'Update Review', gym: gym, review: review, currentUser: currentUser, hasErrors: hasErrors, errors: errors });
    } catch (e) {
      let title = 'ERROR'
      let status = e[0] ? e[0] : 500;
      let message = e[1] ? e[1] : 'Internal Server Error';
      let errors = []
      let hasErrors = true
      errors.push(message);
      return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors, currentUser: currentUser });
    }
    //return res.status(status).render("newReview", { userLoggedIn: userLoggedIn, title: 'Review Gym', gym: gym, hasErrors: hasErrors, errors: errors, currentUser: currentUser });
    //    return res.render('updateReviewContent', { userLoggedIn: userLoggedIn, title: 'Update Review', gym: gym, review: review, currentUser: currentUser, hasErrors: false, errors: [] });
  }
})


router.route('/updateRating/:gymId/:reviewId').get(async (req, res) => {
  try {
    if (!helpers.checkIfLoggedIn(req)) {
      return res.status(401).redirect("/user/login");
    }
    let reviewId = req.params.reviewId;
    let review = await reviewData.get(reviewId);
    let gym = await gymData.getByGymId(req.params.gymId)
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (req.session.userId !== review.userId) {
      throw [400, "This review does not belong to you!"]
    }
    const currentUser = await userData.getByUserId(req.session.userId);
    return res.render('updateReviewRating', { userLoggedIn: userLoggedIn, title: 'Update Rating', gym: gym, review: review, currentUser: currentUser });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    let title = 'ERROR'
    let currentUser = undefined;
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (userLoggedIn) {
      currentUser = await userData.getByUserId(req.session.userId);
    } else {
      currentUser = null;
    }
    return res.status(status).render("error", { title: title, hasErrors: hasErrors, userLoggedIn: userLoggedIn, errors: errors, currentUser: currentUser });
  }
});

router.route('/updateRating/:gymId/:reviewId').post(async (req, res) => {
  //const currentUserId = userLoggedIn ? req.session.userId : null;
  try {
    console.log("you should not be here update rating!")
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    const currentUser = await userData.getByUserId(req.session.userId);
    // input check
    let updatedReview = req.body;
    let rating = updatedReview.rating;
    const event = new Date();
    let s = event.toISOString();
    const date = s.slice(0, 10);
    let reviewId = req.params.reviewId;
    if (!rating) {
      throw [400, "You must supply review rating"]
    }
    let review = await reviewData.get(reviewId)
    if (req.session.userId !== review.userId) {
      throw [400, "This review does not belong to you!"]
    }
    validation.checkNonEmptyStrings(reviewId, date);
    reviewId = validation.checkObjectId(reviewId);
    rating = parseFloat(rating)
    rating = validation.checkValidRating(rating);
    // update review rating
    await reviewData.updateReviewRating(xss(reviewId), parseFloat(xss(rating)), xss(date));
    // make reviewList ids => review objects, get the gym for rendering the singleGymPage (since new review successfully created)
    let gym = await gymData.getByGymId(req.params.gymId);
    let reviewList = await reviewData.getGymReviewsListObjects(req.params.gymId)
    gym.reviews = reviewList;
    let path = '/gym/' + req.params.gymId
    return res.redirect(path);
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    // if not known single gym, redirect to error page (there exist an input error)
    let currentUser = undefined;
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (userLoggedIn) {
      currentUser = await userData.getByUserId(req.session.userId);
    } else {
      currentUser = null;
    }
    try {
      let review = await reviewData.get(req.params.reviewId);
      let gym = await reviewData.getGymReviewsListObjects(req.params.gymId);
      return res.status(status).render("updateReviewRating", { userLoggedIn: userLoggedIn, title: 'Update Review', gym: gym, review: review, currentUser: currentUser, hasErrors: hasErrors, errors: errors });
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



router.route('/delete/:gymId/:reviewId').get(async (req, res) => {
  try {
    if (!helpers.checkIfLoggedIn(req)) {
      res.status(401).redirect("/user/login");
    } else {
      let reviewId = req.params.reviewId;
      let review = await reviewData.get(reviewId);
      if (req.session.userId !== review.userId) {
        throw [400, "This review does not belong to you!"]
      }
      let gym = await gymData.getByGymId(req.params.gymId);
      let userLoggedIn = helpers.checkIfLoggedIn(req);
      const currentUser = await userData.getByUserId(req.session.userId);
      res.render('reviewConfirmDelete', { userLoggedIn: userLoggedIn, title: 'Delete Review', review: review, gym: gym, currentUser: currentUser });
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
    if (userLoggedIn) {
      currentUser = await userData.getByUserId(req.session.userId);
    } else {
      currentUser = null;
    }
    return res.status(status).render("error", { title: title, hasErrors: hasErrors, userLoggedIn: userLoggedIn, errors: errors, currentUser: currentUser });
  }
});
router.route('/delete/:gymId/:reviewId').post(async (req, res) => {
  //const currentUserId = userLoggedIn ? req.session.userId : null;
  try {
    console.log("you should not be here delete review!")
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    const currentUser = await userData.getByUserId(req.session.userId);
    let reviewId = req.params.reviewId;
    reviewId = validation.checkObjectId(reviewId);
    let review = await reviewData.get(reviewId);
    if (req.session.userId !== review.userId) {
      throw [400, "This review does not belong to you!"]
    }
    // remove the review
    await reviewData.removeReview(xss(reviewId));
    let gym = await gymData.getByGymId(req.params.gymId);
    let reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    gym.reviews = reviewList;
    let path = '/gym/' + req.params.gymId
    return res.redirect(path);
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    // if not known single gym, redirect to error page (there exist an input error)
    let currentUser = undefined;
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (userLoggedIn) {
      currentUser = await userData.getByUserId(req.session.userId);
    } else {
      currentUser = null;
    }
    try {
      let review = await reviewData.get(req.params.reviewId);
      let gym = await reviewData.getGymReviewsListObjects(req.params.gymId);
      return res.status(status).render("reviewConfirmDelete", { userLoggedIn: userLoggedIn, title: 'Update Review', gym: gym, review: review, currentUser: currentUser, hasErrors: hasErrors, errors: errors });
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
