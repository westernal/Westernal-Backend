const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true, minlength: 10 },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  image: { type: String, required: true },
  date: { type: String, required: true },
  likes: [{ type: mongoose.Types.ObjectId, required: true, ref: "User" }],
});

module.exports = mongoose.model("Post", postSchema);
