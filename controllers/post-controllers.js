const HttpError = require("../models/http-error");
const Post = require("../models/posts");
const User = require("../models/user");
const upload = require("express-fileupload");

const { validationResult } = require("express-validator");

const getPosts = async (req, res, next) => {
  let posts;

  try {
    posts = await Post.find({}, "");
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

const getPostByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let posts;

  try {
    posts = await Post.find({ creator: userId });
    console.log(posts);
  } catch (error) {
    console.log(error);
    return next(error);
  }

  if (!posts) {
    const err = new HttpError("Could not find the post!", 500);
    return next(err);
  }

  res.json({ posts: posts });
};

const createPosts = async (req, res, next) => {
  const { title, description, creator } = req.body;

  const createdPost = new Post({
    title: title,
    description: description,
    creator: creator,
    image: req.file.path,
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
    console.log(err);
    return next(err);
  }

  res.status(201).json({ post: createdPost });
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

exports.getPostById = getPostById;
exports.getPostByUserId = getPostByUserId;
exports.createPosts = createPosts;
exports.deletePost = deletePost;
exports.getPosts = getPosts;
