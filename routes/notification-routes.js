const express = require("express");

const notificationController = require("../controllers/notification-controllers");

const router = express.Router();

router.get("/:uid", notificationController.getNotificationsByUserId);

router.get("/size/:uid", notificationController.getNotificationsLengthByUserId);

module.exports = router;
