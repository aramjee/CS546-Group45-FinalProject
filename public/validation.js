// this is a helper file to do some error checking for inputs.
import moment from "moment";
import {ObjectId} from "mongodb";

function checkArgumentsExist(...args) {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const argName = Object.keys({arg})[0]; // Get the name of the argument

    if (!arg) {
      throw [400, `ERROR: ${argName} must be a non-empty string`];
    }
  }
}

function checkNonEmptyStrings(...args) {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const argName = Object.keys({arg})[0]; // Get the name of the argument

    if (typeof arg !== "string" || arg.trim().length === 0) {
      throw [400, `ERROR: ${argName} must be a non-empty string`];
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


export {checkArgumentsExist, checkValidData, checkNonEmptyStrings, checkValidEmail, checkObjectId}