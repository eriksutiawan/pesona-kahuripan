// server/routes/auth.js — Admin Authentication Routes
const express = require('express');
const bcrypt = require('bcryptjs');
const { dbGet } = require('../database');
const { signSession } = require('../sessionHelper');
const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi.' });
    }
    const users = await dbGet('users') || [];
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }
    const token = signSession({ adminId: user.id, adminName: user.name });
    res.cookie('pk_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || !!process.env.VERCEL,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    res.json({ success: true, name: user.name, message: 'Login berhasil!' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('pk_session');
  res.json({ success: true, message: 'Logout berhasil.' });
});

// GET /api/auth/check
router.get('/check', (req, res) => {
  if (req.session && req.session.adminId) {
    res.json({ loggedIn: true, name: req.session.adminName });
  } else {
    res.json({ loggedIn: false });
  }
});

module.exports = router;
