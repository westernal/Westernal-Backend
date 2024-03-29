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
  let notification;

  if (writerId != req.userData.userId) {
    const err = new HttpError("Only the user can send the request.", 422);
    return next(err);
  }

  const postedComment = new Comment({
    writer: { id: writerId },
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

  try {
    user = await User.findById(post.author.id);
  } catch (error) {
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Post author doesn't exist.", 500);
    return next(error);
  }

  if (post.author.id != writerId) {
    notification = new Notification({
      owner: post.author.id,
      user: {
        id: writerId,
      },
      postId: postId,
      message: "commented on your post.",
      date: new Date(),
    });
  }

  try {
    if (post.author.id != writerId) {
      user.new_notification++;
      await user.save();
      await notification.save();
    }
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
  let comment;
  let user;
  let notification;

  if (writerId != req.userData.userId) {
    const err = new HttpError("Only the user can send the request.", 422);
    return next(err);
  }

  const postedComment = new Comment({
    writer: { id: writerId },
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
    const error = new HttpError("The comment you replied doesn't exist", 401);
    return next(error);
  }

  try {
    post = await Post.findById(postId);
  } catch (error) {
    return next(error);
  }

  if (!post) {
    const error = new HttpError("Post doesn't exist", 500);
    return next(error);
  }

  try {
    user = await User.findById(post.author.id);
  } catch (error) {
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Post author doesn't exist.", 500);
    return next(error);
  }

  if (comment.writer.id != writerId) {
    notification = new Notification({
      owner: comment.writer.id,
      user: {
        id: writerId,
      },
      postId: postId,
      message: "replied your comment.",
      date: new Date(),
    });
  }

  try {
    if (comment.writer.id != writerId) {
      user.new_notification++;
      await user.save();
      await notification.save();
    }
    await postedComment.save();
    comment.replies.push(postedComment._id);
    await comment.save();
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

  try {
    comments = await Promise.all(
      comments.map(async (comment) => {
        const { username, image, verified } = await User.findById(
          comment.writer.id
        );
        comment.writer.username = username;
        comment.writer.avatar = image;
        comment.writer.verified = verified;
        return comment;
      })
    );
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
    const error = new HttpError("Comment doesn't exist");
    return next(error);
  }

  try {
    replies = await Comment.find({ _id: { $in: comment.replies } }).sort({
      date: -1,
    });
  } catch (error) {
    return next(error);
  }

  try {
    replies = await Promise.all(
      replies.map(async (comment) => {
        const { username, image, verified } = await User.findById(
          comment.writer.id
        );
        comment.writer.username = username;
        comment.writer.avatar = image;
        comment.writer.verified = verified;
        return comment;
      })
    );
  } catch (error) {
    return next(error);
  }

  res.status(200).json({ replies: replies });
};

const deleteComment = async (req, res, next) => {
  const commentId = req.params.cid;
  let comment;

  try {
    comment = await Comment.findById(commentId);
  } catch (error) {
    return next(error);
  }

  if (!comment) {
    const error = new HttpError("Comment doesn't exist", 500);
    return next(error);
  }

  if (comment.writer.id != req.userData.userId) {
    const err = new HttpError("Only the user can send the request.", 422);
    return next(err);
  }

  try {
    await Comment.remove({ _id: { $in: comment.replies } });
  } catch (error) {
    return next(error);
  }

  try {
    await comment.remove();
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
