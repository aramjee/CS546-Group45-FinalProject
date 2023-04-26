// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link
import { Router } from 'express';
import { gymData, reviewData, commentData, userData } from '../data/index.js';
import * as validation from "../public/js/validation.js";
import * as helper from '../public/js/helper.js';

const router = Router();


//TODO: date must be after birthday
// TODO: duplicate userName
//TODO: a user post a review cannot add a comment under his/her own review!
// TODO: comment date cannot before reivew date

router.route('/new/:id').get(async (req, res) => {
    console.log(req.params);
    if (!helper.checkIfLoggedIn(req)) {
        res.redirect(`/gym/${req.params.id}`);
    } else {
        res.render('newReview', { title: 'Gym User Signup' });
    }
});

// a logged-in user to create a new post under a specific gym
router.route('/new/:id').post(async (req, res) => {
  //code here for POST
  try {
    let userLoggedIn = helper.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/users/login");
    }
    let newReview = req.body;
    await validation.checkArgumentsExist(newReview.gymId, newReview.userId, newReview.dateOfReview, newReview.content, newReview.rating);
    await validation.checkNonEmptyStrings(newReview.gymId, newReview.userId, newReview.dateOfReview);
    newReview.gymId = await validation.checkObjectId(newReview.gymId);
    newReview.userId = await validation.checkObjectId(newReview.userId);
    newReview.dateOfReview = await validation.checkValidDate(newReview.dateOfReview);
    newReview.rating = await validation.checkValidRating(newReview.rating);

    await reviewData.create(newReview.gymId, newReview.userId, newReview.dateOfReview, newReview.content, newReview.rating);
    res.status(200).render('gym', { gym: newReview.gym, userLoggedIn: userLoggedIn });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    res.status(status).json({ error: message });
  }

});

// a logged-in user to update a old post under a specific gym
router.route('/updateContent/:id').put(async (req, res) => {
  try {
    let userLoggedIn = helper.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/users/login");
    }
    let reviewId = req.params.id;
    let updatedReview = req.body;
    let content = updatedReview.content;
    let date = updatedReview.dateOfReview;
    await validation.checkArgumentsExist(reviewId, content, date);
    await validation.checkNonEmptyStrings(reviewId, content, date);
    reviewId = validation.checkObjectId(reviewId);
    date = await validation.checkValidDate(date);

    await reviewData.updateReviewContent(reviewId, content, date);
    let review = await reviewData.get(reviewId);
    let gym = review.gymId;
    res.status(200).render('gym', { gym: gym, userLoggedIn: userLoggedIn });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    res.status(status).json({ error: message });
  }
})

router.route('/updateRating/:id').put(async (req, res) => {
  try {
    let userLoggedIn = helper.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/users/login");
    }
    let reviewId = req.params.id;
    let updatedReview = req.body;
    let rating = updatedReview.rating;
    let date = updatedReview.dateOfReview;
    await validation.checkArgumentsExist(reviewId, rating, date);
    await validation.checkNonEmptyStrings(reviewId, date);
    await validation.checkValidRating(rating);
    reviewId = validation.checkObjectId(reviewId);
    date = await validation.checkValidDate(date);

    await reviewData.updateReviewRating(reviewId, rating, date);
    let review = await reviewData.get(reviewId);
    let gym = review.gymId;
    res.status(200).render('gym', { gym: gym, userLoggedIn: userLoggedIn });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    res.status(status).json({ error: message });
  }
})

router.route('/delete/:id').delete(async (req, res) => {
  try {
    let userLoggedIn = helper.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/users/login");
    }
    let reviewId = req.params.id;
    reviewId = validation.checkObjectId(reviewId);
    let review = await reviewData.get(reviewId);

    let gym = review.gymId;
    await reviewData.removeReview(reviewId);
    res.status(200).render('gym', { gym: gym, userLoggedIn: userLoggedIn });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    res.status(status).json({ error: message });
  }
})
export default router;
