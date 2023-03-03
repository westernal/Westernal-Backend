const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const { cookies } = req;
  const refreshToken = cookies.refreshToken;

  try {
    if (!refreshToken) {
      throw new HttpError("Authentication failed!", 403);
    }

    const decodedToken = jwt.verify(jwt, "secret_key");
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (error) {
    return next(error);
  }
};
