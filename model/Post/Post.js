const mongoose = require("mongoose");


// create schema 
const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Post title is required"],
    },
    description: {
        type: String,
        required: [true, "Post description is required"],
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Post category is required"],
    },
    numViews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    dislikes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Post Author is required"],
    },
    photo: {
        type: String,
        // required: [true, "Post photo is required"],
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        }
    ],
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
);

// Hook
postSchema.pre(/^find/, function (next) {
   
    // Add views count as vrtual property
    postSchema.virtual('viewsCount').get(function () {
        const post = this;
        return post.numViews.length;
    });

    // Add likes count
    postSchema.virtual('likesCount').get(function () {
        const post = this;
        return post.likes.length;
    });

    // Add didlikes count
    postSchema.virtual('disLikesCount').get(function () {
        const post = this;
        return post.dislikes.length;
    });

    // Check the most like posts in percentage
    postSchema.virtual('likesPercentage').get(function () {
        const post = this;
        const total = +post.likes.length + +post.dislikes.length;
        const percentage = (post.likes.length / total) * 100;
        return `${percentage}%`;
    });

     // Check the most diSlike posts in percentage
    postSchema.virtual('disLikesPercentage').get(function () {
        const post = this;
        const total = +post.dislikes.length + +post.dislikes.length;
        const percentage = (post.dislikes.length / total) * 100;
        return `${percentage}%`;
    });

      // Check the most diSlike posts in percentage
    postSchema.virtual('daysAgo').get(function () {
        const post = this;
        const date = Date(post.createdAt);
        const daysAgo = Math.floor((Date.now() - date) / 86400000);
        return daysAgo === 0
            ? "Today"
            : daysAgo === 1
            ? "Yesterday"
            : `${daysAgo} days ago`;
    });

    next(); 
});

// Complile the user model
const Post = mongoose.model("Post", postSchema);

module.exports = Post;