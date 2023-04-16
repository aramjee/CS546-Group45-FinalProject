// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link

import { ObjectId } from "mongodb";
import * as validation from '../public/js/validation.js';
import { userCollection } from '../config/mongoCollections.js';

const create = async (
  firstName,
  lastName,
  userName,
  email,
  city,
  state,
  dateOfBirth,
  isGymOwner,
  hashedPassword
) => {
  // Validation
  validation.checkArgumentsExist(firstName, lastName, userName, email, city, state, dateOfBirth, hashedPassword);
  validation.checkNonEmptyStrings(firstName, lastName, userName, email, city, state, hashedPassword);
  await validation.checkValidEmail(email);
  await validation.checkValidDate(dateOfBirth);

  const lowerCaseEmail = email.toLowerCase();

  const newUser = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    userName: userName.trim(),
    email: lowerCaseEmail.trim(),
    city: city.trim(),
    state: state.trim(),
    dateOfBirth: dateOfBirth,
    isGymOwner: Boolean(isGymOwner),
    hashedPassword: hashedPassword.trim(),
    reviews: [],
    comments: [],
    likedGyms: [],
    dislikedGyms: [],
    favGymList: [],
    gymsListForOwner: []
  };

  const usersDBConnection = await userCollection();

  //Check for duplicated email
  const userExists = await getByUserEmail(lowerCaseEmail);
  if (userExists) {
    throw [404, `Email already in use`];
  }

  const insertInfo = await usersDBConnection.insertOne(newUser);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw `Error: Create user failed`;
  }

  const newId = insertInfo.insertedId.toString();

  const user = await getByUserId(newId);
  return user
};

const getByUserId = async (id) => {
  await validation.checkObjectId(id, "UserId");
  const usersDBConnection = await userCollection();
  const userGet = await usersDBConnection.findOne({ _id: ObjectId(id.trim()) });
  if (userGet === null)
    throw [404, `ERROR: No user exists with that id ${id.toString()}`];
  userGet._id = userGet._id.toString();
  return userGet;
};

const getByUserEmail = async (email) => {
  await validation.checkValidEmail(email);
  const usersDBConnection = await userCollection();
  const userGet = await usersDBConnection.findOne({ email: email });
  if (userGet === null) {
    return null;
  }
  userGet._id = userGet._id.toString();
  return userGet;
};


const getAll = async () => {
  const usersDBConnection = await userCollection();
  let userList = await usersDBConnection.find({}).toArray();
  userList = userList.map((element) => {
    element._id = element._id.toString();
    return element;
  });
  return userList;
};


const remove = async (id) => {
  await validation.checkObjectId(id, "UserId");
  const usersDBConnection = await userCollection();
  const deletionInfo = await usersDBConnection.findOneAndDelete({
    _id: ObjectId(id.trim())
  });

  if (deletionInfo.lastErrorObject.n === 0) {
    throw [404, `Could not delete name with Id ${id}`];
  }
  return {
    "userId": id,
    "deleted": true
  };
};

const update = async (id, user) => {
  // Validation
  await validation.checkObjectId(id, "UserId");
  validation.checkArgumentsExist(user.firstName, user.lastName, user.userName, user.email, user.city, user.state,
    user.dateOfBirth, user.hashedPassword, user.reviews, user.comments, user.likedGyms, user.dislikedGyms,
    user.favGymList, user.gymsListForOwner);
  validation.checkNonEmptyStrings(user.firstName, user.lastName, user.userName, user.email, user.city, user.state, user.hashedPassword);
  await validation.checkValidEmail(user.email);
  await validation.checkValidDate(user.dateOfBirth);
  await validation.checkObjectIdArray(user.reviews);
  await validation.checkObjectIdArray(user.comments);
  await validation.checkObjectIdArray(user.likedGyms);
  await validation.checkObjectIdArray(user.dislikedGyms);
  await validation.checkObjectIdArray(user.favGymList);
  await validation.checkObjectIdArray(user.gymsListForOwner);

  // Update the user data in the database
  const usersDBConnection = await userCollection();
  const updateInfo = await usersDBConnection.findOneAndUpdate(
    { _id: new ObjectId(id.trim()) },
    {
      $set: {
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        email: user.email,
        city: user.city,
        state: user.state,
        dateOfBirth: user.dateOfBirth,
        isGymOwner: user.isGymOwner,
        hashedPassword: user.hashedPassword,
        reviews: user.reviews,
        comments: user.comments,
        likedGyms: user.likedGyms,
        dislikedGyms: user.dislikedGyms,
        favGymList: user.favGymList,
        gymsListForOwner: user.gymsListForOwner
      }
    },
    { returnDocument: 'after' }
  );

  if (updateInfo.lastErrorObject.n === 0)
    throw [404, `Error: Update failed, user not found ${id}`];

  return updateInfo.value;
};

const removeGymFromUsers = async (gymId) => {
  await validation.checkObjectId(gymId, "gymId");


  const usersDBConnection = await userCollection();
  await usersDBConnection.updateMany(
    { $or: [{ likedGyms: gymId }, { dislikedGyms: gymId }, { favGymList: gymId }, { gymsListForOwner: gymId }] },
    {
      $pull: {
        likedGyms: gymId,
        dislikedGyms: gymId,
        favGymList: gymId,
        gymsListForOwner: gymId,
      },
    }
  );
};

export const userDataFunctions = { create, getAll, getByUserId, getByUserEmail, update, remove, removeGymFromUsers }
