const mongoose = require("mongoose");

const notifSchema = new mongoose.Schema({
  owner: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  message: { type: String, required: true },
  date: { type: Date, required: true },
});

module.exports = mongoose.model("Notification", notifSchema);
