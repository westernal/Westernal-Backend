const express = require("express");

const chatController = require("../controllers/chat-controllers");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.use(checkAuth);

router.post("/create", chatController.createChat);

router.get("/chat/:uid", chatController.getUserChats);

router.post("/message/send", chatController.sendMessage);

module.exports = router;
