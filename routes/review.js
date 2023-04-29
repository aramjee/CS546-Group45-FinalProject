// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link
import { Router } from 'express';
import { gymData, reviewData, commentData, userData } from '../data/index.js';
import * as validation from "../public/js/validation.js";
import helpers from '../public/js/helpers.js';

const router = Router();


//TODO: date must be after birthday
// TODO: duplicate userName
//TODO: a user post a review cannot add a comment under his/her own review!
// TODO: comment date cannot before reivew date

router.route('/new/:gymId').get(async (req, res) => {
  //console.log(req.params);
  try {
    if (!helpers.checkIfLoggedIn(req)) {
      console.log("You're inside the GET review /new/:gymId")
      res.status(401).redirect("/user/login");
    } else {
      let gym = await gymData.getByGymId(req.params.gymId)
      res.render('newReview', { title: 'Review Gym', gym: gym });
    }
  } catch (e) {
    console.log("you're inside router.route('/new/:id').get")
    console.log(e)
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    let title = 'ERROR'
    return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors });
  }
});

router.route('/new/:gymId').post(async (req, res) => {
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    console.log("You're inside the POST review /new/:id")
    let gymId = req.params.gymId;
    let newReview = req.body;
    // input check and then create this post
    const userId = req.session.userId;
    const event = new Date();
    let s = event.toISOString();
    const date = s.slice(0, 10);
    validation.checkArgumentsExist(newReview.content, newReview.rating);
    validation.checkNonEmptyStrings(newReview.content, newReview.rating);
    newReview.rating = parseFloat(newReview.rating)
    newReview.rating = await validation.checkValidRating(newReview.rating);
    await reviewData.create(gymId, userId, date, newReview.content, newReview.rating);
    // make reviewList ids => review objects, get the gym for rendering the singleGymPage (since new review successfully created)
    let gym = await gymData.getByGymId(gymId);
    let reviewList = await reviewData.getGymReviewsListObjects(gymId)
    gym.reviews = reviewList;
    res.status(200).render('singleGym', { gym: gym, userLoggedIn: userLoggedIn });
  } catch (e) {
    console.log("you're inside router.route('/new/:id').post");
    console.log(e)
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    let title = 'ERROR'
    return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors });
  }
});

// a logged-in user to update a old post under a specific gym
router.route('/updateContent/:gymId/:reviewId').get(async (req, res) => {
  //console.log(req.params);
  console.log("this is review /updateContent/:id get")
  if (!helpers.checkIfLoggedIn(req)) {
    res.status(401).redirect("/user/login");
  } else {
    try {
      let reviewId = req.params.reviewId;
      let review = await reviewData.get(reviewId);
      let gym = await gymData.getByGymId(req.params.gymId)
      //console.log(review);
      res.render('updateReviewContent', { title: 'Update Review', gym: gym, review: review });
    } catch (e) {
      console.log("you're inside router.route('/updateContent/:id').get")
      console.log(e)
      let status = e[0] ? e[0] : 500;
      let message = e[1] ? e[1] : 'Internal Server Error';
      let errors = []
      let hasErrors = true
      errors.push(message);
      let title = 'ERROR'
      return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors });
    }
  }
});
router.route('/updateContent/:gymId/:reviewId').put(async (req, res) => {
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    console.log("You're inside the PUT review /updateContent/:id")
    let reviewId = req.params.reviewId;
    // input check
    let updatedReview = req.body;
    let content = updatedReview.content;
    const event = new Date();
    let s = event.toISOString();
    const date = s.slice(0, 10);
    validation.checkArgumentsExist(reviewId, content, date);
    validation.checkNonEmptyStrings(reviewId, content, date);
    content = content.trim();
    reviewId = validation.checkObjectId(reviewId);
    let review = await reviewData.get(reviewId);
    // update review content
    await reviewData.updateReviewContent(reviewId, content, date);
    // make reviewList ids => review objects, get the gym for rendering the singleGymPage (since new review successfully created)
    let gym = await gymData.getByGymId(review.gymId);
    let reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    gym.reviews = reviewList;
    res.status(200).render('singleGym', { gym: gym, userLoggedIn: userLoggedIn });
  } catch (e) {
    console.log("you're inside router.route('/updateContent/:id').put")
    console.log(e)
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    // if not known single gym, redirect to error page (there exist an input error)
    let gym = await reviewData.getGymReviewsListObjects(req.params.gymId);
    if (!gym) {
      let title = 'ERROR'
      return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors });
    }
    return res.status(status).render("singleGym", { gym: gym, hasErrors: hasErrors, errors: errors });
  }
})


router.route('/updateRating/:gymId/:reviewId').get(async (req, res) => {
  //console.log(req.params);
  try {
    if (!helpers.checkIfLoggedIn(req)) {
      console.log("You're inside the GET review '/updateRating/:id'")
      res.status(401).redirect("/user/login");
    }
    let reviewId = req.params.reviewId;
    let review = await reviewData.get(reviewId);
    let gym = await gymData.getByGymId(req.params.gymId)
    res.render('updateReviewRating', { title: 'Update Rating', gym: gym, review: review });
  } catch (e) {
    console.log("you're inside router.route('/updateRating/:id').get")
    console.log(e)
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    let title = 'ERROR'
    return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors });
  }
});

router.route('/updateRating/:gymId/:reviewId').put(async (req, res) => {
  //const currentUserId = userLoggedIn ? req.session.userId : null;
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    console.log("You're inside the PUT review /updateRating/:id")
    // input check
    let updatedReview = req.body;
    const event = new Date();
    let s = event.toISOString();
    const date = s.slice(0, 10);
    let reviewId = req.params.reviewId;
    validation.checkArgumentsExist(reviewId, rating, date);
    validation.checkNonEmptyStrings(reviewId, date);
    reviewId = validation.checkObjectId(reviewId);
    let rating = updatedReview.rating;
    rating = parseFloat(rating)
    rating = await validation.checkValidRating(rating);
    // update review rating
    await reviewData.updateReviewRating(reviewId, rating, date);
    // make reviewList ids => review objects, get the gym for rendering the singleGymPage (since new review successfully created)
    let gym = await gymData.getByGymId(review.gymId);
    let reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    gym.reviews = reviewList;
    res.status(200).render('singleGym', { gym: gym, userLoggedIn: userLoggedIn });
  } catch (e) {
    console.log("you're inside router.route('/updateRating/:id').put");
    console.log(e)
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    // if not known single gym, redirect to error page (there exist an input error)
    let gym = await reviewData.getGymReviewsListObjects(req.params.gymId);
    if (!gym) {
      let title = 'ERROR'
      return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors });
    }
    return res.status(status).render("singleGym", { gym: gym, hasErrors: hasErrors, errors: errors });
  }
})



router.route('/delete/:gymId/:reviewId').get(async (req, res) => {
  //console.log(req.params);
  try {
    if (!helpers.checkIfLoggedIn(req)) {
      console.log("You're inside the GET review '/delete/:id'")
      res.status(401).redirect("/user/login");
    } else {
      let reviewId = req.params.reviewId;
      let review = await reviewData.get(reviewId);
      let gym = await gymData.getByGymId(review.gymId);
      res.render('reviewConfirmDelete', { title: 'Delete Review', review: review, gym: gym });
    }
  } catch (e) {
    console.log("you're inside router.route('/delete/:id').get")
    console.log(e)
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    let title = 'ERROR'
    return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors });
  }
});
router.route('/delete/:gymId/:reviewId').delete(async (req, res) => {
  const currentUserId = userLoggedIn ? req.session.userId : null;
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    console.log("You're inside the DELETE review /delete/:id")
    let reviewId = req.params.reviewId;
    reviewId = validation.checkObjectId(reviewId);
    let review = await reviewData.get(reviewId);
    // remove the review
    await reviewData.removeReview(reviewId);
    let gym = await gymData.getByGymId(review.gymId);
    let reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    gym.reviews = reviewList;
    res.status(200).render('singleGym', { gym: gym, userLoggedIn: userLoggedIn });
  } catch (e) {
    console.log("you're inside router.route('/delete/:id').delete");
    console.log(e)
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let errors = []
    let hasErrors = true
    errors.push(message);
    // if not known single gym, redirect to error page (there exist an input error)
    let gym = await reviewData.getGymReviewsListObjects(req.params.gymId);
    if (!gym) {
      let title = 'ERROR'
      return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors });
    }
    return res.status(status).render("singleGym", { hasErrors: hasErrors, errors: errors });
  }
})
export default router;
