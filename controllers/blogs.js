const express = require("express");
const Blog = require("../models/blog");
const jwt = require("jsonwebtoken");
const blogsRouter = express.Router();

// GET all blogs
blogsRouter.get("/", async (req, res, next) => {
  try {
    const blogs = await Blog.find({}).populate("user");
    res.json(blogs);
  } catch (error) {
    next(error);
  }
});

// POST a new blog
blogsRouter.post("/", async (req, res, next) => {
  try {
    // Check for valid token
    if (!req.token) {
      return res.status(401).json({ error: "Token missing or invalid" });
    }

    const decodedToken = jwt.verify(req.token, process.env.SECRET);
    if (!decodedToken.id) {
      return res.status(401).json({ error: "Token missing or invalid" });
    }

    // Create new blog and assign user
    const blog = new Blog({ ...req.body, user: decodedToken.id });
    const savedBlog = await blog.save();

    res.status(201).json(savedBlog);
  } catch (error) {
    next(error);
  }
});

// DELETE a blog by ID
blogsRouter.delete("/:id", async (req, res, next) => {
  try {
    if (!req.token) {
      return res.status(401).json({ error: "Token missing or invalid" });
    }

    const decodedToken = jwt.verify(req.token, process.env.SECRET);

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    if (blog.user.toString() !== decodedToken.id) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this blog" });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// PUT update a blog by ID
blogsRouter.put("/:id", async (req, res, next) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    res.json(updatedBlog);
  } catch (error) {
    next(error);
  }
});

module.exports = blogsRouter;
