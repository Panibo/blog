require("./setup");

const supertest = require("supertest");
const app = require("../app");
const { test, describe } = require("node:test");
const assert = require("node:assert");

const api = supertest(app);

describe("GET /api/users", () => {
  test("returns users in JSON format and correct count", async () => {
    const response = await api
      .get("/api/users")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(response.body.length, 2, "User count should be 2");
  });
  test("user objects should have 'id' field instead of '_id'", async () => {
    const response = await api.get("/api/users").expect(200);

    response.body.forEach((user) => {
      assert.ok(user.id, "User should have an 'id' field");
      assert.strictEqual(
        user._id,
        undefined,
        "User should not have '_id' field"
      );
    });
  });
});
describe("POST /api/users", () => {
  test("creates a new user", async () => {
    const newUser = {
      username: "charlie",
      name: "Charlie",
      password: "password",
    };

    const response = await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(response.body.username, newUser.username);
    assert.strictEqual(response.body.name, newUser.name);
    assert.strictEqual(response.body.passwordHash, undefined);
  });
  test("fails with status code 400 if any info is missing", async () => {
    // Missing password
    await api
      .post("/api/users")
      .send({ username: "JohnDoe", name: "John Doe" })
      .expect(400);
    // Missing username
    await api
      .post("/api/users")
      .send({ name: "John Doe", password: "1234" })
      .expect(400);
    // Missing name
    await api
      .post("/api/users")
      .send({ username: "JohnDoe", password: "1234" })
      .expect(400);
    // Missing username and name
    await api.post("/api/users").send({ password: "1234" }).expect(400);
    // Missing username and password
    await api.post("/api/users").send({ name: "John Doe" }).expect(400);
    // Missing name and password
    await api.post("/api/users").send({ username: "JohnDoe" }).expect(400);
    // Missing all
    await api.post("/api/users").send({}).expect(400);
  });
  test("fails with status code 400 if username is not unique", async () => {
    const newUser = {
      username: "alice",
      name: "Alice",
      password: "password",
    };

    await api.post("/api/users").send(newUser).expect(400);
  });
  test("fails with status code 400 if username is less than 3 characters", async () => {
    const newUser = {
      username: "JD",
      name: "John Doe",
      password: "1234",
    };

    await api.post("/api/users").send(newUser).expect(400);
  });
  test("fails with status code 400 if password is less than 3 characters", async () => {
    const newUser = {
      username: "JohnDoe",
      name: "John Doe",
      password: "12",
    };

    await api.post("/api/users").send(newUser).expect(400);
  });
});
