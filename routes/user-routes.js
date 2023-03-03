const express = require("express");

const fileUpload = require("../middleware/file-upload");

const usersControllers = require("../controllers/user-controllers");
const checkAuth = require("../middleware/check-auth");
const checkCookie = require("../middleware/check-cookie");

const router = express.Router();

router.get("/", usersControllers.getUsers);

router.get("/:uid", usersControllers.getUserById);

router.post("/signup", usersControllers.signup);

router.post("/login", usersControllers.login);

router.post("/login/google", usersControllers.googleLogin);

router.post("/follow/:uid", checkCookie, usersControllers.followUser);

router.get("/followers/:uname", usersControllers.getUserFollowers);

router.post("/unfollow/:uid", checkCookie, usersControllers.unfollowUser);

router.post("/verify/:uid", checkCookie, usersControllers.verifyUser);

router.get("/following/:uname", usersControllers.getUserFollowings);

router.post("/reset-password", usersControllers.resetPassword);

router.post(
  "/edit/:uid",
  [fileUpload.single("image"), checkCookie],
  usersControllers.editUser
);

router.post("/edit/password/:uid", checkAuth, usersControllers.changePassword);

router.post(
  "/notification/clear/:uid",
  checkCookie,
  usersControllers.clearNotification
);

router.get(
  "/notification/:uid",
  checkCookie,
  usersControllers.getNewNotifications
);

router.get("/search/:uname", usersControllers.searchUsers);

router.get(
  "/saved-posts/:uid",
  checkCookie,
  usersControllers.getUserSavedPosts
);

module.exports = router;
