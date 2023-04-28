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

router.route('/new/:id').get(async (req, res) => {
  //console.log(req.params);
  if (!helpers.checkIfLoggedIn(req)) {
    console.log("You're inside the GET review /new/:id")
    res.redirect(`/gym/${req.params.id}`);
  } else {
    res.render('newReview', { title: 'Review Gym', gymId: req.params.id });
  }
});

// here the :id is gymId
router.route('/new/:id').post(async (req, res) => {
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    // get the gym, for rendering the singleGym page
    // console.log("You're inside the POST review /new/:id")
    let gym = await gymData.getByGymId(req.params.id);
    let reviewList = await reviewData.getGymReviewsListObjects(req.params.id)
    gym.reviews = reviewList;
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
    await reviewData.create(gym._id, userId, date, newReview.content, newReview.rating);
    // make reviewList ids => review objects,redo get the gym for rendering the singleGymPage (since new review successfully created)
    gym = await gymData.getByGymId(gym._id);
    reviewList = await reviewData.getGymReviewsListObjects(gym._id)
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
router.route('/updateContent/:id').get(async (req, res) => {
  //console.log(req.params);
  if (!helpers.checkIfLoggedIn(req)) {
    console.log("You're inside the GET review '/updateContent/:id'")
    res.redirect(`/gym/${req.params.id}`);
  } else {
    let reviewId = req.params.id;
    let review = await reviewData.get(reviewId);
    //console.log(review);
    res.render('updateReviewContent', { title: 'Update Review', reviewId: req.params.id, review: review });
  }
});
router.route('/updateContent/:id').put(async (req, res) => {
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    console.log("You're inside the PUT review /updateContent/:id")
    // get the gym, for rendering the singleGym page
    let reviewId = req.params.id;
    let review = await reviewData.get(reviewId);
    let gym = await gymData.getByGymId(review.gymId);
    let reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    gym.reviews = reviewList;
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
    // update review content
    await reviewData.updateReviewContent(reviewId, content, date);
    // make reviewList ids => review objects,redo get the gym for rendering the singleGymPage (since new review successfully created)
    gym = await gymData.getByGymId(review.gymId);
    reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
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
    if (!gym) {
      let title = 'ERROR'
      return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors });
    }
    return res.status(status).render("singleGym", { gym: gym, hasErrors: hasErrors, errors: errors });
  }
})


router.route('/updateRating/:id').get(async (req, res) => {
  //console.log(req.params);
  if (!helpers.checkIfLoggedIn(req)) {
    console.log("You're inside the GET review '/updateRating/:id'")
    res.redirect(`/gym/${req.params.id}`);
  } else {
    let reviewId = req.params.id;
    let review = await reviewData.get(reviewId);
    res.render('updateReviewRating', { title: 'Update Rating', reviewId: req.params.id, review: review });
  }
});
// here the :id is reviewId
router.route('/updateRating/:id').put(async (req, res) => {
  //const currentUserId = userLoggedIn ? req.session.userId : null;
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    // get the gym, for rendering the singleGym page
    console.log("You're inside the PUT review /updateRating/:id")
    let reviewId = req.params.id;
    let review = await reviewData.get(reviewId);
    let gym = await gymData.getByGymId(review.gymId);
    let reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    gym.reviews = reviewList;
    // input check
    let updatedReview = req.body;

    const event = new Date();
    let s = event.toISOString();
    const date = s.slice(0, 10);
    validation.checkArgumentsExist(reviewId, rating, date);
    validation.checkNonEmptyStrings(reviewId, date);
    reviewId = validation.checkObjectId(reviewId);
    let rating = updatedReview.rating;
    rating = parseFloat(rating)
    rating = await validation.checkValidRating(rating);
    // update review rating
    await reviewData.updateReviewRating(reviewId, rating, date);
    // make reviewList ids => review objects,redo get the gym for rendering the singleGymPage (since new review successfully created)
    gym = await gymData.getByGymId(review.gymId);
    reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
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
    if (!gym) {
      let title = 'ERROR'
      return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors });
    }
    return res.status(status).render("singleGym", { gym: gym, hasErrors: hasErrors, errors: errors });
  }
})



router.route('/delete/:id').get(async (req, res) => {
  //console.log(req.params);
  if (!helpers.checkIfLoggedIn(req)) {
    console.log("You're inside the GET review '/delete/:id'")
    res.redirect(`/gym/${req.params.id}`);
  } else {
    let reviewId = req.params.id;
    let review = await reviewData.get(reviewId);
    let gym = await gymData.getByGymId(review.gymId);
    res.render('reviewConfirmDelete', { title: 'Delete Review', reviewId: req.params.id, review: review, gym: gym });
  }
});
// here the :id is reviewId
router.route('/delete/:id').delete(async (req, res) => {
  const currentUserId = userLoggedIn ? req.session.userId : null;
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    console.log("You're inside the DELETE review /delete/:id")

    let reviewId = req.params.id;
    reviewId = validation.checkObjectId(reviewId);
    let review = await reviewData.get(reviewId);
    await reviewData.removeReview(reviewId);
    gym = await gymData.getByGymId(review.gymId);
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
    if (!gym) {
      let title = 'ERROR'
      return res.status(status).render("error", { title: title, hasErrors: hasErrors, errors: errors });
    }
    return res.status(status).render("singleGym", { hasErrors: hasErrors, errors: errors });
  }
})
export default router;
