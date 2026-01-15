import Database from "better-sqlite3";

const db = new Database("database.db");

// Create users table
db.prepare(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  prn_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  full_name TEXT NOT NULL
);
`).run();

// Create orders table
db.prepare(`
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  items TEXT NOT NULL,
  total REAL NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT,
  payment_status TEXT,
  payment_time TEXT,
  valid_till_time TEXT,
  payment_data TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`).run();

console.log("SQLite tables created!");