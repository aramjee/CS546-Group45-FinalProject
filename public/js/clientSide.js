//import moment from "moment";

(function () {
    function checkString(string) {
        if (!(typeof string === 'string' || string instanceof String)) {
            throw new Error("All required fields must be provided");
        }

        string = string.trim().replace(/  +/g, ' '); // turns multiple spaces into just one
        if (string.length < 1) {
            throw new Error("Empty string not valid");
        }

        return string;
    }

    function checkName(name) {
        name = checkString(name);

        if (/\d/.test(name)) {
            throw new Error("Name cannot contain a number");
        }
        if (!(/[a-zA-Z]/.test(name))) {
            throw new Error("Name should contain letters");
        }
        if (name.length < 2 || name.length > 25) {
            throw new Error("First and last names should be between 2 and 25 characters long");
        }

        return name;
    }
    function checkValidGymName(gymName) {
        gymName = checkString(gymName);
        const gymNameRegex = /[a-zA-Z]/;
        
        if (gymName.length < 2) {
            throw new Error("Gym name too short");
        }
        if (!gymNameRegex.test(gymName)) {
            throw new Error("Gym name must be a valid gym name, must contain at least one letter");
        }
        return gymName;
    }

    function checkCity(name) {
        name = checkString(name);

        if (/\d/.test(name)) {
            throw new Error("City cannot contain a number");
        }
        if (!(/[a-zA-Z]/.test(name))) {
            throw new Error("City should contain letters");
        }
        if (name.length < 2 || name.length > 25) {
            throw new Error("City should be between 2 and 25 characters long");
        }

        return name;
    }

    function checkState(name) {
        name = checkString(name);

        if (!states.includes(name)) {
            throw new Error("Invalid state name, choose one of the dropdown options");
        }

        return name;
    }

    function checkCategory(name) {
        name = checkString(name);

        if (!categories.includes(name)) {
            throw new Error("Invalid category name, choose one of the dropdown options");
        }

        return name;
    }
    function checkValidAddress(address) {
        address = checkString(address);
        const addressRegex = /^(\d{1,}) [a-zA-Z0-9\s]+/;
        if (!addressRegex.test(address)) {
            throw new Error("Address must be a valid address (Addr# + StreetName), start with a number, then a space, then some character \n Example: 123 Main St");
        }
        return address;
    }

    function checkDate(date) {
        if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
            throw new Error("Date must be a valid date in the format MM/DD/YYYY");
        }
        date = date.trim();
        const yearInDate = new Date(date).getFullYear();
        const currentYear = new Date().getFullYear();
        if (yearInDate < 1900 || yearInDate > currentYear) {
            throw new Error("Date must be between 1900 and the current year");
        }
        return date;
    }

    function checkEmail(emailAddress) {
        emailAddress = checkString(emailAddress);
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(emailAddress)) {
            throw new Error("Invalid email address");
        }
        return emailAddress.toLowerCase();
    }

    function checkPassword(password) {
        if (!(typeof password === 'string' || password instanceof String)) {
            throw new Error("Please provide a password");
        }
        if (/\s/g.test(password)) {
            throw new Error("Password must not contain spaces");
        }
        //invalid password regex
        const regex = /^(.{0,7}|[^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$/
        if (regex.test(password)) {
            throw new Error("Invalid password");
        }
        return password;
    }
    function checkContent(strVal) {
        strVal = checkString(strVal);

        if (!(/[a-zA-Z]/.test(strVal))) {
            throw new Error("Content cannot only contain digits or special characters");
        }

        return strVal
    }
    function checkValidZipCode(zipCode) {
        // 5 digits
        zipCode = checkString(zipCode);
        const addressRegex = /^\d{5}$/;
        if (!addressRegex.test(zipCode)) {
            throw new Error("ZIP Code must be a valid 5-digit zip code");
        }
        return zipCode;
    }


    const signup = document.getElementById('signup-form');

    if (signup) {
        signup.addEventListener("submit", (event) => {
            let firstName = document.getElementById('firstName').value;
            let lastName = document.getElementById('lastName').value;
            let userName = document.getElementById('userName').value;
            let emailAddress = document.getElementById('email').value;
            let city = document.getElementById('city').value;
            let state = document.getElementById('state').value;
            let dateOfBirth = document.getElementById('dateOfBirth').value;
            let password = document.getElementById('password').value;
            let isGymOwner = document.getElementById("isGymOwner").value;

            //console.log(state);
            event.preventDefault();
            try {
                firstName = checkName(firstName);
                lastName = checkName(lastName);
                userName = checkString(userName);
                emailAddress = checkEmail(emailAddress);
                city = checkCity(city);
                state = checkState(state);
                dateOfBirth = checkDate(dateOfBirth);
                password = checkPassword(password);

                if (!(typeof isGymOwner === 'string' || isGymOwner instanceof String)) {
                    throw new Error("Please specify account type");
                }

                console.log("checking account type: " + isGymOwner);
                if (!(isGymOwner === "True" || isGymOwner === "")) {
                    throw new Error("Account must be 'owner' or 'user' type");
                }

                console.log("registering");
                signup.submit();
            } catch (e) {
                //console.log("failed to register");
                document.getElementById('error').innerText = "(400) " + e;
            }
        });
    }

    const login = document.getElementById('login-form');

    if (login) {
        login.addEventListener("submit", (event) => {
            let emailAddress = document.getElementById('email').value;
            let password = document.getElementById('password').value;

            event.preventDefault();
            try {
                emailAddress = checkEmail(emailAddress);
                password = checkPassword(password);

                login.submit();
            } catch (e) {
                document.getElementById('error').innerText = "(400) " + e;
            }
        });
    }

    const updateProfile = document.getElementById('update-form');

    if (updateProfile) {
        updateProfile.addEventListener("submit", (event) => {
            let firstName = document.getElementById('firstName').value;
            let lastName = document.getElementById('lastName').value;
            let userName = document.getElementById('userName').value;
            let city = document.getElementById('city').value;
            let state = document.getElementById('state').value;
            let dateOfBirth = document.getElementById('dateOfBirth').value;
            let password = document.getElementById('password').value;
            let confirm = document.getElementById('confirm').value;

            //console.log(state);
            //console.log
            event.preventDefault();
            try {
                firstName = checkName(firstName);
                lastName = checkName(lastName);
                userName = checkString(userName);
                city = checkCity(city);
                state = checkState(state);
                dateOfBirth = checkDate(dateOfBirth);
                password = checkPassword(password);
                confirm = checkString(confirm);

                if (password != confirm) {
                    throw new Error("Passwords must match");
                }

                updateProfile.submit();
            } catch (e) {
                document.getElementById('error').innerText = "(400) " + e;
            }
        });
    }

    const gym = document.getElementById('gym-form');

    if (gym) {
        gym.addEventListener("submit", (event) => {
            let gymName = document.getElementById('gymName').value;
            let website = document.getElementById('website').value;
            let category = document.getElementById('category').value;
            let address = document.getElementById('address').value;
            let city = document.getElementById('city').value;
            let state = document.getElementById('state').value;
            let zip = document.getElementById('zip').value;

            event.preventDefault();
            try {
                gymName = checkValidGymName(gymName)

                website = checkString(website);

                const websiteRegex = /^https:\/\/www\..{5,}\.com$/;
                if (!websiteRegex.test(website)) {
                    throw new Error("Website must start with 'https://www.' and end in a '.com', and have at least 5 characters in-between the 'https://www.' and '.com' \n Example: https://www.xxxxx.com");
                }

                // website = checkName(website);
                category = checkCategory(category);
                address = checkValidAddress(address)
                city = checkCity(city);
                state = checkState(state);
                zip = checkValidZipCode(zip);
                gym.submit();
            } catch (e) {
                //console.log("failed to register");
                document.getElementById('error').innerText = "(400) " + e;
            }
        });
    }

    const updateGym = document.getElementById('editGym-form');

    if (updateGym) {
        updateGym.addEventListener("submit", (event) => {
            let gymName = document.getElementById('gymName').value;
            let website = document.getElementById('website').value;
            let category = document.getElementById('category').value;
            let address = document.getElementById('address').value;
            let city = document.getElementById('city').value;
            let state = document.getElementById('state').value;
            let zip = document.getElementById('zip').value;

            event.preventDefault();
            try {
                gymName = checkString(gymName);
                gymName = checkValidGymName(gymName)
                if (!(/\d/.test(gymName) || /[a-zA-Z]/.test(gymName))) {
                    throw new Error("Gym name must contain alphanumeric characters");
                }
                if (gymName.length < 2 || gymName.length > 25) {
                    throw new Error("Gym name should be between 2 and 25 characters long");
                }

                website = checkString(website);

                const websiteRegex = /^https:\/\/www\..{5,}\.com$/;
                if (!websiteRegex.test(website)) {
                    throw new Error("Website must be in the form 'https://www.xxxxx.com'");
                }

                // website = checkName(website);
                category = checkCategory(category);
                address = checkValidAddress(address)
                city = checkCity(city);
                state = checkState(state);
                zip = checkString(zip);
                zip = checkValidZipCode(zip);
                updateGym.submit();
            } catch (e) {
                //console.log("failed to register");
                document.getElementById('error').innerText = "(400) " + e;
            }
        });
    }

    const newReview = document.getElementById('newReview-form');

    if (newReview) {
        newReview.addEventListener("submit", (event) => {
            let rating = document.getElementById('rating').value;
            let content = document.getElementById('content').value;

            event.preventDefault();
            try {
                rating = parseFloat(rating)
                //rating = checkString(rating);
                if (Number.isNaN(rating)) {
                    throw new Error("Please provide a valid rating number");
                }
                if (rating < 1 || rating > 5 || !Number.isInteger(rating * 10)) {
                    throw new Error("Rating must be between 1 and 5 up to one decimal place");
                }
                content = checkContent(content)
                newReview.submit();
            } catch (e) {
                document.getElementById('error').innerText = "(400) " + e;
            }
        });
    }

    const updateReviewRating = document.getElementById('updateReviewRating-form');

    if (updateReviewRating) {
        updateReviewRating.addEventListener("submit", (event) => {
            let rating = document.getElementById('rating').value;

            event.preventDefault();
            try {
                rating = parseFloat(rating)
                //rating = checkString(rating);
                if (Number.isNaN(rating)) {
                    throw new Error("Please provide a valid rating number");
                }
                if (rating < 1 || rating > 5 || !Number.isInteger(rating * 10)) {
                    throw new Error("Rating must be between 1 and 5 up to one decimal place");
                }

                updateReviewRating.submit();
            } catch (e) {
                document.getElementById('error').innerText = "(400) " + e;
            }
        });
    }

    const updateReviewContent = document.getElementById('updateReviewContent-form');

    if (updateReviewContent) {
        updateReviewContent.addEventListener("submit", (event) => {
            let content = document.getElementById('content').value;

            event.preventDefault();
            try {
                content = checkContent(content)

                updateReviewContent.submit();
            } catch (e) {
                document.getElementById('error').innerText = "(400) " + e;
            }
        });
    }



    const newComment = document.getElementById('newComment-form');

    if (newComment) {
        newComment.addEventListener("submit", (event) => {
            let content = document.getElementById('content').value;

            event.preventDefault();
            try {
                content = checkContent(content)

                newComment.submit();
            } catch (e) {
                document.getElementById('error').innerText = "(400) " + e;
            }
        });
    }

    const updateComment = document.getElementById('updateComment-form');

    if (updateComment) {
        updateComment.addEventListener("submit", (event) => {
            let content = document.getElementById('content').value;

            event.preventDefault();
            try {
                content = checkContent(content)

                updateComment.submit();
            } catch (e) {
                document.getElementById('error').innerText = "(400) " + e;
            }
        });
    }

})();


