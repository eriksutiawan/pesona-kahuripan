// server/routes/content.js — Public Content API
const express = require('express');
const { dbGet } = require('../database');
const router = express.Router();

// ─── In-memory cache (TTL: 60 seconds) ────────────────────
let _cache = null;
let _cacheTime = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

// GET /api/content/all — Returns all public content
router.get('/all', async (req, res) => {
  try {
    // Serve from cache if fresh
    const now = Date.now();
    if (_cache && (now - _cacheTime) < CACHE_TTL) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({ success: true, data: _cache });
    }

    // Fetch all keys in PARALLEL (not sequential) for speed
    const keys = ['hero', 'stats', 'settings', 'products', 'testimonials', 'gallery', 'faq', 'keunggulan', 'news', 'projects'];
    const values = await Promise.all(keys.map(k => dbGet(k)));

    const data = {};
    keys.forEach((k, i) => { data[k] = values[i] || (k === 'news' || k === 'projects' ? [] : null); });

    // Store in cache
    _cache = data;
    _cacheTime = now;

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=30');
    res.json({ success: true, data });
  } catch (err) {
    console.error('Content error:', err);
    // Return cached data even if stale when error occurs
    if (_cache) return res.json({ success: true, data: _cache, cached: true });
    res.status(500).json({ error: 'Gagal memuat konten.' });
  }
});

function clearCache() {
  _cache = null;
  _cacheTime = 0;
}

// POST /api/content/cache/clear — Clear cache after admin edits
router.post('/cache/clear', (req, res) => {
  clearCache();
  res.json({ success: true, message: 'Cache cleared.' });
});

module.exports = router;
module.exports.clearCache = clearCache;
