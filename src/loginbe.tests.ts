import { createDb } from "./db";
import bcrypt from "bcryptjs";

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

  it("should store a hashed password", async () => {
    const db = createDb(":memory:");

    const plaintext = "supersecret";
    const hash = await bcrypt.hash(plaintext, 10);

    db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(
      "test@example.com",
      hash
    );

    const user = db
      .prepare("SELECT password FROM users WHERE email = ?")
      .get("test@example.com") as { password: string };

    expect(user.password).not.toBe(plaintext);
    expect(await bcrypt.compare(plaintext, user.password)).toBe(true);
  });

  it("should retrieve a user by email", () => {
    const db = createDb(":memory:");

    db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(
      "test@example.com",
      "hashedpassword123"
    );

    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get("test@example.com") as {
      id: number;
      email: string;
      password: string;
      created_at: string;
    };

    expect(user).toBeDefined();
    expect(user.email).toBe("test@example.com");
    expect(user.id).toBe(1);
  });

  it("should return null for a non-existent email", () => {
    const db = createDb(":memory:");

    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get("nobody@example.com");

    expect(user).toBeUndefined();
  });

  it("should not return the password when retrieving a user", () => {
    const db = createDb(":memory:");

    db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(
      "test@example.com",
      "hashedpassword123"
    );

    const user = db
      .prepare("SELECT id, email, created_at FROM users WHERE email = ?")
      .get("test@example.com") as {
      id: number;
      email: string;
      created_at: string;
    };

    expect(user).toBeDefined();
    expect((user as any).password).toBeUndefined();
  });
});
