const Post = require("../models/postModel");

exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = new Post({ title, content, author: req.user._id });
    await post.save();
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getposts = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ author: req.user._id });
    res.status(200).json({
      success: true,
      data: {
        posts,
        totalPages: Math.ceil(totalPosts / limit),
        currentPage: page,
        totalPosts,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    let post = await Post.findById(id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    if (post.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: fale, message: "unauthorized to update this post" });
    }
    post.title = title || post.title;
    post.content = content || post.content;

    await post.save();

    res.status(200).json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this post",
      });
    }

    await post.deleteOne({ _id: id });

    res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.commentOnPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const post = await Post.findById(id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const newComment = {
      user: req.user._id,
      comment: comment,
    };

    post.comments.push(newComment);

    await post.save();
    res.status(200).json({ success: true, data: post.comments });
  } catch (err) {
    res.status(500).json({ success: fale, error: err.message });
  }
};

exports.searchPosts = async (req, res) => {
  try {
    const posts = await Post.find({ title: new RegExp(req.query.title, "i") });
    res.status(200).json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
