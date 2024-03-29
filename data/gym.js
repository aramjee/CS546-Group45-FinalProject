// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link

import { ObjectId } from "mongodb";
import * as validation from '../public/js/validation.js';
import { gymCollection } from '../config/mongoCollections.js';
import { userDataFunctions } from './user.js'
import { reviewDataFunctions } from './review.js'


const create = async (
  gymName,
  website,
  category,
  gymOwnerId,
  address,
  city,
  state,
  zip
) => {
  // Validation
  validation.checkArgumentsExist(gymName, website, category, gymOwnerId, address, city, state, zip);
  validation.checkNonEmptyStrings(gymName, website, category, gymOwnerId, address, city, state, zip);
  validation.checkValidWebsite(website.trim());
  validation.checkObjectId(gymOwnerId, "gymOwnerId");
  validation.checkValidGymCategory(category.trim());
  validation.checkValidGymName(gymName.trim());
  validation.checkValidStateName(state.trim());
  validation.checkValidCityName(city.trim());
  validation.checkValidZipCode(zip.trim());
  validation.checkValidAddress(address.trim())

  const newGym = {
    gymName: gymName.trim(),
    website: website.trim(),
    category: category.trim(),
    gymOwnerId: gymOwnerId.trim(),
    address: address.trim(),
    city: city.trim(),
    state: state.trim(),
    zip: zip.trim(),
    reviews: [],
    likedGymsCnt: 0,
    dislikedGymsCnt: 0,
    rating: 0
  };

  const gymsDBConnection = await gymCollection();
  const insertInfo = await gymsDBConnection.insertOne(newGym);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw `Error: Create gym failed`;
  }
  const newId = insertInfo.insertedId.toString();
  let user = await userDataFunctions.getByUserId(gymOwnerId)
  user.gymsListForOwner.push(newId);
  await userDataFunctions.update(gymOwnerId, user)
  const gym = await getByGymId(newId);
  return gym
};

const getByGymId = async (id) => {
  //id = id.trim(); // since on line 59 and 60 id is not trimmed yet; but also inside the remove function, id should is not trimmed and pass in.
  validation.checkObjectId(id, "GymId");
  const gymsDBConnection = await gymCollection();
  const gymGet = await gymsDBConnection.findOne({ _id: ObjectId(id.trim()) });
  if (gymGet === null)
    throw [404, `ERROR: No gym exists with that id ${id.toString()}`];
  gymGet._id = gymGet._id.toString();
  return gymGet;
};

const getByGymName = async (gymName) => {
  validation.checkString(gymName);
  validation.checkValidGymName(gymName);
  const gymsDBConnection = await gymCollection();
  const gyms = await gymsDBConnection.find({ gymName: gymName }).toArray();

  gyms.forEach((gym) => {
    gym._id = gym._id.toString();
  });

  return gyms;
};

const getAll = async () => {
  const gymsDBConnection = await gymCollection();
  let gymList = await gymsDBConnection.find({}).toArray();
  gymList = gymList.map((element) => {
    element._id = element._id.toString();
    return element;
  });
  return gymList;
};


const remove = async (id, ownerId) => {
  validation.checkObjectId(id, "GymId");
  validation.checkObjectId(ownerId, "GymOwnerId");
  const gym = await getByGymId(id);
  if (gym.gymOwnerId !== ownerId) {
    throw [403, `Error: Could not delete gym with If you are not owner`];
  }
  const gymsDBConnection = await gymCollection();
  //Remove all gymId related in user collection
  await userDataFunctions.removeGymFromUsers(id);
  //Remove related reviews
  for (const reviewId of gym.reviews) {
    await reviewDataFunctions.removeReview(reviewId);
  }
  //Remove gym
  const deletionInfo = await gymsDBConnection.findOneAndDelete({
    _id: ObjectId(id.trim())
  });
  if (deletionInfo.lastErrorObject.n === 0) {
    throw [404, `Error: Could not delete gym with Id ${id}`];
  }
  return {
    "gymId": id,
    "deleted": true
  };
};

const update = async (id, gym) => {
  // Validation
  validation.checkObjectId(id, "GymId");
  // since we have so far only have the option to let user update gym's review through editing the review of the gym,
  // the gym I would pass in will have a rating. Should we check for it's existence as well?
  validation.checkArgumentsExist(gym.gymName, gym.website, gym.category, gym.address, gym.city, gym.state, gym.zip);
  validation.checkNonEmptyStrings(gym.gymName, gym.website, gym.category, gym.address, gym.city, gym.state, gym.zip);
  validation.checkValidWebsite(gym.website.trim());
  validation.checkValidNonNegativeInteger(gym.likedGymsCnt);
  validation.checkValidNonNegativeInteger(gym.dislikedGymsCnt);
  validation.checkValidGymCategory(gym.category.trim());
  validation.checkValidGymName(gym.gymName.trim());
  validation.checkValidStateName(gym.state.trim());
  validation.checkValidCityName(gym.city.trim());
  validation.checkValidZipCode(gym.zip.trim());
  validation.checkValidAddress(gym.address.trim())
  // in order to update the gym, the review will call this function
  // but need to check if this is the first review, or otherwise the gym rating is 0.
  if (gym.rating) { validation.checkValidRating(gym.rating) };
  let oldGym = await getByGymId(id)
  // Update the gym data in the database
  const gymsDBConnection = await gymCollection();
  const updateInfo = await gymsDBConnection.findOneAndUpdate(
    { _id: new ObjectId(id.trim()) },
    {
      $set: {
        gymName: gym.gymName.trim(),
        website: gym.website.trim(),
        category: gym.category.trim(),
        address: gym.address.trim(),
        city: gym.city.trim(),
        state: gym.state.trim(),
        zip: gym.zip.trim(),
        reviews: gym.reviews,
        likedGymsCnt: gym.likedGymsCnt,
        dislikedGymsCnt: gym.dislikedGymsCnt,
        rating: gym.rating
      }
    },
    { returnDocument: 'after' }
  );
  let newGym = await getByGymId(id)
  if (JSON.stringify(oldGym) === JSON.stringify(newGym)) {
    throw [400, `there's no real update, everything is the same`];
  }

  if (updateInfo.lastErrorObject.n === 0)
    throw [404, `Error: Update failed, user not found ${id}`];

  return updateInfo.value;
};

const searchByValue = async (name) => {
  validation.checkNonEmptyStrings(name.trim());

  const regex = new RegExp(name, 'i'); // Case-insensitive search
  const gymsDBConnection = await gymCollection();
  const gymsList = await gymsDBConnection.find({ gymName: { $regex: regex } }).toArray();

  // Returning a blank gym list array if no gym found instead of 404 error
  return gymsList;
};

const getByGymOwnerId = async (gymOwnerId) => {
  validation.checkObjectId(gymOwnerId, "gymOwnerId");

  const gymsDBConnection = await gymCollection();
  const gymsList = await gymsDBConnection.find({ gymOwnerId: gymOwnerId }).toArray();

  return gymsList;
};

const updateLikedGymsCnt = async (id, change) => {
  validation.checkObjectId(id);
  const gymsDBConnection = await gymCollection();
  let updateOne = await gymsDBConnection.updateOne(
    { _id: new ObjectId(id) },
    { $inc: { likedGymsCnt: change } }
  );
  if (updateOne.matchedCount === 0)
    throw [404, `Could not update likedGymsCnt in gym: ${id}`];
};

const updateDislikedGymsCnt = async (id, change) => {
  validation.checkObjectId(id);
  const gymsDBConnection = await gymCollection();
  let updateOne = await gymsDBConnection.updateOne(
    { _id: new ObjectId(id) },
    { $inc: { dislikedGymsCnt: change } }
  );
  if (updateOne.matchedCount === 0)
    throw [404, `Could not update dislikedGymsCnt in gym: ${id}`];
};


export const gymDataFunctions = { create, getAll, getByGymId, getByGymOwnerId, update, remove, searchByValue, updateLikedGymsCnt, updateDislikedGymsCnt, getByGymName }
