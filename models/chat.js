const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    members: { type: Array, required: true },
    new_message: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
