// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link
import { Router } from 'express';
import helpers from '../public/js/helpers.js';
import { gymData, reviewData, userData } from '../data/index.js';
import * as validation from "../public/js/validation.js";
import bcrypt from 'bcrypt';
import xss from 'xss';


const router = Router();


router.route('/login').get(async (req, res) => {
  //console.log(req.body);
  if (helpers.checkIfLoggedIn(req)) {
    return res.redirect("/user/profile");
  } else {
    return res.render('login', { title: 'User Login' });
  }
});

// Alternate rout for login, since the POST and GET in the same url /login
router.route('/loginPage').get(async (req, res) => {
  //console.log(req.body);
  if (helpers.checkIfLoggedIn(req)) {
    return res.redirect("/user/profile");
  } else {
    return res.render('login', { title: 'User Login' });
  }
});

router.route('/logout').get(async (req, res) => {
  req.session.destroy(function (err) {
    //Delete username from res.locals
    delete res.locals.loggedInUserName;

    console.log("User logged out");
    if (err) {
      //todo
      return res.status(500).json({ error: 'Failed to log out' });
    }
  })
  return res.status(200).render("login", { title: 'User Login' });
});

router.route('/login').post(async (req, res) => {
  //  console.log(req.body);
  let hasErrors = false;
  let errors = [];

  if (helpers.checkIfLoggedIn(req)) {
    return res.redirect("/user/profile");
  } else {
    try {
      const sanitizedEmail = xss(req.body.email).toLowerCase().trim();
      const sanitizedPassword = xss(req.body.password).trim();
      validation.checkValidEmail(sanitizedEmail);
      validation.checkValidPassword(sanitizedPassword);
      const userId = await userData.checkUser(sanitizedEmail, sanitizedPassword);
      if (userId) {
        req.session.userId = userId.userId;
        return res.redirect("/user/profile");
      } else {
        hasErrors = true;
        errors.push("'Invalid username and/or password.'")
        return res.status(400).render("login", { title: 'User Login', hasErrors: hasErrors, errors: errors });
      }
    } catch (e) {
      let status = e[0] ? e[0] : 500;
      let message = e[1] ? e[1] : 'Internal Server Error';
      hasErrors = true;
      errors.push(message);
      return res.status(status).render("login", { title: 'User Login', hasErrors: hasErrors, errors: errors });
    }
  }
});

router.route('/signup').get(async (req, res) => {
  if (helpers.checkIfLoggedIn(req)) {
    return res.redirect("/user/profile");
  } else {
    return res.render('signup', { title: 'User Signup' });
  }
});

router.route('/signup').post(async (req, res) => {
  let hasErrors = false;
  let errors = [];
  // validation
  try {
    console.log("for user signup route, the input for dateOfBirth should be in the format of YYYY-MM-DD")
    const sanitizedFirstName = xss(req.body.firstName).trim();
    const sanitizedLastName = xss(req.body.lastName).trim();
    const sanitizedUserName = xss(req.body.userName).trim();
    const sanitizedEmail = xss(req.body.email).toLowerCase().trim();
    const sanitizedCity = xss(req.body.city).trim();
    const sanitizedState = xss(req.body.state).trim();
    const sanitizedPassword = xss(req.body.password).trim();
    const sanitizedIsGymOwner = xss(req.body.isGymOwner).trim();
    const sanitizedDateOfBirth = xss(req.body.dateOfBirth).trim();
    validation.checkArgumentsExist(sanitizedFirstName, sanitizedLastName, sanitizedUserName, sanitizedEmail, sanitizedCity, sanitizedState, sanitizedDateOfBirth, sanitizedIsGymOwner, sanitizedPassword);
    validation.checkNonEmptyStrings(sanitizedFirstName, sanitizedLastName, sanitizedUserName, sanitizedEmail, sanitizedCity, sanitizedState, sanitizedDateOfBirth, sanitizedPassword);
    validation.checkValidEmail(sanitizedEmail);
    validation.checkValidPassword(sanitizedPassword);

    if (sanitizedDateOfBirth.length > 0) {
      validation.checkValidDate(sanitizedDateOfBirth);
    }


    const duplicateEmail = await userData.getByUserEmail(sanitizedEmail.toLowerCase());
    if (duplicateEmail) {
      throw [400, `Email already used, please login`];
    }

    const duplicateUserName = await userData.getByUserName(sanitizedUserName.toLowerCase());
    if (duplicateUserName) {
      throw [400, `UserName already used, please login`];
    }

    await userData.create(sanitizedFirstName, sanitizedLastName, sanitizedUserName, sanitizedEmail, sanitizedCity, sanitizedState, sanitizedDateOfBirth, sanitizedIsGymOwner, sanitizedPassword)
    // instead of render, it should be redirect.
    return res.status(201).redirect("/user/login");//, email: email, password: password });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    hasErrors = true;
    errors.push(message);
    return res.status(status).render("signup", { title: 'User Signup', hasErrors: hasErrors, errors: errors });
  }
});

router.route('/profile').get(async (req, res) => {
  let hasErrors = false;
  let errors = [];
  try {
    if (!helpers.checkIfLoggedIn(req)) {
      hasErrors = true;
      errors.push("Not log in, Please Login");
      return res.status(403).render("login", { title: 'User Login', hasErrors: hasErrors, errors: errors });
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
        userLoggedIn: true,
        title: "Profile Page"
      });
    }
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    hasErrors = true;
    errors.push(message);
    let currentUser = undefined;
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (userLoggedIn) {
      currentUser = await userData.getByUserId(req.session.userId);
    } else {
      currentUser = null;
    }
    let title = 'ERROR'
    return res.status(status).render("error", { hasErrors: hasErrors, errors: errors, currentUser: currentUser, userLoggedIn: userLoggedIn, title: title });
  }
});

router.route('/update').get(async (req, res) => {
  let hasErrors = false;
  let errors = [];
  if (!helpers.checkIfLoggedIn(req)) {
    hasErrors = true;
    errors.push("Not log in, Please Login");
    return res.status(403).render("login", { title: 'User Login', hasErrors: hasErrors, errors: errors });
  } else {
    try {
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
        userLoggedIn: true,
        title: "Update Page"
      });
    } catch (e) {
      let status = e[0] ? e[0] : 500;
      let message = e[1] ? e[1] : 'Internal Server Error';
      hasErrors = true;
      errors.push(message);
      //TODO: Need to discuss for redirect
      let currentUser = undefined;
      let userLoggedIn = helpers.checkIfLoggedIn(req);
      if (userLoggedIn) {
        currentUser = await userData.getByUserId(req.session.userId);
      } else {
        currentUser = null;
      }
      let title = "ERROR";
      return res.status(status).render("error", { hasErrors: hasErrors, errors: errors, currentUser: currentUser, userLoggedIn: userLoggedIn, title: title });

    }
  }
});


router.route('/update').post(async (req, res) => {
  console.log("for user update route, the input for dateOfBirth should be in the format of YYYY-MM-DD")
  let hasErrors = false;
  let errors = [];

  if (!helpers.checkIfLoggedIn(req)) {
    hasErrors = true;
    errors.push("Not log in, Please Login");
    return res.status(403).render("login", { hasErrors: hasErrors, errors: errors, title: "User Login" });
  } else {
    try {
      try { await userData.getByUserId(req.session.userId); }
      catch (e) {
        let status = e[0] ? e[0] : 500;
        let message = e[1] ? e[1] : 'Internal Server Error';
        let hasErrors = true;
        let errors = []
        errors.push(message);
        let currentUser = undefined;
        let userLoggedIn = helpers.checkIfLoggedIn(req);
        if (userLoggedIn) {
          currentUser = await userData.getByUserId(req.session.userId);
        } else {
          currentUser = null;
        }
        let title = "ERROR";
        return res.status(status).render("error", { hasErrors: hasErrors, errors: errors, currentUser: currentUser, userLoggedIn: userLoggedIn, title: title });
      }

      let user = await userData.getByUserId(req.session.userId);
      const sanitizedFirstName = xss(req.body.firstName).trim();
      const sanitizedLastName = xss(req.body.lastName).trim();
      const sanitizedUserName = xss(req.body.userName).trim().toLowerCase();
      const sanitizedCity = xss(req.body.city).trim();
      const sanitizedState = xss(req.body.state).trim();
      const sanitizedDateOfBirth = xss(req.body.dateOfBirth).trim();
      const sanitizedPassword = xss(req.body.password).trim();
      const sanitizedConfirm = xss(req.body.confirm).trim();
      validation.checkArgumentsExist(sanitizedFirstName, sanitizedLastName, sanitizedUserName, sanitizedCity, sanitizedState, sanitizedDateOfBirth, sanitizedPassword, sanitizedConfirm);
      validation.checkNonEmptyStrings(sanitizedFirstName, sanitizedLastName, sanitizedUserName, sanitizedCity, sanitizedState, sanitizedDateOfBirth, sanitizedPassword, sanitizedConfirm);

      if (sanitizedDateOfBirth.length > 0) {
        validation.checkValidDate(sanitizedDateOfBirth);
      }
      if (sanitizedPassword !== sanitizedConfirm) {
        throw [400, `ERROR: Passwords must match`];
      }
      if (sanitizedPassword) {
        const salt = await bcrypt.genSalt(10);
        user.hashedPassword = await bcrypt.hash(sanitizedPassword, salt);
        user.password = sanitizedPassword
      }


      const duplicateUserName = await userData.getByUserName(sanitizedUserName.toLowerCase());
      if (duplicateUserName && duplicateUserName.userName !== user.userName) {
        throw [400, `ERROR: UserName is used`];
      }

      user.firstName = sanitizedFirstName;
      user.lastName = sanitizedLastName;
      user.userName = sanitizedUserName;
      user.city = sanitizedCity;
      user.state = sanitizedState;
      user.dateOfBirth = sanitizedDateOfBirth;
      // Chloe: if there's no real update, instead of redirect to profile, re-render the same update page with errors
      try {
        await userData.update(req.session.userId, user);
        return res.redirect("/user/profile");
      } catch (e) {
        let status = e[0] ? e[0] : 500;
        let message = e[1] ? e[1] : 'Internal Server Error';
        hasErrors = true;
        errors.push(message);
        return res.status(status).render('update', {
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
          errors: errors,
          title: "Update Page"
        });
      }
    } catch (e) {
      let status = e[0] ? e[0] : 500;
      let message = e[1] ? e[1] : 'Internal Server Error';
      hasErrors = true;
      errors.push(message);
      // need to get the user befefore rendering. or otherwise undefined.
      let user = await userData.getByUserId(req.session.userId);
      return res.status(status).render("update", {
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
        errors: errors,
        title: "Update Page"
      });
    }
  }
});

// Add to favorites route
router.route('/add-to-fav/:gymId').post(async (req, res) => {
  try {
    const gymId = req.params.gymId.toString();

    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      return res.status(401).redirect("/user/loginPage");
    }

    const userId = req.session.userId;
    const user = await userData.getByUserId(userId)
    if (!user) {
      throw [400, `ERROR: User not found`];
    }

    let favList = user.favGymList;
    if (!favList.includes(gymId)) {
      favList.push(gymId);
      user.favGymList = favList;
      await userData.update(userId, user);
    }
    //Returning gym to dynamically render add/remove from favorites button
    let gym = await gymData.getByGymId(gymId);

    return res.status(200).json({ gym: gym, user: user, message: 'Success add favList' });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    let hasErrors = true;
    let errors = []
    errors.push(message);
    let currentUser = undefined;
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (userLoggedIn) {
      currentUser = await userData.getByUserId(req.session.userId);
    } else {
      currentUser = null;
    }
    let title = "ERROR";
    return res.status(status).render("error", { hasErrors: hasErrors, errors: errors, currentUser: currentUser, userLoggedIn: userLoggedIn, title: title });
  }
});

// Remove from favorites route
router.route('/delete-fav-gym/:gymId').post(async (req, res) => {
  let hasErrors = false;
  let errors = [];
  // invoke from userProfilePage shows that the request came from userProfilePage
  const invokedFromUserProfilePage = req.headers.referer.indexOf('/user/profile') !== -1;
  const gymId = req.params.gymId.toString();

  if (!helpers.checkIfLoggedIn(req)) {
    hasErrors = true;
    errors.push("Not log in, Please Login");
    return res.status(403).render("login", { hasErrors: hasErrors, errors: errors, title: "User Login" });
  } else {
    const user = await userData.getByUserId(req.session.userId);
    if (!user) {
      hasErrors = true;
      errors.push("User not found");
      return res.status(500).redirect("user/profile")
    }
    const gymIndex = user.favGymList.indexOf(gymId);
    if (gymIndex === -1) {
      return res.status(500).redirect("user/profile")
    }

    user.favGymList.splice(gymIndex, 1);
    try {
      await userData.update(req.session.userId, user);
    } catch (e) {
      let status = e[0] ? e[0] : 500;
      let message = e[1] ? e[1] : 'Internal Server Error';
      let hasErrors = true;
      let errors = []
      errors.push(message);
      let currentUser = undefined;
      let userLoggedIn = helpers.checkIfLoggedIn(req);
      if (userLoggedIn) {
        currentUser = await userData.getByUserId(req.session.userId);
      } else {
        currentUser = null;
      }
      let title = "ERROR";
      return res.status(status).render("error", { hasErrors: hasErrors, errors: errors, currentUser: currentUser, userLoggedIn: userLoggedIn, title: title });
    }

    if (invokedFromUserProfilePage) {
      //Request to remove from favorites came from user profile page so redirecting user back to same page
      return res.status(200).redirect("/user/profile")
    } else {
      //Returning gym to dynamically render add/remove from favorites button on single gym page
      let gym = await gymData.getByGymId(gymId);
      return res.status(200).json({ gym: gym, user: user, message: 'Success remove from favList' });
    }
  }
});


export default router;
