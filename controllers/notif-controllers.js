const HttpError = require("../models/http-error");
const Notification = require("../models/notification");

const getNotifsByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let notifications;

  try {
    notifications = await Notification.find({ owner: userId })
      .limit(10)
      .sort({ date: -1 });
  } catch (error) {
    return next(error);
  }

  if (!notifications) {
    const err = new HttpError("user doesn't exists!", 401);
    next(err);
  }

  res.status(200).json({ notifications: notifications });
};

exports.getNotifsByUserId = getNotifsByUserId;
