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
//TODO: errors display


// a logged-in user to create a new post under a specific gym
router.route('/new').post(async (req, res) => {
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/users/login");
    }
    const currentUserId = userLoggedIn ? req.session.userId : null;
    let newReview = req.body;
    // input check
    validation.checkArgumentsExist(newReview.gymId, newReview.userId, newReview.dateOfReview, newReview.content, newReview.rating);
    validation.checkNonEmptyStrings(newReview.gymId, newReview.userId, newReview.dateOfReview);
    newReview.gymId = await validation.checkObjectId(newReview.gymId);
    // get the gym, for rendering the singleGym page
    let gym = await gymData.getByGymId(newReview.gymId);
    newReview.userId = await validation.checkObjectId(newReview.userId);
    newReview.dateOfReview = await validation.checkValidDate(newReview.dateOfReview);
    newReview.rating = await validation.checkValidRating(newReview.rating);
    await reviewData.create(newReview.gymId, newReview.userId, newReview.dateOfReview, newReview.content, newReview.rating);
    // make reviewList ids => review objects
    gym = gymData.getByGymId(newReview.gymId);
    if (gym.reviews) {
      let reviewList = await reviewData.getGymReviewsListObjects(newReview.gymId)
    }
    gym.reviewsList = reviewList;
    res.status(200).render('singleGym', { gym: gym, userLoggedIn: userLoggedIn });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    return res.status(status).render("singleGym", { gym: gym, hasErrors: hasErrors, errors: errors });
  }

});

// a logged-in user to update a old post under a specific gym
router.route('/updateContent/:id').put(async (req, res) => {
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/users/login");
    }
    const currentUserId = userLoggedIn ? req.session.userId : null;
    // input check
    let reviewId = req.params.id;
    let updatedReview = req.body;
    let content = updatedReview.content;
    let date = updatedReview.dateOfReview;
    validation.checkArgumentsExist(reviewId, content, date);
    validation.checkNonEmptyStrings(reviewId, content, date);
    reviewId = validation.checkObjectId(reviewId);
    let review = reviewData.get(reviewId);
    date = await validation.checkValidDate(date);
    let gym = await gymData.getByGymId(review.gymId)
    await reviewData.updateReviewContent(reviewId, content, date);

    gym = gymData.getByGymId(newReview.gymId);
    if (gym.reviews) {
      let reviewList = await reviewData.getGymReviewsListObjects(newReview.gymId)
    }
    gym.reviewsList = reviewList;
    res.status(200).render('gym', { gym: gym, userLoggedIn: userLoggedIn });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    return res.status(status).render("singleGym", { gym: gym, hasErrors: hasErrors, errors: errors });
  }
})

router.route('/updateRating/:id').put(async (req, res) => {
  const currentUserId = userLoggedIn ? req.session.userId : null;
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/users/login");
    }
    let reviewId = req.params.id;
    let updatedReview = req.body;
    let rating = updatedReview.rating;
    let date = updatedReview.dateOfReview;
    validation.checkArgumentsExist(reviewId, rating, date);
    validation.checkNonEmptyStrings(reviewId, date);
    validation.checkValidRating(rating);
    reviewId = validation.checkObjectId(reviewId);
    date = await validation.checkValidDate(date);

    await reviewData.updateReviewRating(reviewId, rating, date);
    let review = await reviewData.get(reviewId);
    gym = gymData.getByGymId(newReview.gymId);
    if (gym.reviews) {
      let reviewList = await reviewData.getGymReviewsListObjects(newReview.gymId)
    }
    gym.reviewsList = reviewList;
    res.status(200).render('gym', { gym: gym, userLoggedIn: userLoggedIn });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    let reviewId = req.params.id;
    let review = await reviewData.get(reviewId);
    let gym = await gymData.getByGymId(review.gymId);
    return res.status(status).render("gym", { gym: gym, hasErrors: hasErrors, errors: errors });
  }
})

router.route('/delete/:id').delete(async (req, res) => {
  const currentUserId = userLoggedIn ? req.session.userId : null;
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/users/login");
    }
    let reviewId = req.params.id;
    reviewId = validation.checkObjectId(reviewId);
    let review = await reviewData.get(reviewId);

    gym = gymData.getByGymId(review.gymId);
    if (gym.reviews) {
      let reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    }
    gym.reviewsList = reviewList;
    await reviewData.removeReview(reviewId);
    res.status(200).render('gym', { gym: gym, userLoggedIn: userLoggedIn });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    return res.status(status).render("gym", { hasErrors: hasErrors, errors: errors });
  }
})
export default router;
