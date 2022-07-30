const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");
const User = require("../models/user");
const Notification = require("../models/notification");
const fs = require("fs");

const getUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find({}, "-password");
  } catch (error) {
    const err = new HttpError("Getting users failed!", 500);
    return next(err);
  }

  res.json({ users: users });
};

const getUserById = async (req, res, next) => {
  const userId = req.params.uid;

  let user;

  try {
    user = await User.findById(userId);
  } catch (error) {
    return next(error);
  }

  if (!user) {
    const err = new HttpError("user doesn't exists!", 401);
    next(err);
  }

  res.status(200).json({ user: user });
};

const getUserFollowers = async (req, res, next) => {
  const userId = req.params.uid;

  let user;
  let followers = [];

  try {
    user = await User.findById(userId);
  } catch (error) {
    return next(error);
  }

  if (!user) {
    const err = new HttpError("user doesn't exists!", 401);
    next(err);
  }

  for (let i = 0; i < user.followers.length; i++) {
    let follower;

    follower = await User.findById(user.followers[i]);

    followers.push(follower);
  }

  res.status(200).json({ followers: followers });
};

const getUserFollowings = async (req, res, next) => {
  const userId = req.params.uid;

  let user;
  let followings = [];

  try {
    user = await User.findById(userId);
  } catch (error) {
    return next(error);
  }

  if (!user) {
    const err = new HttpError("user doesn't exists!", 401);
    next(err);
  }

  for (let i = 0; i < user.followings.length; i++) {
    let following;

    following = await User.findById(user.followings[i]);

    followings.push(following);
  }

  res.status(200).json({ followings: followings });
};

const editUser = async (req, res, next) => {
  const { username, bio, password } = req.body;
  const userId = req.params.uid;

  let existingUsername;
  let selfUser;
  let user;
  let image;
  let prevImage;

  try {
    existingUsername = await User.findOne({ username: username });
    selfUser = await User.findById(userId);
    prevImage = await selfUser.image;
  } catch (error) {
    console.log(error);
    return next(error);
  }

  if (req.file && prevImage && fs.existsSync(prevImage)) {
    fs.unlink(prevImage, (err) => {});
  }

  if (req.file) {
    image = req.file.path;
  }

  if (existingUsername && existingUsername.username !== selfUser.username) {
    const err = new HttpError("Username already exist!", 422);
    return next(err);
  }

  let hashedPassword;

  try {
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }
  } catch (error) {
    console.log(error);
    return next(error);
  }

  try {
    user = User.findByIdAndUpdate(
      userId,
      {
        username: username,
        bio: bio,
        image: image,
        password: hashedPassword,
      },
      function (err, doc) {
        if (err) {
          return res.send(500, { error: err });
        } else return res.status(200).json({ message: "edited successfully" });
      }
    );
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("user already exists!", 422);
  }

  const { username, email, password } = req.body;

  let existingUser;
  let existingUsername;
  let admin;
  let followings = [];

  try {
    existingUser = await User.findOne({ email: email });
    admin = await User.findOne({ username: "westernal" });
    existingUsername = await User.findOne({ username: username });
  } catch (error) {
    console.log(error);
    return next(error);
  }

  if (existingUser) {
    const err = new HttpError("User already exist!", 422);
    return next(err);
  }

  if (existingUsername) {
    const err = new HttpError("Username already exist!", 422);
    return next(err);
  }

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    console.log(error);
    return next(error);
  }

  const createdUser = new User({
    username: username,
    email: email,
    password: hashedPassword,
    posts: [],
    bio: "Change your information from setting",
  });

  let token;

  try {
    token = jwt.sign(
      { userId: createdUser.id, username: createdUser.username },
      "secret_key"
    );
  } catch (error) {
    console.log(error);
    return next(error);
  }

  try {
    await createdUser.save();
  } catch (error) {
    console.log(error);
    return next(error);
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
  const { username, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ username: username });
  } catch (error) {
    const err = new HttpError("login failed!", 500);
    return next(err);
  }

  if (!existingUser) {
    const err = new HttpError("User doesn't exists!", 401);
    return next(err);
  }

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (error) {
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError("Password is wrong!", 401);
    return next(error);
  }

  let token;

  try {
    token = jwt.sign(
      { userId: existingUser.id, username: existingUser.username },
      "secret_key"
    );
  } catch (error) {
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};

const followUser = async (req, res, next) => {
  const { username } = req.body;
  const userId = req.params.uid;

  let followedUser;
  let followingUser;

  try {
    followedUser = await User.findOne({ username: username });
    followingUser = await User.findById(userId);
  } catch (error) {
    const err = new HttpError("following failed!", 500);
    return next(err);
  }

  if (followedUser === followingUser) {
    const error = new HttpError("You can't follow yourself", 500);
    return next(error);
  }

  try {
    const firstIndex = followedUser.followers.indexOf(followingUser._id);
    if (firstIndex < 0) {
      followedUser.followers.push(followingUser);
    }

    await followedUser.save();

    const secondIndex = followingUser.followings.indexOf(followedUser._id);
    if (secondIndex < 0) {
      followingUser.followings.push(followedUser);
    }

    await followingUser.save();
  } catch (error) {
    return next(error);
  }

  const notification = new Notification({
    owner: followedUser._id,
    user: { id: followingUser._id, username: followUser.username },
    message: "started following you",
    date: new Date(),
  });

  try {
    await notification.save();
  } catch (error) {
    console.log(error);
    return next(error);
  }

  res.status(200).json({ message: "User Followed Successfully!" });
};

const unfollowUser = async (req, res, next) => {
  const { username } = req.body;
  const userId = req.params.uid;

  let unfollowedUser;
  let unfollowingUser;

  try {
    unfollowedUser = await User.findOne({ username: username });
    unfollowingUser = await User.findById(userId);
  } catch (error) {
    const err = new HttpError("unfollowing failed!", 500);
    return next(err);
  }

  try {
    const firstIndex = unfollowedUser.followers.indexOf(unfollowingUser._id);
    if (firstIndex > -1) {
      unfollowedUser.followers.splice(firstIndex, 1);
    }

    const secondIndex = unfollowingUser.followings.indexOf(unfollowedUser._id);
    if (secondIndex > -1) {
      unfollowingUser.followings.splice(secondIndex, 1);
    }

    await unfollowedUser.save();
    await unfollowingUser.save();
  } catch (error) {
    return next(error);
  }
  res.status(200).json({ message: "User Unfollowed Successfully!" });
};

const verifyUser = async (req, res, next) => {
  const userId = req.params.uid;

  let user;

  try {
    user = await User.findById(userId);
  } catch (error) {
    return next(error);
  }

  try {
    user.verified = true;
    await user.save();
  } catch (error) {
    return next(error);
  }

  res.status(200).json({ user: user });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.getUserById = getUserById;
exports.followUser = followUser;
exports.unfollowUser = unfollowUser;
exports.editUser = editUser;
exports.getUserFollowers = getUserFollowers;
exports.getUserFollowings = getUserFollowings;
exports.verifyUser = verifyUser;
