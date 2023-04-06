const express = require("express");

const fileUpload = require("../middleware/file-upload");

const usersControllers = require("../controllers/user-controllers");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/", usersControllers.getUsers);

router.get("/user/:uid", usersControllers.getUserById);

router.get("/user/featured", usersControllers.getFeaturedUsers);

router.post("/signup", usersControllers.signup);

router.post("/login", usersControllers.login);

router.post("/login/google", usersControllers.googleLogin);

router.post("/follow/:uid", checkAuth, usersControllers.followUser);

router.get("/followers/:uname", usersControllers.getUserFollowers);

router.post("/unfollow/:uid", checkAuth, usersControllers.unfollowUser);

router.post("/saved-posts/:uid", checkAuth, usersControllers.checkSavedPost);

router.get("/following/:uname", usersControllers.getUserFollowings);

router.post("/reset-password", usersControllers.resetPassword);

router.post(
  "/edit/:uid",
  [fileUpload.single("image"), checkAuth],
  usersControllers.editUser
);

router.post("/edit/password/:uid", checkAuth, usersControllers.changePassword);

router.post(
  "/notification/clear/:uid",
  checkAuth,
  usersControllers.clearNotification
);

router.get(
  "/notification/:uid",
  checkAuth,
  usersControllers.getNewNotifications
);

router.get("/search", usersControllers.searchUsers);

router.get("/saved-posts/:uid", checkAuth, usersControllers.getUserSavedPosts);

module.exports = router;
