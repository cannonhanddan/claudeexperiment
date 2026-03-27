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
