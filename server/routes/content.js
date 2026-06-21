// server/routes/content.js — Public Content API
const express = require('express');
const { db } = require('../database');
const router = express.Router();

// GET /api/content/all — Returns all public content
router.get('/all', (req, res) => {
  try {
    const data = {
      hero: db.get('hero').value(),
      stats: db.get('stats').sortBy('order').value(),
      settings: db.get('settings').value(),
      products: db.get('products').sortBy('order').value(),
      testimonials: db.get('testimonials').sortBy('order').value(),
      gallery: db.get('gallery').sortBy('order').value(),
      faq: db.get('faq').sortBy('order').value(),
      keunggulan: db.get('keunggulan').sortBy('order').value(),
      news: db.get('news').sortBy('order').value() || [],
      projects: db.get('projects').sortBy('order').value() || []
    };
    res.json({ success: true, data });
  } catch (err) {
    console.error('Content error:', err);
    res.status(500).json({ error: 'Gagal memuat konten.' });
  }
});

module.exports = router;
