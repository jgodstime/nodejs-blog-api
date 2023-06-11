const mongoose = require("mongoose");


// create schema 
const categorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
    },
    title: {
        type: String,
        required: [true, "Title is required"],
    },
},
    {
        timestamps: true,
    }
);

// Complile the Category model
const Category = mongoose.model("Category", categorySchema);

module.exports = Category;