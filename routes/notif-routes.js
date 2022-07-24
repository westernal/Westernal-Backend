const express = require("express");

const notifController = require("../controllers/notif-controllers");

const router = express.Router();

router.get("/:uid", notifController.getNotifsByUserId);

module.exports = router;
