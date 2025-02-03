require("./setup");

const supertest = require("supertest");
const app = require("../app");
const Blog = require("../models/blog");
const { test, describe } = require("node:test");
const assert = require("node:assert");

const api = supertest(app);

const loginUser = async (username, password) => {
  const response = await api
    .post("/api/login")
    .send({ username, password })
    .expect(200)
    .expect("Content-Type", /application\/json/);

  return response.body.token;
};

// GET /api/blogs tests

describe("GET /api/blogs", () => {
  test("returns blogs in JSON format", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });
  test("returns blogs in JSON format and correct count", async () => {
    const response = await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(response.body.length, 2, "Blog count should be 2");
  });
  test("blog objects should have 'id' field instead of '_id'", async () => {
    const response = await api.get("/api/blogs").expect(200);

    response.body.forEach((blog) => {
      assert.ok(blog.id, "Blog should have an 'id' field");
      assert.strictEqual(
        blog._id,
        undefined,
        "Blog should not have '_id' field"
      );
    });
  });
});

// POST /api/blogs tests

describe("POST /api/blogs", () => {
  test("creates a new blog post", async () => {
    const newBlog = {
      title: "Test Blog",
      author: "John Doe",
      url: "https://john.doe.com/",
      likes: 5,
    };

    // Login first and get the token
    const token = await loginUser("alice", "password");

    // Make the POST request with the Authorization header
    const response = await api
      .post("/api/blogs")
      .set("authorization", `bearer ${token}`) // Add token to the header
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    assert.deepStrictEqual(response.body, {
      ...newBlog,
      user: response.body.user,
      id: response.body.id,
    });
  });
  test("returns 401 if token is missing", async () => {
    await api.post("/api/blogs").send({}).expect(401);
  });
});

describe("DELETE /api/blogs/:id", () => {
  test("deletes a blog post", async () => {
    const blogs = await Blog.find({});
    const blogToDelete = blogs[0];

    // Login first and get the token
    const token = await loginUser("alice", "password");

    // Make the DELETE request with the Authorization header
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set("authorization", `bearer ${token}`) // Add token to the header
      .expect(204);

    const remainingBlogs = await Blog.find({});
    assert.strictEqual(
      remainingBlogs.length,
      blogs.length - 1,
      "Blog count should be 1 less"
    );
  });
  test("returns 401 if token is missing", async () => {
    const blogs = await Blog.find({});
    const blogToDelete = blogs[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(401);
  });
});

describe("PUT /api/blogs/:id", () => {
  test("updates a blog post", async () => {
    const blogs = await Blog.find({});
    const blogToUpdate = blogs[0];
    const updatedBlog = {
      title: "Updated Blog",
      author: "John Doe",
      url: "https://john.doe.com/",
      likes: 10,
    };

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.deepStrictEqual(
      {
        title: response.body.title,
        author: response.body.author,
        url: response.body.url,
        likes: response.body.likes,
      },
      {
        ...updatedBlog,
      }
    );
  });
  test("returns 404 if blog not found", async () => {
    await api.put("/api/blogs/679f06bdaea8b7991ecba8c3").send({}).expect(404);
  });
  test("returns 400 if id is invalid", async () => {
    await api.put("/api/blogs/123").send({}).expect(400);
  });

  test("wont allow if title or url is missing", async () => {
    const blogs = await Blog.find({});
    const blogToUpdate = blogs[0];

    const newBlog = {
      author: "John Doe",
      likes: 5,
    };

    // title missing
    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ ...newBlog, title: "", url: "https://john.doe.com/" })
      .expect(400);

    // url missing
    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ ...newBlog, title: "Test Blog", url: null })
      .expect(400);
    // both missing
    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ ...newBlog, title: null, url: "" })
      .expect(400);
  });
  test("updates one field if only one field is provided", async () => {
    const blogs = await Blog.find({});
    const blogToUpdate = blogs[0];
    const updatedBlog = {
      title: "Updated Blog",
    };

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    assert.deepStrictEqual(response.body, {
      ...blogToUpdate.toJSON(),
      title: updatedBlog.title,
      user: blogToUpdate.user.toString(),
    });
  });
});
