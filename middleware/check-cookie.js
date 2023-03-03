const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");
const security = require("../security");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const { cookies } = req;
    const refreshToken = cookies.refreshToken;

    if (!refreshToken) {
      throw new HttpError("Authentication failed!", 403);
    }
    const decodedToken = jwt.verify(refreshToken, security.secretKey);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (error) {
    return next(error);
  }
};
