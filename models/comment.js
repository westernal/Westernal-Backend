const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  writer: {
    id: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    username: { type: String, required: true },
    avatar: { type: String, required: true },
  },
  postId: { type: mongoose.Types.ObjectId, required: true, ref: "Post" },
  message: { type: String, required: true },
  date: { type: Date, required: true },
  replies: [{ type: mongoose.Types.ObjectId, required: true, ref: "Comment" }],
  type: { type: String, default: "comment" },
});

module.exports = mongoose.model("Comment", commentSchema);
