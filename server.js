import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

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
    const emailRegex = /^[a-z]+\.[0-9]{10}@vit\.edu$/i;

    if (!emailRegex.test(email) && email !== OWNER_EMAIL) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const prnFromEmail = email === OWNER_EMAIL ? "canteen" : email.match(/\.(\d{10})@/)?.[1];

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

    if (!userId || !items || items.length === 0 || !total) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    const user = db.prepare("SELECT email, full_name FROM users WHERE id = ?").get(userId);

    const now = new Date();
    const paymentTime = now.toISOString();
    const createdAt = now.toISOString();
    const validTillTime = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
    const orderId = randomUUID();

    const paymentData = {
      studentName: user?.full_name || "Student",
      studentEmail: user?.email || ""
    };

    const stmt = db.prepare(`
      INSERT INTO orders 
      (id, user_id, items, total, status, payment_method, payment_status,
       payment_time, valid_till_time, payment_data, created_at)
      VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      orderId,
      userId,
      JSON.stringify(items),
      total,
      paymentMethod || "CASH",
      paymentStatus || "CASH",
      paymentTime,
      validTillTime,
      JSON.stringify(paymentData),
      createdAt
    );

    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);

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

    const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
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
    const orders = db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC").all(req.params.userId);
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

    db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.orderId);
    const updated = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.orderId);

    return res.json({ success: true, order: updated });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update order" });
  }
});

// --------------------------------------
// CANCEL ORDER (STUDENT)
// --------------------------------------
app.patch('/api/orders/:orderId/cancel', (req, res) => {
  try {
    const { orderId } = req.params;

    // 1. Check current status
    const order = db.prepare("SELECT status FROM orders WHERE id = ?").get(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // 2. Only allow cancellation if status is 'pending'
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        error: "Cannot cancel order. It has already been processed by the canteen." 
      });
    }

    // 3. Update status to CANCELLED
    db.prepare("UPDATE orders SET status = 'CANCELLED' WHERE id = ?").run(orderId);

    return res.json({ success: true, message: "Order cancelled successfully" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to cancel order" });
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
  if (fs.existsSync(distPath)) {
    res.sendFile(join(__dirname, "dist", "index.html"));
  } else {
    res.status(404).send("Frontend not built. Run 'npm run build'");
  }
});

// --------------------------------------
// START SERVER
// --------------------------------------
app.listen(PORT, () => {
  console.log(`✔ Backend running on port ${PORT}`);
});
