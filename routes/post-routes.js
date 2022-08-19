const express = require("express");

const router = express.Router();

const postControllers = require("../controllers/post-controllers");
const checkAuth = require("../middleware/check-auth");

router.get("/:pid", postControllers.getPostById);

router.get("/user/:uname", postControllers.getPostByUsername);

router.get("/timeline/:uid", postControllers.getTimelinePost);

router.use(checkAuth);

router.post("/", postControllers.createPosts);

router.post("/like/:pid", postControllers.likePost);

router.post("/unlike/:pid", postControllers.unlikePost);

router.get("/like/:pid", postControllers.getPostLikes);

router.get("/", postControllers.getPosts);

router.delete("/:pid", postControllers.deletePost);

module.exports = router;
