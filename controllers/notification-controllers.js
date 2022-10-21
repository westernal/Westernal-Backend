const HttpError = require("../models/http-error");
const Notification = require("../models/notification");

const getNotificationsByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let notifications;

  try {
    notifications = await Notification.find({ owner: userId })
      .limit(10)
      .sort({ date: -1 });
  } catch (error) {
    return next(error);
  }

  res.status(200).json({ notifications: notifications });
};

const getNotificationsLengthByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let size;

  try {
    size = await Notification.count({ owner: userId });
  } catch (error) {
    return next(error);
  }

  res.status(200).json({ size: size });
};

exports.getNotificationsByUserId = getNotificationsByUserId;
exports.getNotificationsLengthByUserId = getNotificationsLengthByUserId;