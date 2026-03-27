import bcrypt from "bcryptjs";
import Database from "better-sqlite3";

export async function register(
  db: Database.Database,
  email: string,
  password: string
): Promise<{ id: number; email: string }> {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Invalid email");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const hash = await bcrypt.hash(password, 10);

  const result = db
    .prepare("INSERT INTO users (email, password) VALUES (?, ?)")
    .run(email, hash);

  return { id: result.lastInsertRowid as number, email };
}

export async function login(
  db: Database.Database,
  email: string,
  password: string
): Promise<{ id: number; email: string }> {
  const user = db
    .prepare("SELECT id, email, password FROM users WHERE email = ?")
    .get(email) as { id: number; email: string; password: string } | undefined;

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    throw new Error("Invalid email or password");
  }

  return { id: user.id, email: user.email };
}
