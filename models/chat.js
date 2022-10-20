const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  message: { type: String, required: true },
  sender: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  receiver: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  date: { type: Date, required: true },
});

module.exports = mongoose.model("Chat", chatSchema);
