const express = require("express");

const commentController = require("../controllers/comment-controllers");
const checkCookie = require("../middleware/check-cookie");

const router = express.Router();

router.get("/:pid", commentController.getCommentsByPostId);

router.post("/", commentController.postComment);

router.delete("/:cid", commentController.deleteComment);

router.post("/replies", commentController.postReply);

router.use(checkCookie);

router.get("/replies/:cid", commentController.getRepliesByCommentId);

module.exports = router;
