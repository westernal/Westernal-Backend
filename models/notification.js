const mongoose = require("mongoose");

const notifSchema = new mongoose.Schema({
  owner: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  messages: [{ type: String }],
});

module.exports = mongoose.model("Notification", notifSchema);
