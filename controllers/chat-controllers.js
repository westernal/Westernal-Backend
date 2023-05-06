const HttpError = require("../models/http-error");
const Chat = require("../models/chat");
const Message = require("../models/message");
const User = require("../models/user");

const createChat = async (req, res, next) => {
  const { receiverId, senderId } = req.body;

  let receiver;
  let existingChat;

  if (senderId === receiverId) {
    const err = new HttpError("You can't chat with yourself.", 422);
    return next(err);
  }

  try {
    existingChat = await Chat.findOne({
      members: { $eq: [receiverId, senderId] },
    });
  } catch (error) {
    return next(error);
  }

  if (existingChat) {
    const err = new HttpError(`Chat already exists.`, 422);
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
    new_message: [
      { id: senderId, count: 0 },
      { id: receiverId, count: 0 },
    ],
  });

  try {
    await newChat.save();
  } catch (error) {
    return next(error);
  }

  res.status(200).json({ chatId: newChat._id });
};

const getUserChats = async (req, res, next) => {
  const userId = req.params.uid;
  let chats;

  if (userId != req.userData.userId) {
    const err = new HttpError("Only the user can send the request.", 422);
    return next(err);
  }

  try {
    chats = await Chat.find({ members: { $in: [userId] } });
  } catch (error) {
    return next(error);
  }

  if (!chats) {
    chats = [];
  }

  try {
    chats = await Promise.all(
      chats.map(async (chat) => {
        chat.members = await Promise.all(
          chat.members.map(async (member) => {
            const { username, image, verified } = await User.findById(member);
            return { username, image, verified };
          })
        );
        chat.new_message.forEach((message) => {
          if (message.id === userId) {
            chat.new_message = message.count;
          }
        });
        return chat;
      })
    );
  } catch (error) {
    return next(error);
  }

  res.status(200).json({ chats: chats });
};

const sendMessage = async (req, res, next) => {
  const newMessage = new Message(req.body);
  const { chatId, sender } = req.body;
  let chat;
  let receiverId;
  let receiver;

  if (sender.id != req.userData.userId) {
    const err = new HttpError("Only the user can send the request.", 422);
    return next(err);
  }

  try {
    chat = await Chat.findById(chatId);
  } catch (error) {
    return next(error);
  }

  try {
    chat.members.forEach((member) => {
      if (member !== sender.id) {
        receiverId = member;
      }
    });
    receiver = await User.findById(receiverId);
  } catch (error) {
    return next(error);
  }

  try {
    chat.new_message = chat.new_message.map((message) => {
      if (message.id === receiverId) {
        message.count++;
      }
      return message;
    });
    receiver.new_message++;
  } catch (error) {
    return next(error);
  }

  try {
    await newMessage.save();
    await receiver.save();
    chat.markModified("new_message");
    await chat.save();
  } catch (error) {
    return next(error);
  }

  res.status(200).json({ message: "Message sent." });
};

const getChatById = async (req, res, next) => {
  const chatId = req.params.cid;
  let messages;

  try {
    messages = await Message.find({ chatId: chatId })
      .limit(50)
      .sort({ createdAt: -1 });
  } catch (error) {
    return next(error);
  }

  try {
    messages = await Promise.all(
      messages.map(async (message) => {
        const { username, image, verified } = await User.findById(
          message.sender.id
        );
        message.sender.username = username;
        message.sender.avatar = image;
        message.sender.verified = verified;
        return message;
      })
    );
  } catch (error) {
    return next(error);
  }

  res.status(200).json({ messages: messages });
};

const getNewMessages = async (req, res, next) => {
  const chatId = req.params.cid;
  let chat;

  try {
    chat = await Chat.findById(chatId);
  } catch (error) {
    return next(error);
  }

  if (chat.new_message) {
    res.status(200).json({ messages: chat.new_message });
  } else res.status(200).json({ messages: 0 });
};

exports.createChat = createChat;
exports.getUserChats = getUserChats;
exports.sendMessage = sendMessage;
exports.getChatById = getChatById;
exports.getNewMessages = getNewMessages;
