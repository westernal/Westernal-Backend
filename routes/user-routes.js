const express = require("express");

const fileUpload = require("../middleware/file-upload");

const usersControllers = require("../controllers/user-controllers");

const router = express.Router();

router.get("/", usersControllers.getUsers);

router.get("/:uid", usersControllers.getUserById);

router.post("/signup", usersControllers.signup);

router.post("/login", usersControllers.login);

router.post("/follow/:uid", usersControllers.followUser);

router.get("/followers/:uid", usersControllers.getUserFollowers);

router.post("/unfollow/:uid", usersControllers.unfollowUser);

router.post(
  "/edit/:uid",
  fileUpload.single("image"),
  usersControllers.editUser
);

module.exports = router;
