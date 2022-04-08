const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");

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

const signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("user already exists!", 422);
  }

  const { username, email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    console.log(error);
    return next(error);
  }

  if (existingUser) {
    const err = new HttpError("User already exist!", 422);
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
    image: "req.file.path",
    posts: [],
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
    const err = new HttpError("user doesn't exists!", 401);
    return next(err);
  }

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (error) {
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError("Password is empty.", 401);
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

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.getUserById = getUserById;
