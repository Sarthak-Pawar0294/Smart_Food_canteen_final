import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

// --------------------------------------
// SETUP
// --------------------------------------
const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OWNER_EMAIL = "canteen@vit.edu";

// --------------------------------------
// SQLITE SETUP
// --------------------------------------
const db = new Database("database.db");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT,
  prn_hash TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  items TEXT,
  total REAL,
  status TEXT,
  payment_method TEXT,
  payment_status TEXT,
  payment_time TEXT,
  valid_till_time TEXT,
  payment_data TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);
`);

// --------------------------------------
// SERVE FRONTEND
// --------------------------------------
const distPath = join(__dirname, "dist");
if (fs.existsSync(distPath)) {
  console.log("✔ Serving frontend from DIST folder");
  app.use(express.static(distPath));
} else {
  console.log("⚠ No dist folder found — using Vite dev server instead");
}

// --------------------------------------
// LOGIN ENDPOINT
// --------------------------------------
app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;

    const emailRegex = /^[a-z]+\.[0-9]{10}@vit\.edu$/i;

    if (!emailRegex.test(email) && email !== OWNER_EMAIL) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const prnFromEmail =
      email === OWNER_EMAIL
        ? "canteen"
        : email.match(/\.(\d{10})@/)?.[1];

    if (!prnFromEmail) {
      return res.status(400).json({ error: "Invalid email format" });
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
// CREATE ORDER  (PATCH FIXED HERE)
// --------------------------------------
app.post('/api/orders', (req, res) => {
  try {
    const { userId, items, total, paymentMethod, paymentStatus } = req.body;

    if (!userId || !items || !total) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const user = db.prepare(
      "SELECT email, full_name FROM users WHERE id = ?"
    ).get(userId);

    const paymentTime = new Date().toISOString();
    const validTillTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    const paymentData = {
      studentName: user?.full_name || "Student",
      studentEmail: user?.email || ""
    };

    // ★★★★★ PATCH APPLIED HERE ★★★★★
    const result = db.prepare(`
      INSERT INTO orders 
      (user_id, items, total, status, payment_method, payment_status,
       payment_time, valid_till_time, payment_data, created_at)
      VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, datetime('now', 'localtime'))
    `).run(
      userId,
      JSON.stringify(items),
      total,
      paymentMethod || "CASH",
      paymentStatus || "CASH",
      paymentTime,
      validTillTime,
      JSON.stringify(paymentData)
    );

    const order = db.prepare("SELECT * FROM orders WHERE id = ?")
      .get(result.lastInsertRowid);

    const receipt = {
      studentName: paymentData.studentName,
      studentEmail: paymentData.studentEmail,
      orderId: order.id,
      items,
      totalAmount: total,
      paymentMethod: paymentMethod || "CASH",
      paymentStatus: paymentStatus === "PAID" ? "SUCCESS" : "PENDING",
      paymentTime,
      validTillTime,
      orderStatus: order.status
    };

    return res.json({ success: true, order, receipt });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create order" });
  }
});

// --------------------------------------
// GET ALL ORDERS (OWNER ONLY)
// --------------------------------------
app.get('/api/orders/all', (req, res) => {
  try {
    const ownerEmail = req.headers["x-owner-email"];

    if (ownerEmail !== OWNER_EMAIL) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const orders = db.prepare(`
      SELECT * FROM orders
      ORDER BY id DESC
    `).all();

    return res.json({ success: true, orders });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// --------------------------------------
// GET USER ORDERS
// --------------------------------------
app.get('/api/orders/:userId', (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT * FROM orders
      WHERE user_id = ?
      ORDER BY id DESC
    `).all(req.params.userId);

    return res.json({ success: true, orders });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// --------------------------------------
// UPDATE ORDER STATUS (OWNER ONLY)
// --------------------------------------
app.patch('/api/orders/:orderId', (req, res) => {
  try {
    const ownerEmail = req.headers["x-owner-email"];

    if (ownerEmail !== OWNER_EMAIL) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { status } = req.body;

    if (!["ACCEPTED", "READY", "COMPLETED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    db.prepare("UPDATE orders SET status = ? WHERE id = ?")
      .run(status, req.params.orderId);

    const updated = db.prepare("SELECT * FROM orders WHERE id = ?")
      .get(req.params.orderId);

    return res.json({ success: true, order: updated });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update order" });
  }
});

// --------------------------------------
// HEALTH CHECK
// --------------------------------------
app.get('/api/healthz', (req, res) => {
  return res.json({ status: "ok", message: "API running" });
});

// --------------------------------------
// SPA FALLBACK
// --------------------------------------
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

// --------------------------------------
// START SERVER
// --------------------------------------
app.listen(3001, () => {
  console.log("✔ SQLite backend running on port 3001");
});