import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(__dirname, "..", "auth.db");

export function createDb(dbPath: string = DB_PATH): Database.Database {
  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      email       TEXT    NOT NULL UNIQUE,
      password    TEXT    NOT NULL,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);

  return db;
}
