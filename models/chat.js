const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  members: { type: Array, required: true },
});

module.exports = mongoose.model("Chat", chatSchema);
