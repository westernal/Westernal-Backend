const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  writerId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  postId: { type: mongoose.Types.ObjectId, required: true, ref: "Post" },
  message: { type: String, required: true },
  date: { type: Date, required: true },
});

module.exports = mongoose.model("Comment", commentSchema);
