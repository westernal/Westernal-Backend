const HttpError = require("../models/http-error");
const Comment = require("../models/comment");
const Post = require("../models/posts");

const postComment = async (req, res, next) => {
  const { writerId, postId, message } = req.body;

  const commentDate = new Date();
  let post;

  const postedComment = new Comment({
    writerId: writerId,
    postId: postId,
    message: message,
    date: commentDate,
  });

  try {
    post = await Post.findById(postId);
  } catch (error) {
    next(error);
  }

  try {
    await postedComment.save();
    post.comments_length++;
    await post.save();
  } catch (error) {
    next(error);
  }

  res.status(201).json({ message: "comment posted!" });
};

const getCommentsByPostId = async (req, res, next) => {
  const postId = req.params.uid;

  let comments;

  try {
    comments = await Comment.find({ post: postId }).sort({ date: -1 });
  } catch (error) {
    return next(error);
  }

  if (!comments) {
    const err = new HttpError("user doesn't exists!", 401);
    next(err);
  }

  res.status(200).json({ comments: comments });
};

exports.getCommentsByPostId = getCommentsByPostId;
exports.postComment = postComment;
