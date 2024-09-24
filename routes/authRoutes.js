const express = require("express");
const {
  register,
  login,
  followUser,
  searchUsers,
  getFollowers,
  unfollowUser,
  getAllUsers,
  getSingleUser,
  updatePorfile,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authmiddleware");

const router = express.Router();

router.get("/", getAllUsers);
router.get("/search", protect, searchUsers);
router.put("/profile", protect, updatePorfile);
router.get("/:id", getSingleUser);

router.post("/register", register);
router.post("/login", login);
router.put("/:id/follow", protect, followUser);
router.put("/:id/unfollow", protect, unfollowUser);
router.get("/:id/followers", protect, getFollowers);

module.exports = router;
