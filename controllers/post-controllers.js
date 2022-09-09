const HttpError = require("../models/http-error");
const Post = require("../models/posts");
const User = require("../models/user");
const Notification = require("../models/notification");
var validUrl = require("valid-url");

const getPosts = async (req, res, next) => {
  let posts;

  try {
    posts = await Post.find({}, "").sort({ date: -1 });
  } catch (error) {
    const err = new HttpError("Getting posts failed!", 500);
    return next(err);
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
    posts = await Post.find({ creator: user._id }).sort({ date: -1 });
  } catch (error) {
    return next(error);
  }

  if (!posts) {
    const err = new HttpError("Could not find the post!", 400);
    return next(err);
  }

  res.json({ posts: posts, creator: user });
};

const getTimelinePost = async (req, res, next) => {
  const userId = req.params.uid;

  let user;
  let users;
  let posts;

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
    posts = await Post.find({ creator: { $in: users } })
      .limit(10)
      .sort({ date: -1 });
  } catch (error) {
    return next(error);
  }

  if (!posts) {
    const err = new HttpError("Could not find the post!", 500);
    return next(err);
  }

  res.json({ posts: posts });
};

const createPosts = async (req, res, next) => {
  const { title, description, creator, song } = req.body;

  const postDate = new Date();

  if (!validUrl.isUri(song)) {
    const error = new HttpError("URL is not valid!", 422);
    return next(error);
  }

  const createdPost = new Post({
    title: title,
    description: description,
    creator: creator,
    songUrl: song,
    date: postDate,
    likes: [],
  });

  let user;

  try {
    user = await User.findById(creator);
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
    post = await Post.findById(postId).populate("creator");
  } catch (error) {
    return next(error);
  }

  try {
    await post.remove();
    post.creator.posts.pull(post);
    await post.creator.save();
  } catch (error) {
    return next(error);
  }

  res.json({ message: "Post Deleted!" });
};

const likePost = async (req, res, next) => {
  const postId = req.params.pid;

  let post;

  const { userId } = req.body;

  let user;

  try {
    user = await User.findById(userId);
    post = await Post.findById(postId);
  } catch (error) {
    return next(error);
  }

  try {
    const index = post.likes.indexOf(userId);
    if (index < 0) {
      post.likes.push(user);
      await post.save();
    }
  } catch (error) {
    return next(error);
  }

  if (!post) {
    const err = new HttpError("Could not find the post!", 500);
    return next(err);
  }

  const owner = await User.findById(post.creator);

  const notification = new Notification({
    owner: owner,
    user: { id: user._id, username: user.username },
    message: "liked your post.",
    date: new Date(),
  });

  owner.new_notification++;
  await notification.save();
  await owner.save();

  res.json({ message: "Post Liked!" });
};

const unlikePost = async (req, res, next) => {
  const postId = req.params.pid;

  let post;

  const { userId } = req.body;

  let user;

  try {
    user = await User.findById(userId);
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

exports.getPostById = getPostById;
exports.getPostByUsername = getPostByUsername;
exports.createPosts = createPosts;
exports.deletePost = deletePost;
exports.getPosts = getPosts;
exports.likePost = likePost;
exports.unlikePost = unlikePost;
exports.getTimelinePost = getTimelinePost;
exports.getPostLikes = getPostLikes;
