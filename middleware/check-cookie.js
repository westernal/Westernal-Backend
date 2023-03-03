const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");
import { SECRET_KEY } from "../security";

module.exports = (req, res, next) => {
  const { cookies } = req;
  const refreshToken = cookies.refreshToken;

  if (!refreshToken) {
    throw new HttpError("Authentication failed!", 403);
  }

  try {
    const decodedToken = jwt.verify(jwt, SECRET_KEY);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (error) {
    return next(error);
  }
};
