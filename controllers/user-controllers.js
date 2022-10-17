const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");
const User = require("../models/user");
const Notification = require("../models/notification");
const fs = require("fs");
var nodemailer = require("nodemailer");
const passwords = require("../security");

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
    const err = new HttpError("User doesn't exist!", 401);
    return next(err);
  }

  res.status(200).json({ user: user });
};

const getUserFollowers = async (req, res, next) => {
  const username = req.params.uname;

  let user;
  let followers;

  try {
    user = await User.findOne({ username: username });
  } catch (error) {
    return next(error);
  }

  if (!user) {
    const err = new HttpError("User doesn't exist!", 401);
    return next(err);
  }

  try {
    followers = await User.find({ _id: { $in: user.followers } });
  } catch (error) {
    return next(error);
  }

  res.status(200).json({ followers: followers });
};

const getUserFollowings = async (req, res, next) => {
  const username = req.params.uname;

  let user;
  let following;

  try {
    user = await User.findOne({ username: username });
  } catch (error) {
    return next(error);
  }

  if (!user) {
    const err = new HttpError("User doesn't exist!", 401);
    return next(err);
  }

  try {
    following = await User.find({ _id: { $in: user.followings } });
  } catch (error) {
    return next(error);
  }

  res.status(200).json({ following: following });
};

const editUser = async (req, res, next) => {
  const { username, bio, password } = req.body;
  const userId = req.params.uid;

  let existingUsername;
  let selfUser;
  let image;
  let prevImage;
  let user;

  try {
    existingUsername = await User.findOne({ username: username });
    selfUser = await User.findById(userId);
    prevImage = await selfUser.image;
  } catch (error) {
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
    return next(error);
  }

  let token;

  try {
    token = jwt.sign({ userId: userId, username: username }, "secret_key");
  } catch (error) {
    return next(error);
  }

  const options = {
    httpOnly: true,
  };

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
        } else
          return res
            .cookie("token", token, options)
            .status(200)
            .json({ token: token });
      }
    );
  } catch (error) {
    return next(error);
  }
};

const changePassword = async (req, res, next) => {
  const { password } = req.body;
  const userId = req.params.uid;

  let user;

  let hashedPassword;

  try {
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }
  } catch (error) {
    return next(error);
  }

  try {
    user = User.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
      },
      function (err, doc) {
        if (err) {
          return res.send(500, { error: err });
        } else
          return res
            .status(200)
            .json({ message: "Password changed successfully!" });
      }
    );
  } catch (error) {
    return next(error);
  }
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new HttpError("User already exists!", 422);
  }

  const { username, email, password } = req.body;

  let existingUser;
  let existingUsername;

  try {
    existingUser = await User.findOne({ email: email });
    existingUsername = await User.findOne({ username: username });
  } catch (error) {
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
    return next(error);
  }

  try {
    await createdUser.save();
  } catch (error) {
    return next(error);
  }

  const options = {
    httpOnly: true,
  };

  res.cookie("token", token, options).status(201).json({ token: token });
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
  const options = {
    httpOnly: true,
  };

  res.cookie("token", token, options).json({
    token: token,
  });
};

const resetPassword = async (req, res, next) => {
  const { email } = req.body;

  let user;

  try {
    user = await User.findOne({ email: email });
  } catch (error) {
    return next(error);
  }

  if (!user) {
    const err = new HttpError("User with this email doesn't exist!", 401);
    return next(err);
  }

  let token;

  try {
    token = jwt.sign({ userId: user._id }, "secret_key", {
      expiresIn: "1h",
    });
  } catch (error) {
    return next(error);
  }

  try {
    var transporter = nodemailer.createTransport({
      host: "alborz.pws-dns.net",
      port: 587,
      secure: false,
      auth: {
        user: "support@contact.westernal.net",
        pass: passwords.emailPassword,
      },
      debug: false,
      logger: true,
    });
  } catch (error) {
    return next(error);
  }

  try {
    var mailOptions = {
      from: "Westernal <support@contact.westernal.net>",
      to: email,
      subject: "Reset your Westernal password",
      html: ` <div class="email" style="width: 100%; height:100%; text-align: center; ">
      <div class="flex" style="display: flex; justify-content:center; ">
          <div class="email-body" style="text-align: center; border-radius: 10px; width: 70vw; margin: 10px; padding: 0 30px 0 30px; box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
    ">
          <img src="https://i.postimg.cc/rp8nKrZD/logo.png" alt="Westernal's logo" style="width: 150px; height:150px;">
          <p style="font-size: 18px; margin-bottom: 50px;">Please click the link below in order to reset your password:</p>
          <a href="https://westernal.net/forgot-password/${token}"         
        style="background-color: #9d38fc; padding:10px; border-radius: 10px; border:none; text-decoration: none; color: white;">Reset password</a>
        <p style="opacity: 0.7; font-size: 14px; margin-top: 20px;">This link will expire in 1 hour.</p>
          <div style="margin-top: 50px;"><p>If this is not you please ignore this email.</p></div>
      </div>
      </div>
      <p style="opacity: 0.7; font-size: 14px;">Westernal - Let the songs talk</p>
  </div>`,
    };
  } catch (error) {
    return next(error);
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      const err = new HttpError("Sending email failed!", 401);
      return next(err);
    } else {
      res.status(200).json({ message: "Email sent." });
    }
  });
};

const googleLogin = async (req, res, next) => {
  const { email } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    const err = new HttpError("Login failed!", 500);
    return next(err);
  }

  if (!existingUser) {
    const err = new HttpError("User doesn't exists!", 401);
    return next(err);
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

  const options = {
    httpOnly: true,
  };

  res.cookie("token", token, options).json({
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
    const err = new HttpError("Following user failed!", 500);
    return next(err);
  }

  if (followedUser._id === followingUser._id) {
    const error = new HttpError("You can't follow yourself", 500);
    return next(error);
  }

  try {
    const firstIndex = followedUser.followers.indexOf(followingUser._id);
    if (firstIndex < 0) {
      followedUser.followers.push(followingUser);
    } else {
      const error = new HttpError("You already follow this user!");
      return next(error);
    }

    await followedUser.save();

    const secondIndex = followingUser.followings.indexOf(followedUser._id);
    if (secondIndex < 0) {
      followingUser.followings.push(followedUser);
    } else {
      const error = new HttpError("You already follow this user!");
      return next(error);
    }

    await followingUser.save();
  } catch (error) {
    return next(error);
  }

  const owner = await User.findById(followedUser._id);

  const notification = new Notification({
    owner: owner,
    user: { id: followingUser._id, username: followingUser.username },
    message: "started following you.",
    date: new Date(),
  });

  try {
    owner.new_notification++;
    await notification.save();
    await owner.save();
  } catch (error) {
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
    const err = new HttpError("Unfollowing user failed!", 500);
    return next(err);
  }

  if (unfollowedUser._id === unfollowingUser._id) {
    const error = new HttpError("You can't follow yourself", 500);
    return next(error);
  }

  try {
    let firstIndex = unfollowedUser.followers.indexOf(unfollowingUser._id);
    if (firstIndex > -1) {
      unfollowedUser.followers.splice(firstIndex, 1);
    } else {
      const error = new HttpError("You don't follow this user!");
      return next(error);
    }

    let secondIndex = unfollowingUser.followings.indexOf(unfollowedUser._id);
    if (secondIndex > -1) {
      unfollowingUser.followings.splice(secondIndex, 1);
    } else {
      const error = new HttpError("You don't follow this user!");
      return next(error);
    }

    await unfollowedUser.save();
    await unfollowingUser.save();
  } catch (error) {
    const err = new HttpError("Unfollowing user failed!", 500);
    return next(err);
  }
  res.status(200).json({ message: "User unfollowed successfully!" });
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

const clearNotification = async (req, res, next) => {
  const userId = req.params.uid;

  let user;

  try {
    user = await User.findById(userId);
  } catch (error) {
    return next(error);
  }

  try {
    user.new_notification = 0;
    await user.save();
  } catch (error) {
    return next(error);
  }

  res.status(200).json({ message: "Notification cleared." });
};

const getNewNotifications = async (req, res, next) => {
  const userId = req.params.uid;

  let user;

  try {
    user = await User.findById(userId);
  } catch (error) {
    return next(error);
  }

  if (user.new_notification) {
    res.status(200).json({ notifications: user.new_notification });
  } else res.status(200).json({ notifications: 0 });
};

const searchUsers = async (req, res, next) => {
  const username = req.params.uname;

  let users;

  try {
    users = await User.find({ username: { $regex: username } });
  } catch (error) {
    return next(error);
  }

  res.status(200).json({ users: users });
};

const getUserSavedPosts = async (req, res, next) => {
  const userId = req.params.uid;

  let user;

  try {
    user = await User.findById(userId);
  } catch (error) {
    return next(error);
  }

  res.status(200).json({ posts: user.saved_posts });
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
exports.googleLogin = googleLogin;
exports.resetPassword = resetPassword;
exports.changePassword = changePassword;
exports.clearNotification = clearNotification;
exports.getNewNotifications = getNewNotifications;
exports.searchUsers = searchUsers;
exports.getUserSavedPosts = getUserSavedPosts;
