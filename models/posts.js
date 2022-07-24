const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  song: { type: String, required: true },
  date: { type: Date, required: true },
  likes: [{ type: mongoose.Types.ObjectId, required: true, ref: "User" }],
});

module.exports = mongoose.model("Post", postSchema);
