const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title can't be empty"],
        unique: true,
        minLength: [3, "Title can't be smaller than 3 characters"],
        maxLength: [100, "Title can't be larger than 100 characters"]
    },
    content: {
        type: String,
        required: [true, "Content can't be empty"],
        minLength: [10, "Content can't be smaller than 10 characters"],
        maxLength: [1000, "Content can't be larger than 1000 characters"]
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

const Post = mongoose.model("Post", postSchema)

module.exports = Post