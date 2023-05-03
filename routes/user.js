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
    return res.render('login', { title: 'Gym User Login' });
  }
});

// Alternate rout for login, since the POST and GET in the same url /login
router.route('/loginPage').get(async (req, res) => {
  //console.log(req.body);
  if (helpers.checkIfLoggedIn(req)) {
    return res.redirect("/user/profile");
  } else {
    return res.render('login', { title: 'Gym User Login' });
  }
});

router.route('/logout').get(async (req, res) => {
  req.session.destroy(function (err) {
    //Delete username from res.locals
    delete res.locals.loggedInUserName;

    console.log("User logged out");
    if (err) {
      return res.status(500).json({ error: 'Failed to log out' });
    }
  })
  return res.status(200).render("login", { title: 'Gym User Login' });
});

router.route('/login').post(async (req, res) => {
  //  console.log(req.body);
  let hasErrors = false;
  let errors = [];

  if (helpers.checkIfLoggedIn(req)) {
    return res.redirect("/user/profile");
  } else {
    const { email, password } = req.body;
    try {
      validation.checkValidEmail(email);
      validation.checkValidPassword(password);
      const userId = await userData.checkUser(email, password);
      if (userId) {
        req.session.userId = userId.userId;
        return res.redirect("/user/profile");
      } else {
        hasErrors = true;
        errors.push("'Invalid username and/or password.'")
        return res.status(400).render("login", { title: 'Gym User Login', hasErrors: hasErrors, errors: errors });
      }
    } catch (e) {
      let status = e[0] ? e[0] : 500;
      let message = e[1] ? e[1] : 'Internal Server Error';
      hasErrors = true;
      errors.push(message);
      return res.status(status).render("login", { title: 'Gym User Login', hasErrors: hasErrors, errors: errors });
    }
  }
});

router.route('/signup').get(async (req, res) => {
  if (helpers.checkIfLoggedIn(req)) {
    return res.redirect("/user/profile");
  } else {
    return res.render('signup', { title: 'Gym User Signup' });
  }
});

router.route('/signup').post(async (req, res) => {
  let hasErrors = false;
  let errors = [];

  //console.log(req.body);
  const {
    firstName,
    lastName,
    userName,
    email,
    city,
    state,
    dateOfBirth,
    isGymOwner,
    password,
  } = req.body;

  console.log(req.body);
  // validation
  try {
    validation.checkArgumentsExist(firstName, lastName, userName, email, city, state, dateOfBirth, isGymOwner, password);
    validation.checkNonEmptyStrings(userName, email, password);
    validation.checkValidEmail(email);
    validation.checkValidPassword(password);

    if (dateOfBirth.length > 0) {
      validation.checkValidDate(dateOfBirth);
    }

  } catch (e) {
    hasErrors = true
    errors.push(e[1]);
    return res.status(e[0]).render("signup", { title: 'Gym User Signup', hasErrors: hasErrors, errors: errors });
  }

  const duplicateEmail = await userData.getByUserEmail(email.toLowerCase());
  if (duplicateEmail) {
    hasErrors = true
    errors.push("Email already used, please login");
    return res.status(400).render("signup", { title: 'Gym User Signup', hasErrors: hasErrors, errors: errors });
  }

  const duplicateUserName = await userData.getByUserName(userName.toLowerCase());
  if (duplicateUserName) {
    hasErrors = true
    errors.push("UserName already used, please login");
    return res.status(400).render("signup", { title: 'Gym User Signup', hasErrors: hasErrors, errors: errors });
  }

  try {
    await userData.create(xss(firstName), xss(lastName), xss(userName), xss(email), xss(city), xss(state), dateOfBirth, isGymOwner, xss(password))
    return  res.status(201).render("login", { title: 'Gym User Login' });//, email: email, password: password });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    hasErrors = true;
    errors.push(message);
    return res.status(status).render("signup", { title: 'Gym User Signup', hasErrors: hasErrors, errors: errors });
  }
});

router.route('/profile').get(async (req, res) => {
  let hasErrors = false;
  let errors = [];
  try {
    if (!helpers.checkIfLoggedIn(req)) {
      hasErrors = true;
      errors.push("Not log in, Please Login");
      res.status(403).render("login", { title: 'Gym User Login', hasErrors: hasErrors, errors: errors });
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
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    hasErrors = true;
    errors.push(message);
    //TODO: Need to discuss for redirect
    return res.status(status).render("error", { errors: errors });
  }
});

router.route('/update').get(async (req, res) => {
  let hasErrors = false;
  let errors = [];
  if (!helpers.checkIfLoggedIn(req)) {
    hasErrors = true;
    errors.push("Not log in, Please Login");
    res.status(403).render("login", { title: 'Gym User Login', hasErrors: hasErrors, errors: errors });
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
        userLoggedIn: true
      });
    } catch (e) {
      let status = e[0] ? e[0] : 500;
      let message = e[1] ? e[1] : 'Internal Server Error';
      hasErrors = true;
      errors.push(message);
      //TODO: Need to discuss for redirect
      return res.status(status).render("error", { errors: errors });
    }
  }
});

router.route('/update').post(async (req, res) => {
  let hasErrors = false;
  let errors = [];

  if (!helpers.checkIfLoggedIn(req)) {
    hasErrors = true;
    errors.push("Not log in, Please Login");
    res.status(403).render("login", { hasErrors: hasErrors, errors: errors });
  } else {
    const { firstName, lastName, userName, city, state, dateOfBirth, password, confirm, isGymOwner } = req.body;
    let user = await userData.getByUserId(req.session.userId);

    try {
      validation.checkArgumentsExist(firstName, lastName, userName, city, state, dateOfBirth);
      validation.checkNonEmptyStrings(firstName, lastName, userName, city, state);
      if (dateOfBirth.length > 0) {
        validation.checkValidDate(dateOfBirth);
      }
      if (password !== confirm) {
        throw [400, `ERROR: Passwords must match`];
      }
      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.hashedPassword = await bcrypt.hash(password, salt);
      }


      const duplicateUserName = await userData.getByUserName(userName.toLowerCase());
      if (duplicateUserName && duplicateUserName.userName !== user.userName) {
        throw [400, `ERROR: UserName is used`];
      }

      user.firstName = firstName;
      user.lastName = lastName;
      user.userName = userName;
      user.city = city;
      user.state = state;
      user.dateOfBirth = dateOfBirth;
      user.isGymOwner = isGymOwner;

      await userData.update(req.session.userId, user);
    } catch (e) {
      let status = e[0] ? e[0] : 500;
      let message = e[1] ? e[1] : 'Internal Server Error';
      hasErrors = true;
      errors.push(message);
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
        errors: errors
      });
    }
    // return res.status(200).redirect("user/profile")
    res.redirect("/user/profile");

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

    return res.status(200).json({ gym:gym, user:user, message: 'Success add favList' });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    return res.status(status).json({ error: message });
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
    res.status(403).render("login", { hasErrors: hasErrors, errors: errors });
  } else {
    const user = await userData.getByUserId(req.session.userId);
    if (!user) {
      hasErrors = true;
      errors.push("User not found");
      res.status(500).redirect("user/profile")
    }
    const gymIndex = user.favGymList.indexOf(gymId);
    if (gymIndex === -1) {
      res.status(500).redirect("user/profile")
    }

    user.favGymList.splice(gymIndex, 1);
    try {
      await userData.update(req.session.userId, user);
    } catch (e) {
      res.status(500).json({ message: e.toString() });
    }

    if(invokedFromUserProfilePage){
      //Request to remove from favorites came from user profile page so redirecting user back to same page
      return res.status(200).redirect("/user/profile")
    }else{
      //Returning gym to dynamically render add/remove from favorites button on single gym page
      let gym = await gymData.getByGymId(gymId);
      return res.status(200).json({ gym:gym, user:user, message: 'Success remove from favList' });
    }
  }
});


export default router;
