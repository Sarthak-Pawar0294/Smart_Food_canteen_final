import express, { Request, Response } from 'express';
import cors from 'cors';
import pkg from 'pg';

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const OWNER_EMAIL = 'canteen@vit.edu';

app.post('/api/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const emailRegex = /^[a-zA-Z]+\.[0-9]+@vit\.edu$/;
    if (!emailRegex.test(email) && email !== OWNER_EMAIL) {
      return res.status(400).json({ error: 'Invalid email format. Use: firstname.PRN@vit.edu' });
    }

    let prnFromEmail = '';
    if (email === OWNER_EMAIL) {
      prnFromEmail = 'canteen';
    } else {
      prnFromEmail = email.split('.')[1].split('@')[0];
    }

    if (password !== prnFromEmail) {
      return res.status(401).json({ error: 'Invalid credentials. Password must match PRN.' });
    }

    const result = await pool.query(
      'SELECT id, email, role, full_name FROM users WHERE email = $1 AND prn_hash = $2',
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found or invalid credentials' });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const { userId, items, total, paymentMethod, paymentStatus } = req.body;

    if (!userId || !items || !total) {
      return res.status(400).json({ error: 'Missing required fields: userId, items, total' });
    }

    const userResult = await pool.query(
      'SELECT email, full_name FROM users WHERE id = $1',
      [userId]
    );

    const userData = userResult.rows[0];
    const paymentTime = new Date().toISOString();
    const validTillTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    const paymentData = {
      studentName: userData?.full_name || 'Student',
      studentEmail: userData?.email || '',
    };

    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, items, total, status, payment_method, payment_status, payment_time, valid_till_time, payment_data)
       VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, JSON.stringify(items), total, paymentMethod || 'CASH', paymentStatus || 'CASH', paymentTime, validTillTime, JSON.stringify(paymentData)]
    );

    const order = orderResult.rows[0];

    const receipt = {
      studentName: userData?.full_name || 'Student',
      studentEmail: userData?.email || '',
      orderId: order.id,
      items: items,
      totalAmount: total,
      paymentMethod: paymentMethod || 'CASH',
      paymentStatus: paymentStatus === 'PAID' ? 'SUCCESS' : 'PENDING',
      paymentTime: paymentTime,
      validTillTime: validTillTime,
    };

    res.status(201).json({ success: true, order, receipt });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/api/orders/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({ success: true, orders: result.rows });
  } catch (error: any) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/orders/all', async (req: Request, res: Response) => {
  try {
    const ownerEmail = req.headers['x-owner-email'];

    if (ownerEmail !== OWNER_EMAIL) {
      return res.status(403).json({ error: 'Unauthorized. Only owner can access all orders.' });
    }

    const result = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC'
    );

    res.json({ success: true, orders: result.rows });
  } catch (error: any) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.patch('/api/orders/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const ownerEmail = req.headers['x-owner-email'];

    if (ownerEmail !== OWNER_EMAIL) {
      return res.status(403).json({ error: 'Unauthorized. Only owner can update orders.' });
    }

    if (!status || !['ACCEPTED', 'READY', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be: ACCEPTED, READY, or COMPLETED' });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ success: true, order: result.rows[0] });
  } catch (error: any) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

app.get('/api/healthz', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Smart Food Canteen API is running' });
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend API running on port ${PORT}`);
});
