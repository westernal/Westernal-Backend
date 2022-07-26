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

  if (!post) {
    const error = new HttpError("Post doesn't exist.");
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
  const postId = req.params.pid;

  let comments;

  try {
    comments = await Comment.find({ post: postId }).sort({ date: -1 });
  } catch (error) {
    return next(error);
  }

  res.status(200).json({ comments: comments });
};

const deleteComment = async (req, res, next) => {
  const commentId = req.params.cid;

  let comment;
  let post;

  try {
    comment = await Comment.findById(commentId);
  } catch (error) {
    return next(error);
  }

  if (!comment) {
    const error = new HttpError("Comment doesn't exist.");
    next(error);
  }

  try {
    post = await Post.findById(comment.postId);
  } catch (error) {
    next(error);
  }

  try {
    await comment.remove();
    post.comments_length--;
    await post.save();
  } catch (error) {
    return next(error);
  }

  res.json({ message: "Comment Deleted!" });
};

exports.getCommentsByPostId = getCommentsByPostId;
exports.postComment = postComment;
exports.deleteComment = deleteComment;
