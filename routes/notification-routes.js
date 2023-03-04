const express = require("express");

const notificationController = require("../controllers/notification-controllers");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/:uid", checkAuth, notificationController.getNotificationsByUserId);

router.get("/size/:uid", notificationController.getNotificationsLengthByUserId);

module.exports = router;
