const express = require("express");

const commentController = require("../controllers/comment-controllers");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.use(checkAuth);

router.get("/:pid", commentController.getCommentsByPostId);

router.post("/", commentController.postComment);

router.delete("/:cid", commentController.deleteComment);

router.post("/replies", commentController.postReply);

router.get("/replies/:cid", commentController.getRepliesByCommentId);

module.exports = router;
