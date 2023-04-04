// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link

import { ObjectId } from "mongodb";
import * as validation from '../public/validation.js';
import { gymCollection } from '../config/mongoCollections.js';
import { userDataFunctions } from './user.js'


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
  await validation.checkArgumentsExist(gymName, website, category, gymOwnerId, address, city, state, zip);
  await validation.checkNonEmptyStrings(gymName, website, category, gymOwnerId, address, city, state, zip);
  // await validation.checkValidWebsite(website);

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
  id = id.trim(); // since on line 59 and 60 id is not trimmed yet; but also inside the remove function, id should is not trimmed and pass in.
  await validation.checkObjectId(id);
  const gymsDBConnection = await gymCollection();
  const gymGet = await gymsDBConnection.findOne({ _id: ObjectId(id.trim()) });
  if (gymGet === null)
    throw [404, `ERROR: No gym exists with that id ${id.toString()}`];
  gymGet._id = gymGet._id.toString();
  return gymGet;
};

// TODO: we will need 
// 1. getByCategory => list of gyms ids
// 2. getByZipCode => potential
const getAll = async () => {
  const gymsDBConnection = await gymCollection();
  let gymList = await gymsDBConnection.find({}).toArray();
  gymList = gymList.map((element) => {
    element._id = element._id.toString();
    return element;
  });
  return gymList;
};


const remove = async (id) => {
  await validation.checkObjectId(id);
  const gymsDBConnection = await gymCollection();
  const gym = await getByGymId(id);
  const userId = gym.gymOwnerId;
  const deletionInfo = await gymsDBConnection.findOneAndDelete({
    _id: ObjectId(id.trim())
  });
  let user = await userFunctions.getByUserId(userId);
  user.gymsListForOwner = user.gymsListForOwner.filter((gymId) => gymId !== id);
  await userFunctions.update(userId, user);

  if (deletionInfo.lastErrorObject.n === 0) {
    throw [404, `Could not delete gym with Id ${id}`];
  }
  return {
    "bandId": id,
    "deleted": true
  };
};

const update = async (id, gym) => {
  // Validation
  await validation.checkObjectId(id);
  // since we have so far only have the option to let user update gym's review through editing the review of the gym, 
  // the gym I would pass in will have a rating. Should we check for it's existence as well?
  await validation.checkArgumentsExist(gym.gymName, gym.website, gym.category, gym.gymOwnerId, gym.address, gym.city, gym.state, gym.zip);
  await validation.checkNonEmptyStrings(gym.gymName, gym.website, gym.category, gym.gymOwnerId, gym.address, gym.city, gym.state, gym.zip);
  // await validation.checkValidWebsite(gym.website);
  await validation.checkValidNonNegativeInteger(gym.likedGymsCnt);
  await validation.checkValidNonNegativeInteger(gym.dislikedGymsCnt);
  await validation.checkValidRating(gym.rating)

  // Update the band data in the database
  const gymsDBConnection = await gymCollection();
  const updateInfo = await gymsDBConnection.findOneAndUpdate(
    { _id: new ObjectId(id.trim()) },
    {
      $set: {
        gymName: gym.gymName,
        website: gym.website,
        category: gym.category,
        gymOwnerId: gym.gymOwnerId,
        address: gym.address,
        city: gym.city,
        state: gym.state,
        zip: gym.zip,
        reviews: gym.reviews,
        likedGymsCnt: gym.likedGymsCnt,
        dislikedGymsCnt: gym.dislikedGymsCnt,
        rating: gym.rating
      }
    },
    { returnDocument: 'after' }
  );

  if (updateInfo.lastErrorObject.n === 0)
    throw [404, `Error: Update failed, user not found ${id}`];

  return updateInfo.value;
};

export const gymDataFunctions = { create, getAll, getByGymId, update, remove }
