import sqlite3 from "sqlite3";
sqlite3.verbose();

const db = new sqlite3.Database('database.db');

// ADD ALL USERS HERE
const users = [
  {
    email: "harshad.1251090072@vit.edu",
    full_name: "Harshad Pawar",
    role: "STUDENT",
    prn_hash: "1251090072"
  },
  {
    email: "sarthak.1251090107@vit.edu",
    full_name: "Sarthak Pawar",
    role: "STUDENT",
    prn_hash: "1251090107"
  },
  {
    email: "gaurav.125090175@vit.edu",
    full_name: "Gaurav Pawar",
    role: "STUDENT",
    prn_hash: "1251090175"
  },
  {
    email: "sanyam.1251090397@vit.edu",
    full_name: "Sanyam Pawar",
    role: "STUDENT",
    prn_hash: "1251090397"
  },
  {
    email: "canteen@vit.edu",
    full_name: "Canteen Admin",
    role: "OWNER",
    prn_hash: "canteen"
  }
];

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

  const stmt = db.prepare(
    "INSERT OR IGNORE INTO users (id, email, full_name, role, prn_hash) VALUES (hex(randomblob(16)), ?, ?, ?, ?)"
  );

  users.forEach((u) => {
    stmt.run([u.email, u.full_name, u.role, u.prn_hash]);
  });

  stmt.finalize();
  db.close();

  console.log("Users inserted successfully!");
});