const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  author: {
    username: { type: String },
    image: { type: String },
    verified: { type: Boolean },
  },
  songUrl: { type: String, required: true },
  date: { type: Date, required: true },
  likes: [{ type: mongoose.Types.ObjectId, required: true, ref: "User" }],
  comments_length: { type: Number, default: 0 },
});

module.exports = mongoose.model("Post", postSchema);
