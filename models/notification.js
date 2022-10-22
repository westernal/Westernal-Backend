const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  owner: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  user: {
    id: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    username: { type: String, required: true },
  },
  postId: { type: mongoose.Types.ObjectId, required: true, ref: "Post" },
  message: { type: String, required: true },
  date: { type: Date, required: true },
});

module.exports = mongoose.model("Notification", notificationSchema);
