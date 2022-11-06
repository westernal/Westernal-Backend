const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true, minlength: true },
  image: { type: String, default: "uploads/userIcon.png" },
  bio: { type: String },
  followings: [{ type: mongoose.Types.ObjectId, required: true, ref: "User" }],
  followers: [{ type: mongoose.Types.ObjectId, required: true, ref: "User" }],
  posts: [{ type: mongoose.Types.ObjectId, required: true, ref: "Post" }],
  verified: { type: Boolean, default: false },
  new_notification: { type: Number, default: 0 },
  saved_posts: [{ type: mongoose.Types.ObjectId, required: true, ref: "Post" }],
  personal_link: { type: String },
  failed_login_attempts: { type: Number, default: 0 },
});

module.exports = mongoose.model("User", userSchema);
