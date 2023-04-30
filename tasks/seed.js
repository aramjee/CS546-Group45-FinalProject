//seed file

import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import { userData as users, gymData as gyms, reviewData as reviews, commentData as comments, gymData } from '../data/index.js';
const db = await dbConnection();
await db.dropDatabase();




console.log("By running the seed file, we will add the following")
console.log("two gymOwners who each have two gyms,")
console.log("another ten normal users that have reviews/comments")

let user1 = undefined;
let user2 = undefined;
let user3 = undefined;
let user4 = undefined;
let user5 = undefined;
let user6 = undefined;
let user7 = undefined;
let user8 = undefined;
let user9 = undefined;
let user10 = undefined;

let gymAA = undefined;
let gymAB = undefined;
let gymOwnerA = undefined;
let gymBA = undefined;
let gymBB = undefined;
let gymOwnerB = undefined;



console.log("This is normal user creation")
try {
    user1 = await users.create(
        "John",
        "Doe",
        "johndoe",
        "johndoe@example.com",
        "New York",
        "NY",
        "1990-01-01",
        0,
        "P@ssw0rd"
    );
    console.log('user1 has been created');
} catch (e) {
    console.log(e);
}
let user1_id = user1._id.toString();

try {
    user2 = await users.create(
        "Jane",
        "Smith",
        "jsmith",
        "janesmith@example.com",
        "San Francisco",
        "CA",
        "1991-02-02",
        0,
        "S!mP13r5"
    );
    console.log('user2 has been created');
} catch (e) {
    console.log(e);
}
let user2_id = user2._id.toString();

try {
    user3 = await users.create(
        "Mary",
        "Jones",
        "mjones",
        "maryjones@example.com",
        "Chicago",
        "IL",
        "1992-03-03",
        0,
        "M@ry!sP@ssw0rd"
    );
    console.log('user3 has been created');
} catch (e) {
    console.log(e);
}
let user3_id = user3._id.toString();

try {
    user4 = await users.create(
        "Peter",
        "Brown",
        "pbrown",
        "peterbrown@example.com",
        "Chicago",
        "IL",
        "1992-03-03",
        0,
        "M@ry!sP@ssw0rd"
    );
    console.log('user4 has been created');
} catch (e) {
    console.log(e);
}
let user4_id = user4._id.toString();

try {
    user5 = await users.create(
        "David",
        "Green",
        "dgreen",
        "davidgreen@example.com",
        "Seattle",
        "WA",
        "1994-05-05",
        0,
        "D@v1d5G!r33nP@ssw0rd"
    );
    console.log('user5 has been created');
} catch (e) {
    console.log(e);
}
let user5_id = user5._id.toString();

try {
    user6 = await users.create(
        "Susan",
        "White",
        "swhite",
        "susanwhite@example.com",
        "Denver",
        "CO",
        "1995-06-06",
        0,
        "Su54nW!t3P@ssw0rd"
    );
    console.log('user6 has been created');
} catch (e) {
    console.log(e);
}
let user6_id = user6._id.toString();

try {
    user7 = await users.create(
        "Michael",
        "Black",
        "mblack",
        "michaelblack@example.com",
        "Atlanta",
        "GA",
        "1996-07-07",
        0,
        "M!cha3l5B!ackP@ssw0rd"
    );
    console.log('user7 has been created');
} catch (e) {
    console.log(e);
}
let user7_id = user7._id.toString();

try {
    user8 = await users.create(
        "Sarah",
        "Red",
        "sred",
        "sarahred@example.com",
        "Miami",
        "FL",
        "1997-08-08",
        0,
        "S@r4h5R3dP@ssw0rd"
    );
    console.log('user8 has been created');
} catch (e) {
    console.log(e);
}
let user8_id = user8._id.toString();
try {
    user9 = await users.create(
        "Emily",
        "Blue",
        "eblue",
        "emilyblue@example.com",
        "Los Angeles",
        "CA",
        "1998-09-09",
        0,
        "Em1ly5Bl!ueP@ssw0rd"
    );
    console.log('user9 has been created');
} catch (e) {
    console.log(e);
}
let user9_id = user9._id.toString();

try {
    user10 = await users.create(
        "Chloe",
        "Ke",
        "cke",
        "cke1@stevens.com",
        "New York",
        "NY",
        "1997-09-23",
        0,
        "Cke1@stevens.edu"
    );
    console.log('user10 has been created');
} catch (e) {
    console.log(e);
}
let user10_id = user10._id.toString();

console.log("----------------------------------------------------------------------")
console.log("----------------------------------------------------------------------")
console.log("Let's create some gymOwners and gyms!")
try {
    gymOwnerA = await users.create(
        "Jane",
        "Foster",
        "janefoster",
        "janefoster@stevens.edu",
        "NY",
        "NY",
        "2000-01-01",
        1,
        "JaneFoster@123"
    );
    console.log('gymOwnerA has been created');
} catch (e) {
    console.log(e);
}
let gymOwnerA_id = gymOwnerA._id.toString();

try {
    gymAA = await gyms.create(
        "Planet Fitness",
        "https://www.planetfitness.com",
        "gym",
        gymOwnerA_id,
        "101 Washington St",
        "Hoboken",
        "NJ",
        "07030"
    )
    console.log('gymAA has been created');
} catch (e) {
    console.log(e);
}
let gymAA_id = gymAA._id.toString();

try {
    gymAB = await gyms.create(
        "Blink Fitness",
        "https://www.blinkfitness.com",
        "gym",
        gymOwnerA_id,
        "140 Washington St",
        "Hoboken",
        "NJ",
        "07030"
    )
    console.log('gymAB has been created');
} catch (e) {
    console.log(e);
}

let gymAB_id = gymAB._id.toString();


try {
    gymOwnerB = await users.create(
        "Chloe",
        "Ke",
        "ck2973",
        "ck2973@columbia.edu",
        "New York",
        "NY",
        "1997-09-23",
        1,
        "Cke1@stevens.edu"
    );
    console.log('gymOwnerB has been created');
} catch (e) {
    console.log(e);
}
let gymOwnerB_id = gymOwnerB._id.toString();

try {
    gymBA = await gyms.create(
        "Crunch Fitness",
        "https://www.crunch.com",
        "gym",
        gymOwnerB_id,
        "101 Hudson St",
        "Hoboken",
        "NJ",
        "07030"
    )
    console.log('gymBA has been created');
} catch (e) {
    console.log(e);
}
let gymBA_id = gymBA._id.toString();

try {
    gymBB = await gyms.create(
        "Retro Fitness",
        "https://www.retrofitness.com",
        "gym",
        gymOwnerB_id,
        "110 Sinatra Dr",
        "Hoboken",
        "NJ",
        "07030"
    )
    console.log('gymBB has been created');
} catch (e) {
    console.log(e);
}
let gymBB_id = gymBB._id.toString();

console.log("----------------------------------------------------------------------")
console.log("----------------------------------------------------------------------")
console.log("Let's create some reviews!")
let review1AA = undefined;
let review1AB = undefined;
let review2AA = undefined;
let review2AB = undefined;
let review3AA = undefined;
let review3AB = undefined;
let review4AA = undefined;
let review4AB = undefined;
let review5AA = undefined;
let review5AB = undefined;
console.log("for user1 to user5, they will each leave one review for gymAA, gymAB")
try {
    review1AA = await reviews.create(
        gymAA_id,
        user1_id,
        "2023-01-04",
        "Great gym!",
        5
    )
    console.log("reivew of user1 for gymAA is created!")
} catch (e) {
    console.log(e);
}
let review1AA_id = await review1AA._id.toString();

try {
    review1AB = await reviews.create(
        gymAB_id,
        user1_id,
        "2023-01-05",
        "Friendly and helpful staff",
        4
    )
    console.log("review of user1 for gymAB is created!")
} catch (e) {
    console.log(e);
}
let review1AB_id = review1AB._id.toString();

try {
    review2AA = await reviews.create(
        gymAA_id,
        user2_id,
        "2023-01-06",
        "Clean and well-maintained facilities",
        5
    )
    console.log("reivew of user2 for gymAA is created!")
} catch (e) {
    console.log(e);
}
let review2AA_id = await review2AA._id.toString();

try {
    review2AB = await reviews.create(
        gymAB_id,
        user2_id,
        "2023-01-07",
        "A variety of cardio and strength-training equipment",
        4
    )
    console.log("review of user2 for gymAB is created!")
} catch (e) {
    console.log(e);
}
let review2AB_id = review2AB._id.toString();

try {
    review3AA = await reviews.create(
        gymAA_id,
        user3_id,
        "2023-01-08",
        "A variety of group fitness classes",
        5
    )
    console.log("reivew of user3 for gymAA is created!")
} catch (e) {
    console.log(e);
}
let review3AA_id = await review3AA._id.toString();

try {
    review3AB = await reviews.create(
        gymAB_id,
        user3_id,
        "2023-01-09",
        "A kid-friendly environment",
        4
    )
    console.log("review of user3 for gymAB is created!")
} catch (e) {
    console.log(e);
}
let review3AB_id = review3AB._id.toString();


try {
    review4AA = await reviews.create(
        gymAA_id,
        user4_id,
        "2023-01-10",
        "The gym can be crowded during peak hours",
        2
    )
    console.log("reivew of user4 for gymAA is created!")
} catch (e) {
    console.log(e);
}
let review4AA_id = await review4AA._id.toString();

try {
    review4AB = await reviews.create(
        gymAB_id,
        user4_id,
        "2023-01-11",
        "The music can be loud at times",
        1
    )
    console.log("review of user4 for gymAB is created!")
} catch (e) {
    console.log(e);
}
let review4AB_id = review4AB._id.toString();



try {
    review5AA = await reviews.create(
        gymAA_id,
        user5_id,
        "2023-01-12",
        "The free weights section is small",
        1
    )
    console.log("reivew of user5 for gymAA is created!")
} catch (e) {
    console.log(e);
}
let review5AA_id = await review5AA._id.toString();

try {
    review5AB = await reviews.create(
        gymAB_id,
        user5_id,
        "2023-01-13",
        "Very affordable membership prices",
        5
    )
    console.log("review of user5 for gymAB is created!")
} catch (e) {
    console.log(e);
}
let review5AB_id = review5AB._id.toString();

console.log("for user6 to user10, they will each leave one review for gymBA, gymBB")
let review6BA = undefined;
let review6BB = undefined;
let review7BA = undefined;
let review7BB = undefined;
let review8BA = undefined;
let review8BB = undefined;
let review9BA = undefined;
let review9BB = undefined;
let review10BA = undefined;
let review10BB = undefined;

try {
    review6BA = await reviews.create(
        gymBA_id,
        user6_id,
        "2023-01-14",
        "24/7 access",
        5
    )
    console.log("reivew of user6 for gymBA is created!")
} catch (e) {
    console.log(e);
}
let review6BA_id = await review6BA._id.toString();

try {
    review6BB = await reviews.create(
        gymBB_id,
        user6_id,
        "2023-01-15",
        "A variety of cardio and strength-training equipment",
        4
    )
    console.log("review of user6 for gymBB is created!")
} catch (e) {
    console.log(e);
}
let review6BB_id = review6BB._id.toString();
try {
    review7BA = await reviews.create(
        gymBA_id,
        user7_id,
        "2023-01-16",
        "A clean and well-maintained facility",
        5
    )
    console.log("reivew of user7 for gymBA is created!")
} catch (e) {
    console.log(e);
}
let review7BA_id = await review7BA._id.toString();

try {
    review7BB = await reviews.create(
        gymBB_id,
        user7_id,
        "2023-01-17",
        "A fun and motivating atmosphere",
        4
    )
    console.log("review of user7 for gymBB is created!")
} catch (e) {
    console.log(e);
}
let review7BB_id = review7BB._id.toString();

try {
    review8BA = await reviews.create(
        gymBA_id,
        user8_id,
        "2023-01-18",
        "The membership prices are higher than some other gyms",
        1
    )
    console.log("reivew of user8 for gymBA is created!")
} catch (e) {
    console.log(e);
}
let review8BA_id = await review8BA._id.toString();

try {
    review8BB = await reviews.create(
        gymBB_id,
        user8_id,
        "2023-01-19",
        "A retro-themed atmosphere",
        2
    )
    console.log("review of user8 for gymBB is created!")
} catch (e) {
    console.log(e);
}
let review8BB_id = review8BB._id.toString();

try {
    review9BA = await reviews.create(
        gymBA_id,
        user9_id,
        "2023-01-20",
        "The music is so loud!",
        1
    )
    console.log("reivew of user9 for gymBA is created!")
} catch (e) {
    console.log(e);
}
let review9BA_id = await review9BA._id.toString();

try {
    review9BB = await reviews.create(
        gymBB_id,
        user9_id,
        "2023-01-21",
        "A variety of amenities, such as a pool, sauna, and steam room",
        5
    )
    console.log("review of user9 for gymBB is created!")
} catch (e) {
    console.log(e);
}
let review9BB_id = review9BB._id.toString();


try {
    review10BA = await reviews.create(
        gymBA_id,
        user10_id,
        "2023-01-22",
        "A state-of-the-art facility with the latest equipment",
        5
    )
    console.log("reivew of user10 for gymBA is created!")
} catch (e) {
    console.log(e);
}
let review10BA_id = await review10BA._id.toString();

try {
    review10BB = await reviews.create(
        gymBB_id,
        user10_id,
        "2023-01-23",
        "A luxurious and upscale atmosphere",
        5
    )
    console.log("review of user10 for gymBB is created!")
} catch (e) {
    console.log(e);
}
let review10BB_id = review10BB._id.toString();

// console.log("before adding the deletion, the rating of the gym is")
// let gym = await gyms.getByGymId(gymBB_id)
// console.log(gym.rating)
// let reviewDeletion = undefined;
// reviewDeletion = await reviews.create(
//     gymBB_id,
//     user10_id,
//     "2023-01-23",
//     "Ok!",
//     3)
// let reviewDeletion_id = reviewDeletion._id.toString();
// console.log("after adding the deletion, the rating of the gym is")
// gym = await gyms.getByGymId(gymBB_id)
// console.log(gym.rating)

//get, getAll, getGymReviews, getUserReviews, create, removeReview, updateReviewContent, updateReviewComment, updateReviewRating
//console.log("this is get review A")
//console.log(await reviews.get(reviewA_id));
//console.log("this is get all")
//console.log(await reviews.getAll())
//console.log("this is get gym all reviews")
//console.log(await reviews.getGymReviews(gymAA_id));
//console.log("this is get user all reviews")
//console.log(await reviews.getUserReviews(userA_id));

// console.log(await reviews.removeReview(reviewDeletion_id));
// console.log("reviewDeletion is removed!");
// console.log("after the deletion, the rating of the gym is")
// gym = await gyms.getByGymId(gymBB_id)
// console.log(gym.rating)

// await reviews.updateReviewContent(review10BB_id, "A luxurious and upscale atmosphere!", "2023-01-24");
// console.log("review10BB_id content is updated!")
// await reviews.updateReviewRating(review10BB_id, 4.5, "2023-01-30");
// console.log("review10BB_id grading is updated!")

console.log("----------------------------------------------------------------------")
console.log("----------------------------------------------------------------------")
console.log("let's create some comments!")
let comment1 = undefined;
let comment2 = undefined;
let comment3 = undefined;
let comment4 = undefined;
let comment5 = undefined;
let comment6 = undefined;
let comment7 = undefined;
let comment8 = undefined;
let comment9 = undefined;
let comment10 = undefined;
// user1 => review2AA
// user2 => review3AB
// user3 => review4AA
// user4 => review5AB
// user5 => review1AA
try {
    comment1 = await comments.create(
        user1_id,
        "2023-02-01",
        "This gym is great for beginners. The staff is very patient and helpful, and they're always willing to show you how to use the equipment.",
        review2AA_id
    )
    console.log("comment1 is created!")

} catch (e) {
    console.log(e);
}
let comment1_id = comment1._id.toString();

try {
    comment2 = await comments.create(
        user2_id,
        "2023-02-02",
        "This gym is perfect for people who want to get in shape but don't have a lot of time. The classes are short and intense, and they're a great way to get a workout in",
        review3AB_id
    )
    console.log("comment2 is created!")

} catch (e) {
    console.log(e);
}
let comment2_id = comment2._id.toString();
try {
    comment3 = await comments.create(
        user3_id,
        "2023-02-03",
        "This gym is great for people who want to focus on specific areas of their fitness. There are classes for everything from yoga to Pilates to Zumba.",
        review4AA_id
    )
    console.log("comment3 is created!")

} catch (e) {
    console.log(e);
}
let comment3_id = comment3._id.toString();

try {
    comment4 = await comments.create(
        user4_id,
        "2023-02-04",
        "This gym is great for people who want to be social. There are always people working out, and it's a great place to meet new people.",
        review5AA_id
    )
    console.log("comment4 is created!")

} catch (e) {
    console.log(e);
}
let comment4_id = comment4._id.toString();
try {
    comment5 = await comments.create(
        user5_id,
        "2023-02-05",
        "This gym is great for people who want to be pampered. There's a sauna, steam room, and whirlpool, and the staff is always happy to give you a massage.",
        review1AB_id
    )
    console.log("comment5 is created!")

} catch (e) {
    console.log(e);
}
let comment5_id = comment5._id.toString();

// user6 => review7BA
// user7 => review8AB
// user8 => review9BA
// user9 => review10AB
// user10 => review6BA
try {
    comment6 = await comments.create(
        user6_id,
        "2023-02-06",
        "I'm not a big fan of this gym. The staff is not very friendly, the facilities are not very clean, and the prices are too high",
        review7BB_id
    )
    console.log("comment6 is created!")

} catch (e) {
    console.log(e);
}
let comment6_id = comment6._id.toString();
try {
    comment7 = await comments.create(
        user7_id,
        "2023-02-07",
        "I've been going to this gym for years and I've never had a bad experience. The staff is always friendly and helpful, and the facilities are always clean and well-maintained.",
        review8BA_id
    )
    console.log("comment7 is created!")

} catch (e) {
    console.log(e);
}
let comment7_id = comment7._id.toString();
try {
    comment8 = await comments.create(
        user8_id,
        "2023-02-08",
        "This gym is perfect for me. It's close to my house, the hours are convenient, and the prices are affordable.",
        review9BB_id
    )
    console.log("comment8 is created!")

} catch (e) {
    console.log(e);
}
let comment8_id = comment8._id.toString();
try {
    comment9 = await comments.create(
        user9_id,
        "2023-02-09",
        "I've been a member of this gym for a year now and I've seen great results. The trainers are knowledgeable and motivating, and the classes are fun and challenging.",
        review10BA_id
    )
    console.log("comment9 is created!")

} catch (e) {
    console.log(e);
}
let comment9_id = comment9._id.toString();
try {
    comment10 = await comments.create(
        user10_id,
        "2023-02-10",
        "I love this gym! The staff is friendly and helpful, the facilities are clean and well-maintained, and there's always something to do",
        review6BB_id
    )
    console.log("comment10 is created!")

} catch (e) {
    console.log(e);
}
let comment10_id = comment10._id.toString();




//get, getAllByReview, getAllByUser, create, remove, update
//console.log(await comments.get(comment1_id));
// console.log(await comments.getAllByReview(review1AA_id));
// console.log("this is commentB remove!")
// console.log(await reviews.get(review6BB_id))
// let comment_delete = await comments.create(
//     user1_id,
//     "2023-02-11",
//     "Yes I agree",
//     review6BB_id
// )
// console.log("comment_delete is created!")
// console.log(await reviews.get(review6BB_id))
// let comment_delete_id = comment_delete._id.toString();
// await comments.remove(comment_delete_id);
// console.log("comment_delete is removed!")
// console.log(await reviews.get(review6BB_id))

// console.log(await comments.get(comment10_id))
// await comments.update(comment10_id, "I love this gym! The staff is friendly and helpful, the facilities are clean and well-maintained, and there's always something to do", "2023-04-07");
// console.log("comment1 is updated!")
// console.log(await comments.get(comment10_id))

console.log('Done seeding database');

await closeConnection();



