const express = require("express");

const notificationController = require("../controllers/notification-controllers");
const checkCookie = require("../middleware/check-cookie");

const router = express.Router();

router.get(
  "/:uid",
  checkCookie,
  notificationController.getNotificationsByUserId
);

router.get("/size/:uid", notificationController.getNotificationsLengthByUserId);

module.exports = router;
