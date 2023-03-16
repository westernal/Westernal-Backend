const HttpError = require("../models/http-error");
const Post = require("../models/posts");
const User = require("../models/user");
const Notification = require("../models/notification");
var validUrl = require("valid-url");
const Comment = require("../models/comment.js");

const getPosts = async (req, res, next) => {
  let posts;

  try {
    posts = await Post.find({}, "").sort({ date: -1 });
  } catch (error) {
    const err = new HttpError("Getting posts failed!", 500);
    return next(err);
  }

  try {
    posts = await Promise.all(
      posts.map(async (post) => {
        const { username, image, verified } = await User.findById(
          post.author.id
        );
        post.comments_length = await Comment.count({ postId: post._id });
        post.author.username = username;
        post.author.image = image;
        post.author.verified = verified;
        return post;
      })
    );
  } catch (error) {
    return next(error);
  }

  res.json({ posts: posts });
};

const getPostById = async (req, res, next) => {
  const postId = req.params.pid;

  let post;

  try {
    post = await Post.findById(postId);
  } catch (error) {
    return next(error);
  }

  if (!post) {
    const err = new HttpError("Could not find the post!", 500);
    return next(err);
  }

  try {
    const { username, image, verified } = await User.findById(post.author.id);
    post.comments_length = await Comment.count({ postId: post._id });
    post.author.username = username;
    post.author.image = image;
    post.author.verified = verified;
  } catch (error) {
    return next(error);
  }

  res.json({ post: post.toObject({ getters: true }) });
};

const getPostByUsername = async (req, res, next) => {
  const username = req.params.uname;

  let posts;
  let user;

  try {
    user = await User.findOne({ username: username });
  } catch (error) {
    return next(error);
  }

  if (!user) {
    const err = new HttpError("Could not find user!", 404);
    return next(err);
  }

  try {
    posts = await Post.find({ author: { id: user._id } }).sort({ date: -1 });
  } catch (error) {
    return next(error);
  }

  if (!posts) {
    const err = new HttpError("Could not find the post!", 400);
    return next(err);
  }

  try {
    posts = await Promise.all(
      posts.map(async (post) => {
        const { username, image, verified } = await User.findById(
          post.author.id
        );
        post.comments_length = await Comment.count({ postId: post._id });
        post.author.username = username;
        post.author.image = image;
        post.author.verified = verified;
        return post;
      })
    );
  } catch (error) {
    return next(error);
  }

  res.json({ posts: posts, creator: user });
};

const getTimelinePost = async (req, res, next) => {
  const userId = req.params.uid;
  let user;
  let users;
  let posts;

  if (userId != req.userData.userId) {
    const err = new HttpError("Only the user can send the request.", 422);
    return next(err);
  }

  try {
    user = await User.findById(userId);
  } catch (error) {
    return next(error);
  }

  if (!user) {
    const err = new HttpError("Could not find the user!", 500);
    return next(err);
  }

  users = user.followings;
  users.push(userId);

  try {
    posts = await Post.find({ "author.id": { $in: users } })
      .limit(10)
      .sort({ date: -1 });
  } catch (error) {
    return next(error);
  }

  if (!posts) {
    const err = new HttpError("Could not find the post!", 500);
    return next(err);
  }

  try {
    posts = await Promise.all(
      posts.map(async (post) => {
        const { username, image, verified } = await User.findById(
          post.author.id
        );
        post.comments_length = await Comment.count({ postId: post._id });
        post.author.username = username;
        post.author.image = image;
        post.author.verified = verified;
        return post;
      })
    );
  } catch (error) {
    return next(error);
  }

  res.json({ posts: posts });
};

const createPosts = async (req, res, next) => {
  const { caption, authorID, songURL } = req.body;
  const postDate = new Date();

  if (authorID != req.userData.userId) {
    const err = new HttpError("Only the user can send the request.", 422);
    return next(err);
  }

  if (!validUrl.isUri(songURL)) {
    const error = new HttpError("URL is not valid!", 422);
    return next(error);
  }

  const createdPost = new Post({
    caption: caption,
    author: { id: authorID },
    songUrl: songURL,
    date: postDate,
    likes: [],
  });

  let user;

  try {
    user = await User.findById(authorID);
  } catch (err) {
    return next(err);
  }

  if (!user) {
    const error = new HttpError("Could not find user", 422);
    return next(error);
  }

  try {
    await createdPost.save();
    user.posts.push(createdPost);
    await user.save();
  } catch (err) {
    return next(err);
  }

  res.status(201).json({ message: "post created!" });
};

const deletePost = async (req, res, next) => {
  const postId = req.params.pid;
  let post;

  try {
    post = await Post.findById(postId).populate("author.id");
  } catch (error) {
    return next(error);
  }

  if (post.author.id != req.userData.userId) {
    const err = new HttpError("Only the user can send the request.", 422);
    return next(err);
  }

  try {
    await post.remove();
    post.author.id.posts.pull(post);
    await post.author.id.save();
  } catch (error) {
    return next(error);
  }

  res.json({ message: "Post Deleted!" });
};

const editPost = async (req, res, next) => {
  const { caption } = req.body;
  const postId = req.params.pid;
  let post;

  try {
    post = Post.findByIdAndUpdate(
      postId,
      {
        caption: caption,
      },
      { new: true },
      function (err, doc) {
        if (err) {
          return res.send(500, { error: err });
        }
        return res.status(200).json({ message: "Post edited!" });
      }
    );
  } catch (error) {
    return next(error);
  }
};

const likePost = async (req, res, next) => {
  const postId = req.params.pid;
  let post;
  let notification;
  const { userId } = req.body;

  if (userId != req.userData.userId) {
    const err = new HttpError("Only the user can send the request.", 422);
    return next(err);
  }

  try {
    post = await Post.findById(postId);
  } catch (error) {
    return next(error);
  }

  try {
    const index = post.likes.indexOf(userId);
    if (index < 0) {
      post.likes.push(userId);
      await post.save();
    }
  } catch (error) {
    return next(error);
  }

  if (!post) {
    const err = new HttpError("Could not find the post!", 500);
    return next(err);
  }

  const owner = await User.findById(post.author.id);

  if (userId != post.author.id) {
    notification = new Notification({
      owner: post.author.id,
      user: { id: userId },
      postId: postId,
      message: "liked your post.",
      date: new Date(),
    });
  }

  try {
    if (userId != post.author.id) {
      owner.new_notification++;
      await notification.save();
      await owner.save();
    }
  } catch (error) {
    return next(error);
  }

  res.json({ message: "Post Liked!" });
};

const unlikePost = async (req, res, next) => {
  const postId = req.params.pid;
  let post;
  const { userId } = req.body;

  if (userId != req.userData.userId) {
    const err = new HttpError("Only the user can send the request.", 422);
    return next(err);
  }

  try {
    post = await Post.findById(postId);
  } catch (error) {
    return next(error);
  }

  try {
    const index = post.likes.indexOf(userId);
    if (index > -1) {
      post.likes.splice(index, 1);
      await post.save();
    }
  } catch (error) {
    return next(error);
  }

  if (!post) {
    const err = new HttpError("Could not find the post!", 500);
    return next(err);
  }

  res.json({ message: "Post Unliked!" });
};

const getPostLikes = async (req, res, next) => {
  const postId = req.params.pid;
  let post;
  let likes = [];

  try {
    post = await Post.findById(postId);
  } catch (error) {
    return next(error);
  }

  if (!post) {
    const err = new HttpError("Post doesn't exist!", 401);
    return next(err);
  }

  for (let i = 0; i < post.likes.length; i++) {
    let user;

    user = await User.findById(post.likes[i]);

    likes.push(user);
  }

  res.status(200).json({ likes: likes });
};

const savePost = async (req, res, next) => {
  const postId = req.params.pid;
  const { userId } = req.body;
  let user;
  let post;

  if (userId != req.userData.userId) {
    const err = new HttpError("Only the user can send the request.", 422);
    return next(err);
  }

  try {
    post = await Post.findById(postId);
  } catch (error) {
    return next(error);
  }

  if (!post) {
    const err = new HttpError("Post doesn't exist!", 401);
    return next(err);
  }

  try {
    user = await User.findById(userId);
  } catch (error) {
    return next(error);
  }

  if (!user) {
    const err = new HttpError("User doesn't exist!", 401);
    return next(err);
  }

  if (user.saved_posts.includes(postId)) {
    const err = new HttpError("Post already saved.", 401);
    return next(err);
  }

  try {
    user.saved_posts.push(post);
    await user.save();
  } catch (error) {
    return next(error);
  }

  res.status(200).json({ message: "Post saved!" });
};

const unsavePost = async (req, res, next) => {
  const postId = req.params.pid;
  const { userId } = req.body;
  let user;
  let post;

  if (userId != req.userData.userId) {
    const err = new HttpError("Only the user can send the request.", 422);
    return next(err);
  }

  try {
    post = await Post.findById(postId);
  } catch (error) {
    return next(error);
  }

  if (!post) {
    const err = new HttpError("Post doesn't exist!", 401);
    return next(err);
  }

  try {
    user = await User.findById(userId);
  } catch (error) {
    return next(error);
  }

  if (!user) {
    const err = new HttpError("User doesn't exist!", 401);
    return next(err);
  }

  try {
    const index = user.saved_posts.indexOf(postId);
    if (index > -1) {
      user.saved_posts.splice(index, 1);
      await user.save();
    }
  } catch (error) {
    return next(error);
  }

  res.status(200).json({ message: "Post unsaved!" });
};

exports.getPostById = getPostById;
exports.getPostByUsername = getPostByUsername;
exports.createPosts = createPosts;
exports.deletePost = deletePost;
exports.getPosts = getPosts;
exports.likePost = likePost;
exports.unlikePost = unlikePost;
exports.getTimelinePost = getTimelinePost;
exports.getPostLikes = getPostLikes;
exports.savePost = savePost;
exports.unsavePost = unsavePost;
exports.editPost = editPost;
