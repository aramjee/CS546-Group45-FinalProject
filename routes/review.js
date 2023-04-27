// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link
import { Router } from 'express';
import { gymData, reviewData, commentData, userData } from '../data/index.js';
import * as validation from "../public/js/validation.js";
import helpers from '../helpers.js';

const router = Router();


//TODO: date must be after birthday
// TODO: duplicate userName
//TODO: a user post a review cannot add a comment under his/her own review!
// TODO: comment date cannot before reivew date


// a logged-in user to create a new post under a specific gym
// here the :id is gymId
router.route('/new/:id').post(async (req, res) => {
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    // get the gym, for rendering the singleGym page
    let gym = await gymData.getByGymId(req.params.id);
    let reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    gym.reviews = reviewList;
    let newReview = req.body;
    // input check and then create this post
    validation.checkArgumentsExist(newReview.gymId, newReview.userId, newReview.dateOfReview, newReview.content, newReview.rating);
    validation.checkNonEmptyStrings(newReview.gymId, newReview.userId, newReview.dateOfReview);
    newReview.gymId = await validation.checkObjectId(req.params.id);
    newReview.userId = await validation.checkObjectId(newReview.userId);
    newReview.dateOfReview = await validation.checkValidDate(newReview.dateOfReview);
    newReview.rating = await validation.checkValidRating(newReview.rating);
    await reviewData.create(newReview.gymId, newReview.userId, newReview.dateOfReview, newReview.content, newReview.rating);
    // make reviewList ids => review objects,redo get the gym for rendering the singleGymPage (since new review successfully created)
    gym = await gymData.getByGymId(review.gymId);
    reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    gym.reviews = reviewList;
    res.status(200).render('singleGym', { gym: gym, userLoggedIn: userLoggedIn });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    // if not known single gym, redirect to error page (there exist an input error)
    if (!gym) {
      let title = 'ERROR'
      return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors });
    }
    return res.status(status).render("singleGym", { gym: gym, hasErrors: hasErrors, errors: errors });
  }
});

// a logged-in user to update a old post under a specific gym
// here the :id is the reviewId
router.route('/updateContent/:id').put(async (req, res) => {
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    // get the gym, for rendering the singleGym page
    let reviewId = req.params.id;
    let review = await reviewData.get(reviewId);
    let gym = await gymData.getByGymId(review.gymId);
    let reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    gym.reviews = reviewList;
    // input check
    let updatedReview = req.body;
    let content = updatedReview.content;
    let date = updatedReview.dateOfReview;
    validation.checkArgumentsExist(reviewId, content, date);
    validation.checkNonEmptyStrings(reviewId, content, date);
    content = content.trim();
    reviewId = validation.checkObjectId(reviewId);
    date = await validation.checkValidDate(date);
    // update review content
    await reviewData.updateReviewContent(reviewId, content, date);
    // make reviewList ids => review objects,redo get the gym for rendering the singleGymPage (since new review successfully created)
    gym = await gymData.getByGymId(review.gymId);
    reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    gym.reviews = reviewList;
    res.status(200).render('singleGym', { gym: gym, userLoggedIn: userLoggedIn });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    // if not known single gym, redirect to error page (there exist an input error)
    if (!gym) {
      let title = 'ERROR'
      return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors });
    }
    return res.status(status).render("singleGym", { gym: gym, hasErrors: hasErrors, errors: errors });
  }
})

// here the :id is reviewId
router.route('/updateRating/:id').put(async (req, res) => {
  //const currentUserId = userLoggedIn ? req.session.userId : null;
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    // get the gym, for rendering the singleGym page
    let reviewId = req.params.id;
    let review = await reviewData.get(reviewId);
    let gym = await gymData.getByGymId(review.gymId);
    let reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    gym.reviews = reviewList;
    // input check
    let updatedReview = req.body;
    let rating = updatedReview.rating;
    let date = updatedReview.dateOfReview;
    validation.checkArgumentsExist(reviewId, rating, date);
    validation.checkNonEmptyStrings(reviewId, date);
    validation.checkValidRating(rating);
    reviewId = validation.checkObjectId(reviewId);
    date = await validation.checkValidDate(date);
    // update review rating
    await reviewData.updateReviewRating(reviewId, rating, date);
    // make reviewList ids => review objects,redo get the gym for rendering the singleGymPage (since new review successfully created)
    gym = await gymData.getByGymId(review.gymId);
    reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    gym.reviews = reviewList;
    res.status(200).render('singleGym', { gym: gym, userLoggedIn: userLoggedIn });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    // if not known single gym, redirect to error page (there exist an input error)
    if (!gym) {
      let title = 'ERROR'
      return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors });
    }
    return res.status(status).render("singleGym", { gym: gym, hasErrors: hasErrors, errors: errors });
  }
})

// here the :id is reviewId
router.route('/delete/:id').delete(async (req, res) => {
  const currentUserId = userLoggedIn ? req.session.userId : null;
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    let reviewId = req.params.id;
    reviewId = validation.checkObjectId(reviewId);
    let review = await reviewData.get(reviewId);
    await reviewData.removeReview(reviewId);
    gym = await gymData.getByGymId(review.gymId);
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
    if (!gym) {
      let title = 'ERROR'
      return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors });
    }
    return res.status(status).render("singleGym", { hasErrors: hasErrors, errors: errors });
  }
})
export default router;
