const express = require("express");

const router = express.Router();

const postControllers = require("../controllers/post-controllers");
const checkAuth = require("../middleware/check-auth");

router.get("/", postControllers.getPosts);

router.get("/:pid", postControllers.getPostById);

router.get("/user/:uname", postControllers.getPostByUsername);

router.use(checkAuth);

router.get("/timeline/:uid", postControllers.getTimelinePost);

router.post("/", postControllers.createPosts);

router.post("/like/:pid", postControllers.likePost);

router.post("/unlike/:pid", postControllers.unlikePost);

router.get("/like/:pid", postControllers.getPostLikes);

router.post("/save/:pid", postControllers.savePost);

router.post("/edit/:pid", postControllers.editPost);

router.post("/unsave/:pid", postControllers.unsavePost);

router.delete("/:pid", postControllers.deletePost);

module.exports = router;
