const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  caption: { type: String },
  author: {
    id: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
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
