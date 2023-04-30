// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link
import { Router } from 'express';
import { gymData, reviewData, commentData, userData } from '../data/index.js';
import helpers from '../public/js/helpers.js';
import * as validation from "../public/js/validation.js";

const router = Router();

//Gym listing page
router.route('/').get(async (req, res) => {
  try {
    //User does not necessarily be logged in to view the gyms, only publish a review so had to comment this out....
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    const gymList = await gymData.getAll();
    return res.status(200).render('gymList', { gymsList: gymList, userLoggedIn: userLoggedIn });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

//Wild Card Search bar
router.route('/search').get(async (req, res) => {
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    const searchName = req.query.name;
    const gymsList = await gymData.searchByValue(searchName);
    return res.status(200).render('gymList', { gymsList: gymsList, userLoggedIn: userLoggedIn });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    res.status(status).json({ error: message });
  }
});

//Gym Manage Page, Ideally should be entered in user profile --> manage gym (if user is gym owner)
router.route('/manage').get(async (req, res) => {
  //console.log("In manage route");
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      return res.status(401).redirect("/user/login");
    }
    let checkIfGymOwner = helpers.checkIfGymOwner(req);
    if (!checkIfGymOwner) {
      // res.status(401).redirect("/users/profile");
      return res.status(403).json({ error: 'You must be a gym owner to add a gym' });
    }

    const gymOwnerId = req.session.userId;
    //console.log("Gym owner ID: " + gymOwnerId);
    await validation.checkObjectId(gymOwnerId, "gymOwnerId");
    const gymsList = await gymData.getByGymOwnerId(gymOwnerId);

    // console.log(gymsList);
    if (!gymsList) {
      return res.status(404).json({ error: 'No gym found for the current gym owner' });
    }
    return res.status(200).render('manageGyms', { title: "Create Gyms", gymsList: gymsList, userLoggedIn: userLoggedIn });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    return res.status(status).json({ error: message });
  }
});

//Add gym function in gym manage page
router.route('/add').post(async (req, res) => {
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    let checkIfGymOwner = helpers.checkIfGymOwner(req);
    if (!checkIfGymOwner) {
      // res.status(401).redirect("/users/profile");
      return res.status(403).json({ error: 'You must be a gym owner to add a gym' });
    }

    validation.checkArgumentsExist(req.body.gymName, req.body.website, req.body.category, req.body.address, req.body.city, req.body.state, req.body.zip, req.session.userId);
    validation.checkNonEmptyStrings(req.body.gymName, req.body.website, req.body.category, req.body.address, req.body.city, req.body.state, req.body.zip, req.session.userId);
    await validation.checkValidWebsite(req.body.website);
    await validation.checkObjectId(req.session.userId, "gymOwnerId");

    await gymData.create(req.body.gymName, req.body.website, req.body.category, req.session.userId, req.body.address, req.body.city, req.body.state, req.body.zip);
    res.status(201).redirect("/gym/manage");
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    res.status(status).json({ error: message });
  }
});

//Individual Gym page
router.route('/:id').get(async (req, res) => {
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    const currentUser = userLoggedIn ? await userData.getByUserId(req.session.userId) : null;

    let gym = await gymData.getByGymId(req.params.id);
    // Retrieve review, using the data function from reviewData - Chloe
    let reviewList = await reviewData.getGymReviewsListObjects(req.params.id)
    gym.reviews = reviewList;
    res.status(200).render("singleGym", { gym: gym, userLoggedIn: userLoggedIn, currentUser: currentUser });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    res.status(status).json({ error: message });
  }
});

//Delete gym function in gym manage function
router.route('/delete/:gymId').delete(async (req, res) => {
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    let checkIfGymOwner = helpers.checkIfGymOwner(req);
    if (!checkIfGymOwner) {
      // res.status(401).redirect("/user/profile");
      return res.status(403).json({ error: 'You must be a gym owner to add a gym' });
    }
    const gymOwnerId = req.session.userId;
    const gymId = req.params.gymId;
    await validation.checkObjectId(gymId, "gymId");
    //TODO: throw 403 for mismatch ownerId, need to catch
    await gymData.remove(gymId, gymOwnerId);
    res.status(200).redirect("/gym/manage");
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    res.status(status).json({ error: message });
  }
});

router.route('/edit/:gymId').get(async (req, res) => {
  //console.log(req.params);
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    let checkIfGymOwner = helpers.checkIfGymOwner(req);
    if (!checkIfGymOwner) {
      // res.status(401).redirect("/users/profile");
      return res.status(403).json({ error: 'You must be a gym owner to add a gym' });
    }
    return res.status(200).render("editGym", { title: 'Edit Gym', gymId: req.params.gymId, userLoggedIn: userLoggedIn });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    res.status(status).json({ error: message });
  }
});

//Edit gym function in manage page
router.route('/edit/:gymId').put(async (req, res) => {
  try {
    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      res.status(401).redirect("/user/login");
    }
    let checkIfGymOwner = helpers.checkIfGymOwner(req);
    if (!checkIfGymOwner) {
      // res.status(401).redirect("/user/profile");
      return res.status(403).json({ error: 'You must be a gym owner to add a gym' });
    }
    const gymOwnerId = req.session.userId;
    const gymId = req.params.gymId;
    await validation.checkObjectId(gymId, "gymId");
    const gym = gymData.getByGymId(gymId);
    if (gym.gymOwnerId !== gymOwnerId) {
      return res.status(403).json({ error: 'You must be a gym owner to add a gym' });
    }

    validation.checkArgumentsExist(req.body.gymName, req.body.website, req.body.category, req.body.address, req.body.city, req.body.state, req.body.zip);
    validation.checkNonEmptyStrings(req.body.gymName, req.body.website, req.body.category, req.body.address, req.body.city, req.body.state, req.body.zip);
    await validation.checkValidWebsite(req.body.website);
    gym.gymName = req.body.gymName;
    gym.website = req.body.website;
    gym.category = req.body.category;
    gym.address = req.body.address;
    gym.city = req.body.city;
    gym.state = req.body.state;
    gym.zip = req.body.zip;


    await gymData.update(gymOwnerId, gymId, gymName, website, category, address, city, state, zip);
    res.status(200).redirect("/gym/manage");
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    res.status(status).json({ error: message });
  }
});

// Thumb up in gym detail page
router.route('/:gymId/like').post(async (req, res) => {
  try {
    await validation.checkObjectId(req.params.gymId);
    const gymId = req.params.gymId.toString();

    let userLoggedIn = helpers.checkIfLoggedIn(req);
    if (!userLoggedIn) {
      return res.redirect("/user/loginPage");
    }
    const userId = req.session.userId;
    const user = await userData.getByUserId(userId)
    if (!user) {
      throw [400, `ERROR: User not found`];
    }
    let userLikeList = user.likedGyms;
    let userDislikeList = user.dislikedGyms

    if (userDislikeList.includes(gymId)) {
      let indexToRemove = userDislikeList.indexOf(gymId);
      if (indexToRemove !== -1) {
        userDislikeList.splice(indexToRemove, 1);
        await gymData.updateDislikedGymsCnt(gymId, -1);
      }
    }
    if (!userLikeList.includes(gymId)) {
      userLikeList.push(gymId);
      await gymData.updateLikedGymsCnt(gymId, 1);
    } else {
      let indexToRemove = userLikeList.indexOf(gymId);
      if (indexToRemove !== -1) {
        userLikeList.splice(indexToRemove, 1);
        await gymData.updateLikedGymsCnt(gymId, -1);
      }
    }

    user.likedGyms = userLikeList;
    user.dislikedGyms = userDislikeList;

    await userData.update(userId, user);

    return res.status(200).json({ message: `Success Liked gym ${gymId}` });

  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    return res.status(status).json({ error: message });
  }
});

// Thumb down in gym detail page
router.route('/:gymId/dislike').post(async (req, res) => {
  try {
    await validation.checkObjectId(req.params.gymId);
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
    let userLikeList = user.likedGyms;
    let userDislikeList = user.dislikedGyms

    if (userLikeList.includes(gymId)) {
      let indexToRemove = userLikeList.indexOf(gymId);
      if (indexToRemove !== -1) {
        userLikeList.splice(indexToRemove, 1);
        await gymData.updateLikedGymsCnt(gymId, -1);
      }
    }
    if (!userDislikeList.includes(gymId)) {
      userDislikeList.push(gymId);
      await gymData.updateDislikedGymsCnt(gymId, 1);
    } else {
      let indexToRemove = userDislikeList.indexOf(gymId);
      if (indexToRemove !== -1) {
        userDislikeList.splice(indexToRemove, 1);
        await gymData.updateDislikedGymsCnt(gymId, -1);
      }
    }

    user.likedGyms = userLikeList;
    user.dislikedGyms = userDislikeList;

    await userData.update(userId, user);

    return res.status(200).json({ message: `Success DisLiked gym ${gymId}` });
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    res.status(status).json({ error: message });
  }
});

export default router;
