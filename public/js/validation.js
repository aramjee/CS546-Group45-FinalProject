// this is a helper file to do some error checking for inputs.
import moment from "moment";
import { ObjectId } from "mongodb";
const states = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];
const gymTypes = ["Membership Gym", "24 hour access gym", "CrossFit", "Boot Camps", "Training gyms"];

function checkArgumentsExist(...args) {
  //console.log(args.length);
  for (let arg of args) {
    //console.log(arg);
    if (arg == undefined || arg == null) {
      //console.log(arg);
      throw [400, `ERROR: All fields must be present`];
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
function checkString(s) {
  if (typeof s !== "string" || s.trim().length === 0) {
    throw [400, `ERROR: Field must be a non-empty string`];
  }
  s = s.trim();
  return s
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
  if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
    throw [400, `ERROR: ${date} must be a valid date string in the format YYYY-MM-DD`];
  }
  date = date.trim();
  const yearInDate = new Date(date).getFullYear();
  const currentYear = new Date().getFullYear();
  if (yearInDate < 1900 || yearInDate > currentYear) {
    throw [400, `ERROR: ${date} must be between 1900 and the current year`];
  }
  return date;
}

const checkObjectId = (id, idName) => {
  // idName is included for debugging where the id went wrong.
  if (!id)
    throw [400, `ERROR: ${idName} parameter must be supplied`];
  if (typeof id !== 'string')
    throw [400, `ERROR: ${idName} must be a string`];
  if (id.trim().length === 0)
    throw [400, `ERROR: ${idName} cannot be an empty string or just spaces`];
  id = id.trim();
  if (!ObjectId.isValid(id)) {
    console.log(id);
    throw [400, `ERROR: ${idName} is not a valid Object ID`];
  }
  return id;
}


const checkValidWebsite = (website) => {
  const emailRegex = /^https:\/\/www\..{5,}\.com$/;
  if (!emailRegex.test(website)) {
    throw [400, `ERROR: ${website} must be a valid website`];
  }
  website = website.trim();
  return website;
}

const checkObjectIdArray = (arr) => {
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

const checkValidRating = (rating) => {
  if (typeof rating !== 'number' || rating < 0 || rating > 5 || !Number.isInteger(rating * 10)) {
    throw [400, "ERROR: Rating must be a number between 1 and 5 with one decimal place"]
  }
  return rating;
}

const checkValidNonNegativeInteger = (number) => {
  if (typeof number !== 'number' || !Number.isInteger(number) || number < 0) {
    throw [400, "ERROR: Number must be non negative integer"]
  }
  return number;
}

const checkValidPassword = (password) => {
  let checkValidPassword = true;
  if (typeof password !== 'string') {
    checkValidPassword = false;
  }
  if (password.length < 8) {
    checkValidPassword = false;
  }
  // Check if password contains at least one uppercase character
  if (!/[A-Z]/.test(password)) {
    checkValidPassword = false;
  }
  // Check if password contains at least one number
  if (!/\d/.test(password)) {
    checkValidPassword = false;
  }
  // Check if password contains at least one special character
  if (!/[\W]/.test(password)) {
    checkValidPassword = false;
  }
  if (!checkValidPassword) {
    throw [400, "ERROR: Password must be a valid string and should be a minimum of 8 characters long. at least one uppercase character, there has to be at least one number and there has to be at least one special character"]
  }
  return password;
}

const checkValidGymCategory = (category) => {
  category = category.trim()
  if (!gymTypes.includes(category)) {
    throw [400, "ERROR: Gym types must be in following options: Membership Gym, 24 hour access gym, CrossFit, Boot Camps, Training gyms"];
  }
  return category;
}

const checkValidGymName = (gymName) => {
  const gymNameRegex = /[a-zA-Z]+/;
  if (!gymNameRegex.test(gymName)) {
    throw [400, `ERROR: ${gymName} must be a valid gym name, must contain at least one letter`];
  }
  return gymName;
}
const checkValidStateName = (stateName) => {
  if (!states.includes(stateName)) {
    throw [400, `ERROR: ${stateName} must be a valid US state name`];
  }
  return stateName;
}
const checkValidCityName = (cityName) => {
  //letters, spaces, and hyphens allowed, at least one letter
  const cityNameRegex = /^(?=.*[a-zA-Z])[a-zA-Z\s\-]+$/;
  if (!cityNameRegex.test(cityName)) {
    throw [400, `ERROR: ${cityName} must be a valid city name, must contain at least one letter`];
  }
  return cityName;
}
const checkValidAddress = (address) => {
  const addressRegex = /^(\d{1,}) [a-zA-Z0-9\s]+/;
  if (!addressRegex.test(address)) {
    throw [400, `ERROR: ${address} must be a valid address (Addr# + StreetName)`];
  }
  return address;
}

const checkValidZipCode = (zipCode) => {
  // 5 digits
  const addressRegex = /^\d{5}$/;
  if (!addressRegex.test(zipCode)) {
    throw [400, `ERROR: ${zipCode} must be a valid zipCode(5 digits)`];
  }
  return zipCode;
}
const checkContent = (strVal) => {
  if (!strVal) throw `Error: You must supply a content!`;
  if (typeof strVal !== 'string') throw `Error: contentmust be a string!`;
  strVal = strVal.trim();
  if (strVal.length === 0)
    throw [400, `Error: content cannot be an empty string or string with just spaces`];
  if (!isNaN(strVal))
    throw [400, `Error: content is not a valid value for content as it only contains digits`];
  return strVal;
}
export {
  checkArgumentsExist, checkValidDate, checkNonEmptyStrings, checkValidEmail, checkObjectId, checkValidWebsite, checkContent,
  checkObjectIdArray, checkValidNonNegativeInteger, checkValidRating, checkValidPassword, checkString, checkValidGymCategory,
  checkValidCityName, checkValidAddress, checkValidStateName, checkValidGymName, checkValidZipCode
}