const express = require("express");
const { check } = require("express-validator");

const usersControllers = require("../controllers/user-controllers");

const router = express.Router();

router.get("/", usersControllers.getUsers);

router.get("/:uid", usersControllers.getUserById);

router.post(
  "/signup",
  [
    check("username").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersControllers.signup
);

router.post("/login", usersControllers.login);

module.exports = router;
