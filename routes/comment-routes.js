const express = require("express");

const commentController = require("../controllers/comment-controllers");

const router = express.Router();

router.get("/:uid", commentController.getCommentsByPostId);

router.post("/", commentController.postComment);

module.exports = router;
