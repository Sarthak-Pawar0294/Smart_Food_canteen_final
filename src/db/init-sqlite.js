import sqlite3 from "sqlite3";

const db = new sqlite3.Database("database.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      full_name TEXT,
      role TEXT,
      prn_hash TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      items TEXT,
      total REAL,
      status TEXT,
      payment_method TEXT,
      payment_status TEXT,
      payment_time TEXT,
      valid_till_time TEXT,
      payment_data TEXT,
      created_at TEXT
    )
  `);
});

db.close();

console.log("SQLite tables created!");