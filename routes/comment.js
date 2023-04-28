// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link
import { Router } from 'express';
import { gymData, commentData, userData, reviewData } from '../data/index.js';
import * as validation from "../public/js/validation.js";
import helpers from '../public/js/helpers.js';

const router = Router();
// here id is reviewId
router.route('/new/:id').get(async (req, res) => {
  //console.log(req.params);
  if (!helpers.checkIfLoggedIn(req)) {
    res.redirect(`/gym/${req.params.id}`);
  } else {
    res.render('newComment', { title: 'Comment on Review', id: req.params.id });
  }
});
// a logged-in user to create a new comment under a specific gym and specific review
// here id is reviewId
router.route('/new/:id').post(async (req, res) => {
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
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
    const event = new Date();
    let s = event.toISOString();
    const date = s.slice(0, 10);
    const userId = req.session.userId;

    validation.checkArgumentsExist(newComment.content);
    let content = validation.checkNonEmptyStrings(newComment.content);
    userId = await validation.checkObjectId(userId);
    // create the comment
    await commentData.create(userId, date, content, reviewId);
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
// here the :id is commentId


router.route('/update/:id').get(async (req, res) => {
  //console.log(req.params);
  if (!helpers.checkIfLoggedIn(req)) {
    console.log("You're inside the GET comment '/update/:id'")
    res.redirect(`/gym/${req.params.id}`);
  } else {
    let commentId = req.params.id;
    let comment = await commentData.get(commentId);
    let review = await reviewData.get(comment.reviewId);
    let gym = await gymData.getByGymId(review.gymId);
    res.render('updateComment', { title: 'Update Comment', commentId: req.params.id, comment: comment, review: review, gym: gym });
  }
});
router.route('/update/:id').put(async (req, res) => {
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    let commentId = req.params.id;
    let updatedComment = req.body;
    const event = new Date();
    let s = event.toISOString();
    const date = s.slice(0, 10);
    const userId = req.session.userId;

    validation.checkArgumentsExist(commentId, updatedComment.content);
    updatedComment.content = validation.checkNonEmptyStrings(updatedComment.content);
    updatedComment.commentId = await validation.checkObjectId(commentId, 'comment id');
    await commentData.update(commentId, updatedComment.content, date);
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

// here the :id is commentId
router.route('/delete/:id').get(async (req, res) => {
  //console.log(req.params);
  if (!helpers.checkIfLoggedIn(req)) {
    console.log("You're inside the GET comment '/delete/:id'")
    res.redirect(`/gym/${req.params.id}`);
  } else {
    let commentId = req.params.id;
    let comment = await commentData.get(commentId);
    let review = await reviewData.get(comment.reviewId);
    let gym = await gymData.getByGymId(review.gymId);
    res.render('commentConfirmDelete', { title: 'Delete Comment', commentId: req.params.id, comment: comment, review: review, gym: gym });
  }
});
router.route('/delete/:id').delete(async (req, res) => {
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    const userId = req.session.userId;

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
