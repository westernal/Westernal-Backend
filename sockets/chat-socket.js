const User = require("../models/user");

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

const chatSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("addUser", (userId) => {
      addUser(userId, socket.id);
      io.emit("getUsers", users);
    });

    socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
      const user = getUser(receiverId);
      const sender = await User.findById(senderId);
      const message = {
        sender: {
          id: sender._id,
          username: sender.username,
          avatar: sender.image,
          verified: sender.verified,
        },
        text: text,
        createdAt: Date.now(),
      };

      io.to(user.socketId).emit("getMessage", message);
    });

    socket.on("disconnect", () => {
      removeUser(socket.id);
    });
  });
};

exports.chatSocket = chatSocket;
