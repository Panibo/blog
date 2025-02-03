const app = require("../app");
const supertest = require("supertest");
const Blog = require("../models/blog");
const User = require("../models/user");
const { after, before } = require("node:test");
const { default: mongoose } = require("mongoose");

const api = supertest(app);

before(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  const initialUsers = [
    {
      username: "alice",
      name: "Alice",
      password: "password",
      blogs: [],
    },
    {
      username: "bob",
      name: "Bob",
      password: "password",
      blogs: [],
    },
  ];

  for (const user of initialUsers) {
    await api.post("/api/users").send(user);
  }

  const users = await api.get("/api/users");

  const initialBlogs = [
    {
      title: "Test Blog 1",
      author: "Alice",
      url: "http://example.com/1",
      likes: 5,
      user: users.body[0].id,
    },
    {
      title: "Test Blog 2",
      author: "Bob",
      url: "http://example.com/2",
      likes: 10,
      user: users.body[1].id,
    },
  ];

  await Blog.insertMany(initialBlogs);

  const blogs = await Blog.find({});
  const allUsers = await User.find({});

  // Assign random blog to each user
  for (const user of allUsers) {
    const randomBlog = blogs[Math.floor(Math.random() * blogs.length)];

    if (!user.blogs.includes(randomBlog._id)) {
      user.blogs.push(randomBlog._id);
      await user.save();
    }
  }
});

after(async () => {
  await mongoose.connection.close();
});
