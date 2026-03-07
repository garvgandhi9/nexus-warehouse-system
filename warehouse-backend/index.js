const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "nexus-fallback-secret-key";

// =========================
// DATABASE CONNECTION
// =========================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// =========================
// HELPERS
// =========================
const generateId = (arr) => arr.length > 0 ? Math.max(...arr.map(x => x.id)) + 1 : 1;

// =========================
// ADMIN AUTH (LEGACY)
// =========================
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "1234";
const ADMIN_TOKEN = "admin-token-123";

app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ error: "Invalid admin credentials" });
  }
});

function verifyAdmin(req, res, next) {
  const token = req.headers.authorization;
  if (token === ADMIN_TOKEN) {
    next();
  } else {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.isAdmin) {
        req.userId = decoded.id;
        return next();
      }
    } catch (err) { }
    res.status(401).json({ error: "Admin access required" });
  }
}

// =========================
// AUTH ROUTES
// =========================
app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, name, email",
      [name, email, hashedPassword, false]
    );
    const newUser = result.rows[0];
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, token, user: newUser });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: "Email already exists" });
    res.status(500).json({ error: "Signup failed" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, isAdmin: !!user.is_admin }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, isAdmin: !!user.is_admin }
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

function verifyUser(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}

// =========================
// PUBLIC ROUTES
// =========================
app.get("/public/warehouses", async (req, res) => {
  try {
    let query = "SELECT * FROM warehouses WHERE status = 'Available'";
    const params = [];
    const { city, minArea, maxRate } = req.query;

    if (city) {
      params.push(`%${city}%`);
      query += ` AND city ILIKE $${params.length}`;
    }
    if (minArea) {
      params.push(parseInt(minArea));
      query += ` AND area_available >= $${params.length}`;
    }
    if (maxRate) {
      params.push(parseFloat(maxRate));
      query += ` AND rate <= $${params.length}`;
    }

    query += " ORDER BY created_at DESC";
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch warehouses" });
  }
});

app.get("/public/warehouses/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM warehouses WHERE id = $1 AND status = 'Available'", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Warehouse not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Query failed" });
  }
});

app.post("/public/submit", async (req, res) => {
  try {
    const data = req.body;
    let userId = null;
    if (req.headers.authorization) {
      try {
        const decoded = jwt.verify(req.headers.authorization, JWT_SECRET);
        userId = decoded.id;
      } catch (err) { }
    }

    const warehouse_code = data.org_name ? data.org_name.replace(/\s+/g, '-').toLowerCase() + '-' + Date.now() : 'PENDING-' + Date.now();

    // Check if it's a Land Parcel or Warehouse based on 'type' or 'status'
    const isLand = data.type === 'land' || data.status === 'Land Parcel';
    const status = isLand ? 'Land Parcel' : 'pending';

    const query = `
      INSERT INTO warehouses (
        warehouse_code, org_name, city, address, full_address, 
        latitude, longitude, area_available, rate, status, 
        is_prime, category, ceiling_height, docks, floor_strength, 
        term_type, term_duration, description, industries, facilities, 
        contact_person, contact_email, contact_phone, capacity_value, capacity_type,
        lister_type, website, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
      RETURNING *
    `;

    const values = [
      warehouse_code, data.org_name, data.city, data.address, data.full_address,
      data.latitude, data.longitude, data.area_available || data.land_size, data.rate || data.rate_sqft, status,
      data.is_prime || false, data.category || (isLand ? 'Land' : ''), data.ceiling_height, data.docks, data.floor_strength,
      data.term_type, data.term_duration, data.description, data.industries, data.facilities,
      data.contact_person, data.contact_email, data.contact_phone, data.capacity_value || data.land_size, data.capacity_type || 'sq_ft',
      data.lister_type, data.website, userId
    ];

    const result = await pool.query(query, values);
    res.json({ success: true, warehouse: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Submission failed" });
  }
});

app.post("/public/contact", async (req, res) => {
  try {
    const { name, email, phone, message, source, context, category, tier } = req.body;
    await pool.query(
      "INSERT INTO contact_messages (name, email, phone, message, source, context, category, tier) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [name, email, phone, message, source, context, category, tier]
    );
    res.json({ success: true, message: "Enquiry received" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save message" });
  }
});

// =========================
// USER DASHBOARD
// =========================
app.get("/user/warehouses", verifyUser, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM warehouses WHERE user_id = $1 ORDER BY created_at DESC", [req.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user warehouses" });
  }
});

app.put("/user/warehouses/:id", verifyUser, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const query = "UPDATE warehouses SET org_name=$1, city=$2, address=$3, status='pending' WHERE id=$4 AND user_id=$5 RETURNING *";
    const result = await pool.query(query, [data.org_name, data.city, data.address, id, req.userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Warehouse not found" });
    res.json({ success: true, warehouse: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// =========================
// ADMIN ROUTES
// =========================
app.get("/admin/warehouses", verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM warehouses ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Admin fetch failed" });
  }
});

app.get("/admin/users", verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, is_admin, created_at FROM users");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "User fetch failed" });
  }
});

app.get("/admin/messages", verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM contact_messages ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Message fetch failed" });
  }
});

app.delete("/admin/messages/:id", verifyAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM contact_messages WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

app.put("/admin/approve/:id", verifyAdmin, async (req, res) => {
  try {
    await pool.query("UPDATE warehouses SET status = 'Available' WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Approval failed" });
  }
});

app.delete("/admin/delete/:id", verifyAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM warehouses WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`PostgreSQL server running on port ${PORT}`));