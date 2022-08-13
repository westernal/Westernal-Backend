const HttpError = require("../models/http-error");
const Comment = require("../models/comment");
const Post = require("../models/posts");
const User = require("../models/user");
const Notification = require("../models/notification");

const postComment = async (req, res, next) => {
  const { writerId, postId, message } = req.body;

  const commentDate = new Date();
  let post;
  let user;

  try {
    user = await User.findById(writerId);
  } catch (error) {
    next(error);
  }

  if (!user) {
    const error = new HttpError("User doesn't exist.", 500);
    return next(error);
  }

  const postedComment = new Comment({
    writer: { id: writerId, username: user.username, avatar: user.image },
    postId: postId,
    message: message,
    date: commentDate,
  });

  try {
    post = await Post.findById(postId);
  } catch (error) {
    return next(error);
  }

  if (!post) {
    const error = new HttpError("Post doesn't exist.", 500);
    return next(error);
  }

  const notification = new Notification({
    owner: post.creator,
    user: {
      id: postedComment.writer.id,
      username: postedComment.writer.username,
    },
    message: "commented on your post:" + " " + post.title,
    date: new Date(),
  });

  try {
    await notification.save();
    await postedComment.save();
    post.comments_length++;
    await post.save();
  } catch (error) {
    return next(error);
  }

  res.status(201).json({ message: "Comment posted!" });
};

const postReply = async (req, res, next) => {
  const { writerId, postId, message, commentId } = req.body;

  const commentDate = new Date();
  let post;
  let user;
  let comment;

  try {
    user = await User.findById(writerId);
  } catch (error) {
    next(error);
  }

  if (!user) {
    const error = new HttpError("User doesn't exist.", 500);
    return next(error);
  }

  const postedComment = new Comment({
    writer: { id: writerId, username: user.username, avatar: user.image },
    postId: postId,
    message: message,
    date: commentDate,
    type: "reply",
  });

  try {
    comment = await Comment.findById(commentId);
  } catch (error) {
    return next(error);
  }

  if (!comment) {
    const error = new HttpError("the comment you replied does'nt exist.", 401);
    return next(error);
  }

  try {
    post = await Post.findById(postId);
  } catch (error) {
    return next(error);
  }

  if (!post) {
    const error = new HttpError("Post doesn't exist.", 500);
    return next(error);
  }

  const notification = new Notification({
    owner: comment.writer.id,
    user: {
      id: postedComment.writer.id,
      username: postedComment.writer.username,
    },
    message: "replied your comment:" + " " + comment.message,
    date: new Date(),
  });

  try {
    await notification.save();
    await postedComment.save();
    comment.replies.push(postedComment._id);
    post.comments_length++;
    await comment.save();
    await post.save();
  } catch (error) {
    return next(error);
  }

  res.status(201).json({ message: "Comment posted!" });
};

const getCommentsByPostId = async (req, res, next) => {
  const postId = req.params.pid;

  let comments;

  try {
    comments = await Comment.find({
      postId: postId,
      type: { $nin: ["reply"] },
    }).sort({
      date: -1,
    });
  } catch (error) {
    return next(error);
  }

  res.status(200).json({ comments: comments });
};

const getRepliesByCommentId = async (req, res, next) => {
  const commentId = req.params.cid;

  let replies;
  let comment;

  try {
    comment = await Comment.findById(commentId);
  } catch (error) {
    return next(error);
  }

  if (!comment) {
    const error = new HttpError("Comment doesn't exist.");
    return next(error);
  }

  try {
    replies = await Comment.find({ _id: { $in: comment.replies } }).sort({
      date: -1,
    });
  } catch (error) {
    return next(error);
  }

  res.status(200).json({ replies: replies });
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
    const error = new HttpError("Comment doesn't exist.", 500);
    return next(error);
  }

  try {
    await Comment.remove({ _id: { $in: comment.replies } });
  } catch (error) {
    return next(error);
  }

  try {
    post = await Post.findById(comment.postId);
  } catch (error) {
    return next(error);
  }

  try {
    await comment.remove();
    post.comments_length = post.comments_length - (comment.replies.length + 1);
    await post.save();
  } catch (error) {
    return next(error);
  }

  res.json({ message: "Comment Deleted!" });
};

exports.getCommentsByPostId = getCommentsByPostId;
exports.postComment = postComment;
exports.deleteComment = deleteComment;
exports.getRepliesByCommentId = getRepliesByCommentId;
exports.postReply = postReply;
