const express = require("express");
const fileUpload = require("express-fileupload");
const { check } = require("express-validator");

const router = express.Router();

const postControllers = require("../controllers/post-controllers");
const checkAuth = require("../middleware/check-auth");
const songUpload = require("../middleware/song-upload");

router.get("/:pid", postControllers.getPostById);

router.get("/user/:uid", postControllers.getPostByUserId);

router.get("/timeline/:uid", postControllers.getTimelinePost);

router.use(checkAuth);

router.post("/", songUpload.single("song"), postControllers.createPosts);

router.post("/like/:pid", postControllers.likePost);

router.post("/unlike/:pid", postControllers.unlikePost);

router.get("/", postControllers.getPosts);

router.delete("/:pid", postControllers.deletePost);

module.exports = router;
