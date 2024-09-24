const express = require("express");
const {
  createPost,
  getposts,
  updatePost,
  deletePost,
  commentOnPost,
} = require("../controllers/postController");
const { searchPosts } = require("../controllers/postController");
const { protect } = require("../middlewares/authmiddleware");
const router = express.Router();

// router.route("/").post(createPost).get(getposts);

router.post("/", protect, createPost);
router.get("/", protect, getposts);
router.get("/searchpost", protect, searchPosts);

router.route("/:id").put(protect, updatePost).delete(protect, deletePost);

router.route("/:id/comment").post(protect, commentOnPost);

module.exports = router;
