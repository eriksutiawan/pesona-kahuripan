// server/routes/admin.js — Protected Admin CRUD API (Supabase Migrated)
const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { dbGet, dbSet } = require('../database');
const router = express.Router();

// ─── HERO ──────────────────────────────────────────────
router.get('/hero', async (req, res) => {
  try {
    res.json({ success: true, data: await dbGet('hero') });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/hero', async (req, res) => {
  try {
    const current = await dbGet('hero') || {};
    const updated = { ...current, ...req.body, updated_at: new Date().toISOString() };
    await dbSet('hero', updated);
    res.json({ success: true, message: 'Hero berhasil diperbarui.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── STATS ─────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const items = await dbGet('stats') || [];
    res.json({ success: true, data: items.sort((a, b) => a.order - b.order) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/stats/:id', async (req, res) => {
  try {
    const items = await dbGet('stats') || [];
    const idx = items.findIndex(x => x.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Statistik tidak ditemukan.' });
    items[idx] = { ...items[idx], ...req.body };
    await dbSet('stats', items);
    res.json({ success: true, message: 'Statistik berhasil diperbarui.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── SETTINGS ──────────────────────────────────────────
router.get('/settings', async (req, res) => {
  try {
    res.json({ success: true, data: await dbGet('settings') });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/settings', async (req, res) => {
  try {
    const current = await dbGet('settings') || {};
    const updated = { ...current, ...req.body, updated_at: new Date().toISOString() };
    await dbSet('settings', updated);
    res.json({ success: true, message: 'Pengaturan berhasil disimpan.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── PRODUCTS ──────────────────────────────────────────
router.get('/products', async (req, res) => {
  try {
    const items = await dbGet('products') || [];
    res.json({ success: true, data: items.sort((a, b) => a.order - b.order) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/products', async (req, res) => {
  try {
    const items = await dbGet('products') || [];
    const product = {
      id: 'prod-' + uuidv4().split('-')[0],
      ...req.body,
      order: items.length + 1,
      is_featured: req.body.is_featured === 'true' || req.body.is_featured === true,
      created_at: new Date().toISOString()
    };
    items.push(product);
    await dbSet('products', items);
    res.json({ success: true, message: 'Produk berhasil ditambahkan.', data: product });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/products/:id', async (req, res) => {
  try {
    const items = await dbGet('products') || [];
    const idx = items.findIndex(x => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Produk tidak ditemukan.' });
    const current = items[idx];
    const update = { ...current, ...req.body, is_featured: req.body.is_featured === 'true' || req.body.is_featured === true };
    items[idx] = update;
    await dbSet('products', items);
    res.json({ success: true, message: 'Produk berhasil diperbarui.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const items = await dbGet('products') || [];
    const filtered = items.filter(x => x.id !== req.params.id);
    filtered.forEach((x, i) => x.order = i + 1); // reindex order
    await dbSet('products', filtered);
    res.json({ success: true, message: 'Produk berhasil dihapus.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── TESTIMONIALS ──────────────────────────────────────
router.get('/testimonials', async (req, res) => {
  try {
    const items = await dbGet('testimonials') || [];
    res.json({ success: true, data: items.sort((a, b) => a.order - b.order) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/testimonials', async (req, res) => {
  try {
    const items = await dbGet('testimonials') || [];
    const testi = {
      id: 'testi-' + uuidv4().split('-')[0],
      ...req.body,
      stars: parseInt(req.body.stars) || 5,
      order: items.length + 1,
      created_at: new Date().toISOString()
    };
    items.push(testi);
    await dbSet('testimonials', items);
    res.json({ success: true, message: 'Testimoni berhasil ditambahkan.', data: testi });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/testimonials/:id', async (req, res) => {
  try {
    const items = await dbGet('testimonials') || [];
    const idx = items.findIndex(x => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Testimoni tidak ditemukan.' });
    items[idx] = { ...items[idx], ...req.body, stars: parseInt(req.body.stars) || 5 };
    await dbSet('testimonials', items);
    res.json({ success: true, message: 'Testimoni berhasil diperbarui.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/testimonials/:id', async (req, res) => {
  try {
    const items = await dbGet('testimonials') || [];
    const filtered = items.filter(x => x.id !== req.params.id);
    filtered.forEach((x, i) => x.order = i + 1); // reindex
    await dbSet('testimonials', filtered);
    res.json({ success: true, message: 'Testimoni berhasil dihapus.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── GALLERY ───────────────────────────────────────────
router.get('/gallery', async (req, res) => {
  try {
    const items = await dbGet('gallery') || [];
    res.json({ success: true, data: items.sort((a, b) => a.order - b.order) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/gallery', async (req, res) => {
  try {
    const items = await dbGet('gallery') || [];
    const item = {
      id: 'gal-' + uuidv4().split('-')[0],
      url: req.body.url,
      caption: req.body.caption || '',
      order: items.length + 1,
      created_at: new Date().toISOString()
    };
    items.push(item);
    await dbSet('gallery', items);
    res.json({ success: true, message: 'Foto berhasil ditambahkan.', data: item });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/gallery/:id', async (req, res) => {
  try {
    const items = await dbGet('gallery') || [];
    const idx = items.findIndex(x => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Foto tidak ditemukan.' });
    items[idx] = { ...items[idx], ...req.body };
    await dbSet('gallery', items);
    res.json({ success: true, message: 'Foto berhasil diperbarui.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/gallery/:id', async (req, res) => {
  try {
    const items = await dbGet('gallery') || [];
    const filtered = items.filter(x => x.id !== req.params.id);
    filtered.forEach((x, i) => x.order = i + 1); // reindex
    await dbSet('gallery', filtered);
    res.json({ success: true, message: 'Foto berhasil dihapus.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── FAQ ───────────────────────────────────────────────
router.get('/faq', async (req, res) => {
  try {
    const items = await dbGet('faq') || [];
    res.json({ success: true, data: items.sort((a, b) => a.order - b.order) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/faq', async (req, res) => {
  try {
    const items = await dbGet('faq') || [];
    const item = {
      id: 'faq-' + uuidv4().split('-')[0],
      question: req.body.question,
      answer: req.body.answer,
      order: items.length + 1,
      created_at: new Date().toISOString()
    };
    items.push(item);
    await dbSet('faq', items);
    res.json({ success: true, message: 'FAQ berhasil ditambahkan.', data: item });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/faq/:id', async (req, res) => {
  try {
    const items = await dbGet('faq') || [];
    const idx = items.findIndex(x => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'FAQ tidak ditemukan.' });
    items[idx] = { ...items[idx], ...req.body };
    await dbSet('faq', items);
    res.json({ success: true, message: 'FAQ berhasil diperbarui.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/faq/:id', async (req, res) => {
  try {
    const items = await dbGet('faq') || [];
    const filtered = items.filter(x => x.id !== req.params.id);
    filtered.forEach((x, i) => x.order = i + 1); // reindex
    await dbSet('faq', filtered);
    res.json({ success: true, message: 'FAQ berhasil dihapus.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── KEUNGGULAN ────────────────────────────────────────
router.get('/keunggulan', async (req, res) => {
  try {
    const items = await dbGet('keunggulan') || [];
    res.json({ success: true, data: items.sort((a, b) => a.order - b.order) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/keunggulan/:id', async (req, res) => {
  try {
    const items = await dbGet('keunggulan') || [];
    const idx = items.findIndex(x => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Keunggulan tidak ditemukan.' });
    items[idx] = { ...items[idx], ...req.body };
    await dbSet('keunggulan', items);
    res.json({ success: true, message: 'Keunggulan berhasil diperbarui.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── CHANGE PASSWORD ───────────────────────────────────
router.put('/password', async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const users = await dbGet('users') || [];
    const idx = users.findIndex(x => x.id === req.session.adminId);
    if (idx === -1) return res.status(404).json({ error: 'User tidak ditemukan.' });
    const user = users[idx];
    if (!bcrypt.compareSync(current_password, user.password)) {
      return res.status(401).json({ error: 'Password lama salah.' });
    }
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ error: 'Password baru minimal 6 karakter.' });
    }
    user.password = bcrypt.hashSync(new_password, 10);
    users[idx] = user;
    await dbSet('users', users);
    res.json({ success: true, message: 'Password berhasil diubah.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── NEWS ──────────────────────────────────────────────
router.get('/news', async (req, res) => {
  try {
    const items = await dbGet('news') || [];
    res.json({ success: true, data: items.sort((a, b) => a.order - b.order) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/news', async (req, res) => {
  try {
    const items = await dbGet('news') || [];
    const item = {
      id: 'news-' + uuidv4().split('-')[0],
      title: req.body.title,
      date: req.body.date || new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }),
      image: req.body.image || '/images/news_1.jpg',
      excerpt: req.body.excerpt,
      order: items.length + 1,
      created_at: new Date().toISOString()
    };
    items.push(item);
    await dbSet('news', items);
    res.json({ success: true, message: 'Berita berhasil ditambahkan.', data: item });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/news/:id', async (req, res) => {
  try {
    const items = await dbGet('news') || [];
    const idx = items.findIndex(x => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Berita tidak ditemukan.' });
    items[idx] = { ...items[idx], ...req.body };
    await dbSet('news', items);
    res.json({ success: true, message: 'Berita berhasil diperbarui.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/news/:id', async (req, res) => {
  try {
    const items = await dbGet('news') || [];
    const filtered = items.filter(x => x.id !== req.params.id);
    filtered.forEach((x, i) => x.order = i + 1); // reindex
    await dbSet('news', filtered);
    res.json({ success: true, message: 'Berita berhasil dihapus.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── PROJECTS ──────────────────────────────────────────
router.get('/projects', async (req, res) => {
  try {
    const items = await dbGet('projects') || [];
    res.json({ success: true, data: items.sort((a, b) => a.order - b.order) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/projects', async (req, res) => {
  try {
    const items = await dbGet('projects') || [];
    const item = {
      id: uuidv4().split('-')[0],
      title: req.body.title,
      status: req.body.status,
      statusClass: req.body.statusClass || 'status-active',
      location: req.body.location,
      types: req.body.types,
      features: req.body.features,
      waMessage: req.body.waMessage,
      order: items.length + 1,
      created_at: new Date().toISOString()
    };
    items.push(item);
    await dbSet('projects', items);
    res.json({ success: true, message: 'Cluster/Proyek berhasil ditambahkan.', data: item });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/projects/:id', async (req, res) => {
  try {
    const items = await dbGet('projects') || [];
    const idx = items.findIndex(x => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Cluster/Proyek tidak ditemukan.' });
    items[idx] = { ...items[idx], ...req.body };
    await dbSet('projects', items);
    res.json({ success: true, message: 'Cluster/Proyek berhasil diperbarui.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    const items = await dbGet('projects') || [];
    const filtered = items.filter(x => x.id !== req.params.id);
    filtered.forEach((x, i) => x.order = i + 1); // reindex
    await dbSet('projects', filtered);
    res.json({ success: true, message: 'Cluster/Proyek berhasil dihapus.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
