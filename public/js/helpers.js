import { userData } from '../../data/index.js';

const helpers = {
    checkIfLoggedIn: (req) => {
        let userLoggedIn = false;
        if (req.session.userId === null || req.session.userId === undefined) {
            console.log('User not logged in');
        } else {
            console.log('Welcome user', req.session.userId);
            userLoggedIn = true;
        }
        return userLoggedIn;
    },
    checkIfGymOwner: async (req) => {
        const userId = req.session.userId;
        const user = await userData.getByUserId(userId);
        let checkIfGymOwner = false;
        if (user.isGymOwner) {
            checkIfGymOwner = true;
        }
        return checkIfGymOwner;
    }
}

export default helpers;