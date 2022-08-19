const express = require("express");

const fileUpload = require("../middleware/file-upload");

const usersControllers = require("../controllers/user-controllers");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/", usersControllers.getUsers);

router.get("/:uid", usersControllers.getUserById);

router.post("/signup", usersControllers.signup);

router.post("/login", usersControllers.login);

router.post("/login/google", usersControllers.googleLogin);

router.post("/follow/:uid", checkAuth, usersControllers.followUser);

router.get("/followers/:uname", usersControllers.getUserFollowers);

router.post("/unfollow/:uid", checkAuth, usersControllers.unfollowUser);

router.post("/verify/:uid", checkAuth, usersControllers.verifyUser);

router.get("/following/:uname", usersControllers.getUserFollowings);

router.post(
  "/edit/:uid",
  [fileUpload.single("image"), checkAuth],
  usersControllers.editUser
);

module.exports = router;
