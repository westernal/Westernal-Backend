const HttpError = require("../models/http-error");
const Chat = require("../models/chat");
const Message = require("../models/message");
const User = require("../models/user");

const createChat = async (req, res, next) => {
  const { receiverId, senderId } = req.body;

  let receiver;
  let existingChat;

  try {
    existingChat = Chat.find({
      members: { $in: [receiverId, senderId] },
    });
  } catch (error) {
    return next(error);
  }

  if (existingChat) {
    const err = new HttpError("Chat already exists.", 422);
    return next(err);
  }

  if (senderId != req.userData.userId) {
    const err = new HttpError("Only the user can send the request.", 422);
    return next(err);
  }

  try {
    receiver = await User.findById(receiverId);
  } catch (error) {
    return next(error);
  }

  if (!receiver) {
    const err = new HttpError("Receiver doesn't exist.", 422);
    return next(err);
  }

  const newChat = new Chat({
    members: [receiverId, senderId],
  });

  try {
    await newChat.save();
  } catch (error) {
    return next(error);
  }

  res.status(200).json({ message: "Chat created." });
};

const getUserChats = async (req, res, next) => {
  const userId = req.params.uid;
  let chats;

  try {
    chats = Chat.find({ members: { $in: [userId] } });
  } catch (error) {
    return next(error);
  }

  res.status(200).json({ chats: chats });
};

exports.getUserChats = getUserChats;
exports.createChat = createChat;
