const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Types.ObjectId, required: true, ref: "Chat" },
    sender: {
      id: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
      username: { type: String },
      avatar: { type: String },
      verified: { type: Boolean },
    },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
