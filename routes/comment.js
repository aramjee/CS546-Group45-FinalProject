// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link
import { Router } from 'express';
import { gymData, commentData, userData, reviewData } from '../data/index.js';
import * as validation from "../public/js/validation.js";
import helpers from '../helpers.js';

const router = Router();

// a logged-in user to create a new comment under a specific gym and specific review
// here the :id is reviewId
router.route('/new/:id').post(async (req, res) => {
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/users/login");
    }
    // get the gym for singleGym page
    let reviewId = req.params.id;
    reviewId = await validation.checkObjectId(newComment.reviewId);
    let review = await reviewData.get(reviewId);
    let gym = await gymData.getByGymId(review.gymId);
    let reviewList = await reviewData.getGymReviewsListObjects(review.gymId)
    gym.reviews = reviewList;
    // input check
    let newComment = req.body;
    validation.checkArgumentsExist(newComment.userId, newComment.dateOfComment, newComment.content, newComment.reviewId);
    newComment.userId, newComment.dateOfComment, content, newComment.reviewId = validation.checkNonEmptyStrings(newComment.userId, newComment.dateOfComment, newComment.content, newComment.reviewId);
    let userId = await validation.checkObjectId(newComment.userId);
    let dateOfComment = await validation.checkValidDate(newComment.dateOfComment);
    // create the comment
    await commentData.create(userId, dateOfComment, content, reviewId);
    // render the singleGym
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

// a logged-in user to update a old post under a specific gym and specific review
// here the :id is reviewId
router.route('/update/:id').put(async (req, res) => {
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/users/login");
    }
    let commentId = req.params.id;
    let updatedComment = req.body;
    validation.checkArgumentsExist(commentId, updatedComment.content, updatedComment.dateOfComment);
    updatedComment.dateOfComment = await validation.checkValidDate(updatedComment.dateOfComment);
    updatedComment.content = validation.checkNonEmptyStrings(updatedComment.content);
    updatedComment.commentId = await validation.checkObjectId(commentId, 'comment id');

    await commentData.update(commentId, updatedComment.content, updatedComment.dateOfComment);
    let comment = await commentData.get(commentId);
    let review = await reviewData.get(comment.reviewId);
    res.status(200).render('singleGym', { gym: review.gymId, userLoggedIn: userLoggedIn });
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
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/users/login");
    }

    let commentId = req.params.id;
    commentId = validation.checkObjectId(commentId);
    let comment = await commentData.get(commentId);
    let review = await reviewData.get(comment.reviewId);
    let gym = review.gymId;
    await commentData.removeReview(commentId);
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
export default router;
