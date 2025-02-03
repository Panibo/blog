const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const usersRouter = express.Router();

// GET all users
usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await User.find({}).populate("blogs");
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// POST a new user
usersRouter.post("/", async (request, response, next) => {
  const { username, name, password } = request.body;

  if (!password || password.length < 3) {
    return response
      .status(400)
      .json({ error: "Password must be at least 3 characters long" });
  }
  const saltRounds = 10;

  try {
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user = new User({
      username,
      name,
      passwordHash,
    });

    const savedUser = await user.save();
    response.status(201).json(savedUser);
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
