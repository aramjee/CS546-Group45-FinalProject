// CS546 group 45 final project
// team members:Amit Ramjee, Chuqing Ke, Gabriel Souza, Xinxuan Lyu
// placeholder: API GoogleDoc link

import {ObjectId} from "mongodb";
import * as validation from '../public/validation.js';
import {userCollection} from '../config/mongoCollections.js';

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
  await validation.checkArgumentsExist(firstName, lastName, userName, email, city, state, dateOfBirth, hashedPassword);
  await validation.checkNonEmptyStrings(firstName, lastName, userName, email, city, state, hashedPassword);
  await validation.checkValidEmail(email);
  await validation.checkValidData(dateOfBirth);

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
  const userExists = await usersDBConnection.findOne({ email: lowerCaseEmail});
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
  await validation.checkObjectId(id);
  const usersDBConnection = await userCollection();
  const userGet = await usersDBConnection.findOne({_id: ObjectId(id.trim())});
  if (userGet === null)
    throw [404, `ERROR: No user exists with that id ${id.toString()}`];
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
  await validation.checkObjectId(id);
  const usersDBConnection = await userCollection();
  const deletionInfo = await usersDBConnection.findOneAndDelete({
    _id: ObjectId(id.trim())
  });

  if (deletionInfo.lastErrorObject.n === 0) {
    throw [404, `Could not delete name with Id ${id}`];
  }
  return {
    "bandId": id,
    "deleted": true
  };
};

const update = async (
  id,
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
  await validation.checkObjectId(id);
  await validation.checkArgumentsExist(firstName, lastName, userName, email, city, state, dateOfBirth, isGymOwner, hashedPassword);
  await validation.checkNonEmptyStrings(firstName, lastName, userName, email, city, state, hashedPassword);
  await validation.checkValidEmail(email);
  await validation.checkValidData(dateOfBirth);

  // Update the band data in the database
  const usersDBConnection = await userCollection();
  const updateInfo = await usersDBConnection.findOneAndUpdate(
    {_id: new ObjectId(id.trim())},
    {$set: {firstName, lastName, userName, email, city, state, dateOfBirth, isGymOwner, hashedPassword}},
    {returnDocument: 'after'}
  );

  if (updateInfo.lastErrorObject.n === 0)
    throw [404, `Error: Update failed, user not found ${id}`];

  return updateInfo.value;
};

export {create, getAll, getByUserId, update, remove}
