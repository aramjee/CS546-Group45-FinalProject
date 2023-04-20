// I tried to rename the file but accidentally remove...oops!
import { gymData, reviewData, commentData, userData } from '../../data/index.js';

function checkIfLoggedIn(req) {
    console.log(req.session);
    let userLoggedIn = false;
    if (req.session.userId === null || req.session.userId === undefined) {
        console.log('User not logged in');
    } else {
        console.log('Welcome user', req.session.userId);
        userLoggedIn = true;
    }
    return userLoggedIn;
}

async function checkIfGymOwner(req) {
    const userId = req.session.userId;
    const user = await userData.getByUserId(userId);
    let checkIfGymOwner = false;
    if (user.isGymOwner) {
        checkIfGymOwner = true;
    }
    return checkIfGymOwner;
}

export { checkIfLoggedIn, checkIfGymOwner }