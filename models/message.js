const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatID: { type: mongoose.Types.ObjectId, required: true, ref: "Chat" },
    sender: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
