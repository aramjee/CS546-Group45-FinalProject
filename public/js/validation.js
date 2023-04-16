// this is a helper file to do some error checking for inputs.
import moment from "moment";
import { ObjectId } from "mongodb";

function checkArgumentsExist(...args) {
  //console.log('checkAr')
  for (let arg of args) {
    //console.log(arg)
    if (!arg) {
      throw [400, `ERROR: All filed must present`];
    }
    //arg = arg.trim();
  }
  //console.log('done with checkArgumentsExist')
  return args;
}

function checkNonEmptyStrings(...args) {
  for (let arg of args) {
    if (typeof arg !== "string" || arg.trim().length === 0) {
      throw [400, `ERROR: Field must be a non-empty string`];
    }
    arg = arg.trim();
  }
  return args;
}

function checkValidEmail(email) {
  //The regular expression ^[^\s@]+@[^\s@]+\.[^\s@]+$ matches any string that contains an @ symbol,
  // followed by a domain name that includes at least one . character, and does not contain any whitespace characters.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw [400, `ERROR: ${email} must be a valid email`];
  }
  return email;
}

function checkValidDate(date) {
  if (!moment(date, 'MM/DD/YYYY', true).isValid()) {
    throw [400, `ERROR: ${date} must be a valid date string in the format MM/DD/YYYY`];
  }
  date = date.trim();
  const yearInDate = new Date(date).getFullYear();
  const currentYear = new Date().getFullYear();
  if (yearInDate < 1900 || yearInDate > currentYear) {
    throw [400, `ERROR: ${date} must be between 1900 and the current year`];
  }
  return date;
}

const checkObjectId = async (id, idName) => {
  // idName is included for debugging where the id went wrong.
  if (!id)
    throw [400, `ERROR: ${idName} parameter must be supplied`];
  if (typeof id !== 'string')
    throw [400, `ERROR: ${idName} must be a string`];
  if (id.trim().length === 0)
    throw [400, `ERROR: ${idName} cannot be an empty string or just spaces`];
  id = id.trim();
  if (!ObjectId.isValid(id)) {
    throw [400, `ERROR: ${idName} is not a valid Object ID`];
  }
  return id;
}


const checkValidWebsite = async (website) => {
  const emailRegex = /^https:\/\/www\..{5,}\.com$/;
  if (!emailRegex.test(website)) {
    throw [400, `ERROR: ${website} must be a valid website`];
  }
  website = website.trim();
  return website;
}

const checkObjectIdArray = async (arr) => {
  if (!Array.isArray(arr)) {
    throw [400, "ERROR: Must be array"]
  }
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== 'string' || arr[i].trim().length === 0 || !ObjectId.isValid(arr[i])) {
      throw [400, "ERROR: The element of array must be ObjectId"]
    }
    arr[i] = arr[i].trim();
  }
  return arr;
}

const checkValidRating = async (rating) => {
  if (typeof rating !== 'number' || rating < 0 || rating > 5 || !Number.isInteger(rating * 10)) {
    throw [400, "ERROR: Rating must be a number between 1 and 5 with one decimal place"]
  }
  return rating;
}

const checkValidNonNegativeInteger = async (number) => {
  if (typeof number !== 'number' || !Number.isInteger(number) || number < 0) {
    throw [400, "ERROR: Number must be non negative integer"]
  }
  return number;
}

export {
  checkArgumentsExist, checkValidDate, checkNonEmptyStrings, checkValidEmail, checkObjectId, checkValidWebsite,
  checkObjectIdArray, checkValidNonNegativeInteger, checkValidRating
}