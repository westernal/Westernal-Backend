const express = require("express");
const { check } = require("express-validator");

const router = express.Router();

const postControllers = require("../controllers/post-controllers");
const checkAuth = require('../middleware/check-auth');
const fileUpload = require('../middleware/file-upload')



router.get("/:pid", postControllers.getPostById);

router.get("/user/:uid", postControllers.getPostByUserId);

router.use(checkAuth)

router.post('/',
fileUpload.single("image"),
  postControllers.createPosts
);

router.get("/", postControllers.getPosts)

router.delete("/:pid", postControllers.deletePost);
 
module.exports = router;
