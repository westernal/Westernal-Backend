const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");
import { SECRET_KEY } from "../security";

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      throw new HttpError("Token is not valid!", 401);
    }

    const decodedToken = jwt.verify(token, SECRET_KEY);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (error) {
    return next(error);
  }
};
