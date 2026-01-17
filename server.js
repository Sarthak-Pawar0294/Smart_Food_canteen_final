import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

// IMPORT THE SEED FUNCTION
import { seedUsers } from './src/db/add-user.js';

// --------------------------------------
// SETUP
// --------------------------------------
const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OWNER_EMAIL = "canteen@vit.edu";
const PORT = process.env.PORT || 3001;

// --------------------------------------
// SQLITE SETUP
// --------------------------------------
const db = new Database("database.db");

// 1. Create Tables
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT,
  prn_hash TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY, 
  user_id INTEGER,
  items TEXT,
  total REAL,
  status TEXT,
  payment_method TEXT,
  payment_status TEXT,
  payment_time TEXT,
  valid_till_time TEXT,
  payment_data TEXT,
  created_at TEXT
);
`);

// 2. CLEANUP AND SEED
// Wipe tables to remove test users/orders and reset ID counters
console.log("🧹 Cleaning up old/test data...");
db.exec(`
  DELETE FROM orders;
  DELETE FROM users;
  DELETE FROM sqlite_sequence WHERE name='users';
`);

// Re-seed only the official users from add-user.js
seedUsers(db);

// --------------------------------------
// SERVE FRONTEND
// --------------------------------------
const distPath = join(__dirname, "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// --------------------------------------
// LOGIN ENDPOINT
// --------------------------------------
app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Updated Regex: Accepts any numeric length for PRN (supports 5-digit test IDs and 10-digit real PRNs)
    const emailRegex = /^[a-z]+\.[0-9]+@vit\.edu$/i;

    if (!emailRegex.test(email) && email !== OWNER_EMAIL) {
      return res.status(400).json({ error: "Invalid email format. Format: firstname.PRN@vit.edu" });
    }

    const prnFromEmail =
      email === OWNER_EMAIL
        ? "canteen"
        : email.match(/\.(\d+)@/)?.[1];

    if (!prnFromEmail) {
      return res.status(400).json({ error: "Could not extract PRN from email" });
    }

    if (password !== prnFromEmail) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = db.prepare(
      "SELECT id, email, full_name, role FROM users WHERE email = ? AND prn_hash = ?"
    ).get(email, password);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: email === OWNER_EMAIL ? "OWNER" : "STUDENT"
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// --------------------------------------
// CREATE ORDER
// --------------------------------------
app.post('/api/orders', (req, res) => {
  try {
    const { userId, items, total, paymentMethod, paymentStatus } = req.body;

    if (!userId || !items || !total) {
