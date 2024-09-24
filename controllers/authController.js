const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

exports.register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const user = new User({ name, username, email, password });
    user.save();
    res.status(201).json({ success: true, message: "user created" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
exports.getSingleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (!userToFollow.followers) userToFollow.followers = [];
    if (!currentUser.following) currentUser.followings = [];

    if (userToFollow.followers.includes(currentUser._id)) {
      return res.status(400).json({
        success: false,
        message: "You are already following this user",
      });
    }

    userToFollow.followers.push(currentUser._id);
    currentUser.followings.push(userToFollow._id);

    await userToFollow.save();
    await currentUser.save();

    const updatedCurrentUser = await User.findById(req.user._id)
      .select("followings")
      .populate("followings", "username");

    const updatedUserTofollow = await User.findById(req.params.id)
      .select("followers")
      .populate("followers", "username");

    res.status(200).json({
      success: true,
      message: "User followed successfully",
      data: {
        following: updatedCurrentUser.followings,
        followers: updatedUserTofollow.followers,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToUnfollow) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!userToUnfollow.followers) userToUnfollow.followers = [];
    if (!currentUser.followings) currentUser.following = [];

    if (!userToUnfollow.followers.includes(currentUser._id)) {
      return res.status(400).json({
        success: false,
        message: "You are not following this user",
      });
    }

    userToUnfollow.followers = userToUnfollow.followers.filter(
      (followerId) => followerId.toString() !== currentUser._id.toString()
    );

    currentUser.followings = currentUser.followings.filter(
      (followingId) => followingId.toString() !== userToUnfollow._id.toString()
    );

    await userToUnfollow.save();
    await currentUser.save();

    const updatedCurrentUser = await User.findById(req.user.id).select(
      "followings"
    );
    const updatedUserToUnfollow = await User.findById(req.params.id).select(
      "followers"
    );

    res.status(200).json({
      success: true,
      message: "User unfollowed successfully",
      data: {
        currentUserFollowing: updatedCurrentUser.followings,
        userToUnfollowFollowers: updatedUserToUnfollow.followers,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "followers",
      "name username"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, followers: user.followers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const users = await User.find({
      $or: [
        { username: new RegExp(req.query.q, "i") },
        { name: new RegExp(req.query.q, "i") },
      ],
    }).select("name username");
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updatePorfile = async (req, res) => {
  try {
    const { name, username } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (name) user.name = name;
    if (username) user.username = username;

    await user.save();

    res.status(200).json({
      success: true,
      message: "profile updated successfully",
      data: user,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.mesage });
  }
};
