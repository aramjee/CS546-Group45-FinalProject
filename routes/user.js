// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link
import {Router} from 'express';
import * as helper from '../public/js/helper.js';
import {gymData, reviewData, userData} from '../data/index.js';
import * as validation from "../public/js/validation.js";
import bcrypt from 'bcrypt';
import xss from 'xss';


const router = Router();


router.route('/login').get(async (req, res) => {
  if (helper.checkIfLoggedIn(req)) {
    res.redirect("/users/profile");
  } else {
    res.render('login', {title: 'Gym User Login'});
  }
});

router.route('/logout').get(async (req, res) => {
  req.session.destroy(function (err) {
    console.log("User logged out");
    if (err) {
      return res.status(500).json({ error: 'Failed to log out' });
    }
  })
  res.status(200).render("login", {title: 'Gym User Login'});
});

router.route('/login').post(async (req, res) => {
  let hasErrors = false;
  let errors = [];

  if (helper.checkIfLoggedIn(req)) {
    res.redirect("/users/profile");
  } else {
    const {email, password} = req.body;
    const user = await userData.getByUserEmail(email);


    if (!user) {
      hasErrors = true;
      errors.push("Invalid Username or Password");
      return res.status(400).render("login", {hasErrors: hasErrors, errors: errors});
    }

    // Compare passwords using bcrypt (compare with hashed password)
    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);

    if (!passwordMatch) {
      hasErrors = true;
      errors.push("Invalid Username or Password");
      return res.status(401).render("login", {hasErrors: hasErrors, errors: errors});
    }

    req.session.userId = user._id.toString();
    return res.redirect("/users/profile");
  }
});

router.route('/signup').get(async (req, res) => {
  if (helper.checkIfLoggedIn(req)) {
    res.redirect("/users/profile");
  } else {
    res.render('signup', {title: 'Gym User Signup'});
  }
});

router.route('/signup').post(async (req, res) => {
  let hasErrors = false;
  let errors = [];

  const {
    firstName,
    lastName,
    username,
    email,
    city,
    state,
    dateOfBirth,
    isGymOwner,
    password,
  } = req.body;

  // validation
  try {
    validation.checkArgumentsExist(firstName, lastName, username, email, city, state, dateOfBirth, password);
    validation.checkNonEmptyStrings(firstName, lastName, username, email, city, state, password);
    await validation.checkValidEmail(email);
    await validation.checkValidDate(dateOfBirth);
  } catch (e) {
    hasErrors = true
    errors.push(e[1]);
    return res.status(e[0]).render("signup", {hasErrors: hasErrors, errors: errors});
  }


  const existingUser = await userData.getByUserEmail(email);
  if (existingUser) {
    hasErrors = true
    errors.push("Email already used, please login");
    return res.status(400).render("signup", {hasErrors: hasErrors, errors: errors});
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await userData.create(xss(firstName), xss(lastName), xss(username), xss(email), xss(city), xss(state), dateOfBirth, isGymOwner, hashedPassword)

  res.status(201).render("login", {hasErrors: hasErrors, errors: errors});
});

router.route('/profile').get(async (req, res) => {
  let hasErrors = false;
  let errors = [];
  if (!helper.checkIfLoggedIn(req)) {
    hasErrors = true;
    errors.push("Not log in, Please Login");
    res.status(403).render("login", {hasErrors: hasErrors, errors: errors});
  } else {
    const userId = req.session.userId;
    const user = await userData.getByUserId(userId);

    let reviewsWithGymsInfo = [];
    let favGymList = [];

    for (let i = 0; i < user.reviews.length; i++) {
      let r = await reviewData.get(user.reviews[i]);
      let g = await gymData.getByGymId(r.gymId);
      let reviewWithGymInfo = {
        review: r,
        gym: g
      }
      reviewsWithGymsInfo.push(reviewWithGymInfo);
    }

    for (let i = 0; i < user.favGymList.length; i++) {
      let g = await gymData.getByGymId(user.favGymList[i]);
      favGymList.push(g);
    }

    return res.status(200).render("profile", {
      id: userId,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      email: user.email,
      city: user.city,
      state: user.state,
      dateOfBirth: user.dateOfBirth,
      reviewsWithGymsInfo: reviewsWithGymsInfo,
      favGymList: favGymList,
      isGymOwner: user.isGymOwner,
      userLoggedIn: true
    });
  }
});

router.route('/update').get(async (req, res) => {
  let hasErrors = false;
  let errors = [];
  if (!helper.checkIfLoggedIn(req)) {
    hasErrors = true;
    errors.push("Not log in, Please Login");
    res.status(403).render("login", {hasErrors: hasErrors, errors: errors});
  } else {
    const user = await userData.getByUserId(req.session.userId);
    return res.status(200).render('update', {
      id: req.session.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      city: user.city,
      state: user.state,
      dateOfBirth: user.dateOfBirth,
      isGymOwner: user.isGymOwner,
      userLoggedIn: true
    });
  }
});

router.route('/update').post(async (req, res) => {
  let hasErrors = false;
  let errors = [];

  if (!helper.checkIfLoggedIn(req)) {
    hasErrors = true;
    errors.push("Not log in, Please Login");
    res.status(403).render("login", {hasErrors: hasErrors, errors: errors});
  } else {
    const {firstName, lastName, userName, city, state, dateOfBirth, newPassword, confirm, isGymOwner} = req.body;
    let user = await userData.getByUserId(req.session.userId);

    try {
      validation.checkArgumentsExist(firstName, lastName, userName, city, state, dateOfBirth);
      await validation.checkValidDate(dateOfBirth);
    } catch (e) {
      hasErrors = true
      errors.push(e[1]);
      return res.render("update", {
        id: req.session.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        city: user.city,
        state: user.state,
        dateOfBirth: user.dateOfBirth,
        isGymOwner: user.isGymOwner,
        userLoggedIn: true,
        hasErrors: hasErrors,
        errors: errors
      });
    }


    if (newPassword !== confirm) {
      hasErrors = true;
      errors.push("Passwords must match");
      return res.render("update", {
        id: req.session.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        city: user.city,
        state: user.state,
        dateOfBirth: user.dateOfBirth,
        isGymOwner: user.isGymOwner,
        userLoggedIn: true,
        hasErrors: hasErrors,
        errors: errors
      });
    }
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      user.hashedPassword = await bcrypt.hash(newPassword, salt);
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.userName = userName;
    user.city = city;
    user.state = state;
    user.dateOfBirth = dateOfBirth;
    user.isGymOwner = isGymOwner;

    try {
      await userData.update(req.session.userId, user);
    } catch (e) {
      res.status(500).json({message: e.toString()});
    }
    res.status(200).redirect("user/profile")
  }
});

router.route('/delete-fav-gym').post(async (req, res) => {
  let hasErrors = false;
  let errors = [];

  const {gymId} = req.body;

  if (!helper.checkIfLoggedIn(req)) {
    hasErrors = true;
    errors.push("Not log in, Please Login");
    res.status(403).render("login", {hasErrors: hasErrors, errors: errors});
  } else {
    const user = userData.getByUserId(req.session.userId);
    if (!user) {
      hasErrors = true;
      errors.push("User not found");
      res.status(500).redirect("user/profile")
    }

    const gymIndex = user.favGymList.indexOf(gymId);
    if (gymIndex === -1) {
      res.status(500).redirect("user/profile")
    }

    user.favGymList = user.favGymList.splice(gymIndex, 1);
    try {
      await userData.update(req.session.userId, user);
    } catch (e) {
      res.status(500).json({message: e.toString()});
    }
    res.status(200).redirect("user/profile")
  }
});


export default router;
