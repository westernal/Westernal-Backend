const express = require("express");

const chatController = require("../controllers/chat-controllers");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.use(checkAuth);
router.post("/create", chatController.createChat);

module.exports = router;
