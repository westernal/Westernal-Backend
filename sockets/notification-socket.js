const notificationSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("notification", (msg) => {
      console.log("message: " + msg);
    });
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};

exports.notificationSocket = notificationSocket;
