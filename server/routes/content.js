// server/routes/content.js — Public Content API
const express = require('express');
const { dbGet } = require('../database');
const router = express.Router();

// GET /api/content/all — Returns all public content
router.get('/all', async (req, res) => {
  try {
    const data = {
      hero: await dbGet('hero'),
      stats: await dbGet('stats'),
      settings: await dbGet('settings'),
      products: await dbGet('products'),
      testimonials: await dbGet('testimonials'),
      gallery: await dbGet('gallery'),
      faq: await dbGet('faq'),
      keunggulan: await dbGet('keunggulan'),
      news: await dbGet('news') || [],
      projects: await dbGet('projects') || []
    };
    res.json({ success: true, data });
  } catch (err) {
    console.error('Content error:', err);
    res.status(500).json({ error: 'Gagal memuat konten.' });
  }
});

module.exports = router;
