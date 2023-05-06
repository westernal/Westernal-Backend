const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const io = require("socket.io");

const postsRoutes = require("./routes/post-routes");
const usersRoutes = require("./routes/user-routes");
const notificationRoutes = require("./routes/notification-routes");
const commentRoutes = require("./routes/comment-routes");
const chatRoutes = require("./routes/chat-routes");
const HttpError = require("./models/http-error");
const passwords = require("./security");
const chatSocket = require("./sockets/chat-socket");

chatSocket(io);

const app = express();
const http = require("http");
const server = http.createServer(app);

app.use(bodyParser.json());
app.use(
  cors({
    origin: ["https://www.westernal.net", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/uploads", express.static(path.join("uploads")));

app.use("/api/posts", postsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/chats", chatRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Not Found", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSet) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "Error" });
});

mongoose
  .connect("mongodb://0.0.0.0:27017/mern")
  .then(() => {
    server.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
