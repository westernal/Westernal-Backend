const express = require("express");

const notifController = require("../controllers/notif-controllers");

const router = express.Router();

router.get("/:uid", notifController.getNotifsByUserId);

router.get("/size/:uid", notifController.getNotifsLengthByUserId);

module.exports = router;
