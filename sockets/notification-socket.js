const User = require("../models/user");

const notificationSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("get id", async (id) => {
      let user;

      try {
        user = await User.findById(id);
      } catch (error) {
        socket.emit("send notification", 0);
      }

      if (!user || !user.new_notification) {
        socket.emit("send notification", 0);
      }

      try {
        socket.emit("send notification", user.new_notification);
      } catch (error) {
        socket.emit("send notification", 0);
      }
    });
  });
};

exports.notificationSocket = notificationSocket;
