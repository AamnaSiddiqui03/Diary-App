const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

const router = express.Router();

// Test route to verify API is live
router.get('/test', (req, res) => {
  res.status(200).json({ message: "The router is working" });
});

// Signup Route
router.post('/signup', async (req, res) => {
  const { email_id, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email_id = ?', [email_id]);
    if (rows.length > 0) return res.status(409).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (email_id, password) VALUES (?, ?)', [email_id, hashedPassword]);

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email_id, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email_id = ?', [email_id]);
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.user_id, email_id: user.email_id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
