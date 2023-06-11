const mongoose = require("mongoose");
const Post = require("../Post/Post");


// create schema
const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, "First Name is required"],
    },
    lastname: {
        type: String,
        required: [true, "Last Name is required"],
    },
    profilePhoto: {
        type: String,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ["Admin", "Guest", "Editor"],
    },
    viewers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        }
    ],
    blocked: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    // plan: {
    //         type: String,
    //         enum: ['Free', 'Premium', 'Pro'],
    //         default: 'Free'
    // },
    userAward: [
        {
            type: String,
            enum: ['Bronze', 'Silver', 'Gold'],
            default: 'Bronze'
        }
    ],
},
    {
        timestamps: true,
        toJSON: {
            virtuals: true
        }
    }
);

// hooks 
// pre-hook: before record is created
userSchema.pre("findOne", async function (next) {
    
    // populate user posts: retreive all post belongs to a user 
    this.populate('posts'); 
    
    // get the user
    const userId = this._conditions._id;

    // find the post created by the user
    const posts = await Post.find({ user: userId });

  
    // get the last post created by the user 
    const lastPost = posts[posts.length - 1];
    // console.log(lastPost);
    
    // i added this 
    if (!lastPost) {
        return null;
    }
    // get the last post date
    const lastPostDate = new Date(lastPost.createdAt);
    // get the last post date in string 
    const lastPostDateStr = lastPostDate.toString();

    // add virtual to the schema
    userSchema.virtual("lastPostDate").get(function () {
        return lastPostDateStr;
    });


    // ...............check if the user is inactive for 30days.......
    // get current date
    const currentDate = new Date();
    // get the difference between the last post date and the current ate
    const diff = currentDate - lastPostDate;

    // get the difference in days and return less than in days
    const diffInDays = diff / (1000 * 3600 * 24);

    if (diffInDays > 30) {
        // add virtual isInactive to the schema to check if the a user is inactive for 30 days
        userSchema.virtual("isInactive").get(function () {
            return true;
        });

        // find the user by id and update
        await User.findByIdAndUpdate(userId, { isBlocked: true }, { new: true });
    } else {
        // add virtual isInactive to the schema to check if the a user is not inactive for 30 days
        userSchema.virtual("isInactive").get(function () {
            return false;
        });
         // find the user by id and update
        await User.findByIdAndUpdate(userId, { isBlocked: false }, { new: true });
    }



    // ----------last active date-----

    // convert to days ago, for example 1 day ago
    const daysAgo = Math.floor(diffInDays);
    // add virtuals lastActive in days to the schema
    userSchema.virtual("lastActive").get(function () {
        if (daysAgo <= 0) {
            return 'Today';
        }

        if (daysAgo === 0) {
            return 'Yesterday';
        }

        if (daysAgo > 1) {
            return `${daysAgo} days ago`;
        }
    });




    // update user award 

    // get the number of posts 
    const numberOfPosts = posts.length;
    // check of the number of post is less than 10
    if (numberOfPosts < 10) {
        await User.findByIdAndUpdate(userId, { userAward: 'Bronze' }, { new: true });
    }

     // check of the number of post is greter than 10
    if (numberOfPosts > 10 && numberOfPosts <= 20 ) {
        await User.findByIdAndUpdate(userId, { userAward: 'Silver' }, { new: true });
    }

    if (numberOfPosts > 20) {
        await User.findByIdAndUpdate(userId, { userAward: 'Gold' }, { new: true });
    }
    next();
});

// post-hook: after saving
userSchema.post("save", function (next) {
    console.log('post hook called');
    next();
});

// Get fullname
userSchema.virtual('fullname').get(function () {
    return `${this.firstname} ${this.lastname}`;
});

// Get innitials
userSchema.virtual('initials').get(function () {
    return `${this.firstname[0]}${this.lastname[0]}`;
});

// Get postcounts
userSchema.virtual('postCounts').get(function () {
    return this.posts.length;
});

// Get followers count
userSchema.virtual('followersCounts').get(function () {
    return this.followers.length;
});

// Get following count
userSchema.virtual('followingCounts').get(function () {
    return this.following.length;
});

// Get viewers count
userSchema.virtual('viewersCounts').get(function () {
    return this.viewers.length;
});

// Get blocked count
userSchema.virtual('blockedCounts').get(function () {
    return this.blocked.length;
});



// Complile the user model
const User = mongoose.model("User", userSchema);

module.exports = User;