import { createDb } from "./db";

describe("database", () => {
  it("should create a users table", () => {
    const db = createDb(":memory:");

    const table = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
      )
      .get();

    expect(table).toBeDefined();
  });
});

it("should insert a new user", () => {
  const db = createDb(":memory:");

  const result = db
    .prepare("INSERT INTO users (email, password) VALUES (?, ?)")
    .run("test@example.com", "hashedpassword123");

  expect(result.changes).toBe(1);
});

it("should reject a duplicate email", () => {
  const db = createDb(":memory:");

  db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(
    "test@example.com",
    "hashedpassword123"
  );

  expect(() => {
    db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(
      "test@example.com",
      "anotherpassword"
    );
  }).toThrow();
});
