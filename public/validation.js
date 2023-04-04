// this is a helper file to do some error checking for inputs.
import moment from "moment";
import {ObjectId} from "mongodb";

function checkArgumentsExist(...args) {
  for (let arg of args) {
    if (!arg) {
      throw [400, `ERROR: All filed must present`];
    }
  }
}

function checkNonEmptyStrings(...args) {
  for (let arg of args) {
    if (typeof arg !== "string" || arg.trim().length === 0) {
      throw [400, `ERROR: Field must be a non-empty string`];
    }
  }
}

function checkValidEmail(email) {
  //The regular expression ^[^\s@]+@[^\s@]+\.[^\s@]+$ matches any string that contains an @ symbol,
  // followed by a domain name that includes at least one . character, and does not contain any whitespace characters.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)){
    throw [400, `ERROR: ${email} must be a valid email`];
  }
}

function checkValidData(date){
  if (!moment(date, 'MM/DD/YYYY', true).isValid()) {
    throw [400, `ERROR: ${date} must be a valid date string in the format MM/DD/YYYY`];
  }
  const yearInDate = new Date(date).getFullYear();
  const currentYear = new Date().getFullYear();
  if (yearInDate < 1900 || yearInDate > currentYear) {
    throw [400, `ERROR: ${date} must be between 1900 and the current year`];
  }
}

const checkObjectId = async (id) => {
  if (!id)
    throw [400, 'ERROR: ID parameter must be supplied'];
  if (typeof id !== 'string')
    throw [400, 'ERROR: ID must be a string'];
  if (id.trim().length === 0)
    throw [400, 'ERROR: ID cannot be an empty string or just spaces'];
  id = id.trim();
  if (!ObjectId.isValid(id)) {
    throw [400, "ERROR: ID is not a valid Object ID"];
  }
}

const checkValidWebsite = async (website) => {
  const emailRegex = /^https:\/\/www\..{5,}\.com$/;
  if (!emailRegex.test(website)){
    throw [400, `ERROR: ${website} must be a valid website`];
  }
}

const checkObjectIdArray = async (arr) => {
  if (!Array.isArray(arr)) {
    throw [400, "ERROR: Must be array"]
  }
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== 'string' || arr[i].trim().length === 0 || !ObjectId.isValid(arr[i])) {
      throw [400, "ERROR: The element of array must be ObjectId"]
    }
  }
}

const checkValidRating = async (rating) => {
  if (typeof rating !== 'number' || rating < 0 || rating > 5 || !Number.isInteger(rating * 10)) {
    throw [400, "ERROR: Rating must be a number between 1 and 5 with one decimal place"]
  }
}

const checkValidNonNegativeInteger = async (number) => {
  if (typeof number !== 'number' || !Number.isInteger(number) || number < 0) {
    throw [400, "ERROR: Number must be non negative integer"]
  }
}

export {checkArgumentsExist, checkValidData, checkNonEmptyStrings, checkValidEmail, checkObjectId, checkValidWebsite,
  checkObjectIdArray, checkValidNonNegativeInteger, checkValidRating}