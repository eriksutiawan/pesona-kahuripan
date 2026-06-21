// server/routes/admin.js — Protected Admin CRUD API
const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const router = express.Router();

// ─── HERO ──────────────────────────────────────────────
router.get('/hero', (req, res) => {
  res.json({ success: true, data: db.get('hero').value() });
});

router.put('/hero', (req, res) => {
  try {
    db.set('hero', { ...db.get('hero').value(), ...req.body, updated_at: new Date().toISOString() }).write();
    res.json({ success: true, message: 'Hero berhasil diperbarui.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── STATS ─────────────────────────────────────────────
router.get('/stats', (req, res) => {
  res.json({ success: true, data: db.get('stats').sortBy('order').value() });
});

router.put('/stats/:id', (req, res) => {
  try {
    db.get('stats').find({ id: parseInt(req.params.id) }).assign(req.body).write();
    res.json({ success: true, message: 'Statistik berhasil diperbarui.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── SETTINGS ──────────────────────────────────────────
router.get('/settings', (req, res) => {
  res.json({ success: true, data: db.get('settings').value() });
});

router.put('/settings', (req, res) => {
  try {
    db.set('settings', { ...db.get('settings').value(), ...req.body, updated_at: new Date().toISOString() }).write();
    res.json({ success: true, message: 'Pengaturan berhasil disimpan.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── PRODUCTS ──────────────────────────────────────────
router.get('/products', (req, res) => {
  res.json({ success: true, data: db.get('products').sortBy('order').value() });
});

router.post('/products', (req, res) => {
  try {
    const product = {
      id: 'prod-' + uuidv4().split('-')[0],
      ...req.body,
      order: db.get('products').size().value() + 1,
      is_featured: req.body.is_featured === 'true' || req.body.is_featured === true,
      created_at: new Date().toISOString()
    };
    db.get('products').push(product).write();
    res.json({ success: true, message: 'Produk berhasil ditambahkan.', data: product });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/products/:id', (req, res) => {
  try {
    const update = { ...req.body, is_featured: req.body.is_featured === 'true' || req.body.is_featured === true };
    db.get('products').find({ id: req.params.id }).assign(update).write();
    res.json({ success: true, message: 'Produk berhasil diperbarui.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/products/:id', (req, res) => {
  try {
    db.get('products').remove({ id: req.params.id }).write();
    res.json({ success: true, message: 'Produk berhasil dihapus.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── TESTIMONIALS ──────────────────────────────────────
router.get('/testimonials', (req, res) => {
  res.json({ success: true, data: db.get('testimonials').sortBy('order').value() });
});

router.post('/testimonials', (req, res) => {
  try {
    const testi = {
      id: 'testi-' + uuidv4().split('-')[0],
      ...req.body,
      stars: parseInt(req.body.stars) || 5,
      order: db.get('testimonials').size().value() + 1,
      created_at: new Date().toISOString()
    };
    db.get('testimonials').push(testi).write();
    res.json({ success: true, message: 'Testimoni berhasil ditambahkan.', data: testi });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/testimonials/:id', (req, res) => {
  try {
    db.get('testimonials').find({ id: req.params.id }).assign({ ...req.body, stars: parseInt(req.body.stars) || 5 }).write();
    res.json({ success: true, message: 'Testimoni berhasil diperbarui.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/testimonials/:id', (req, res) => {
  try {
    db.get('testimonials').remove({ id: req.params.id }).write();
    res.json({ success: true, message: 'Testimoni berhasil dihapus.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── GALLERY ───────────────────────────────────────────
router.get('/gallery', (req, res) => {
  res.json({ success: true, data: db.get('gallery').sortBy('order').value() });
});

router.post('/gallery', (req, res) => {
  try {
    const item = {
      id: 'gal-' + uuidv4().split('-')[0],
      url: req.body.url,
      caption: req.body.caption || '',
      order: db.get('gallery').size().value() + 1,
      created_at: new Date().toISOString()
    };
    db.get('gallery').push(item).write();
    res.json({ success: true, message: 'Foto berhasil ditambahkan.', data: item });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/gallery/:id', (req, res) => {
  try {
    db.get('gallery').find({ id: req.params.id }).assign(req.body).write();
    res.json({ success: true, message: 'Foto berhasil diperbarui.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/gallery/:id', (req, res) => {
  try {
    db.get('gallery').remove({ id: req.params.id }).write();
    res.json({ success: true, message: 'Foto berhasil dihapus.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── FAQ ───────────────────────────────────────────────
router.get('/faq', (req, res) => {
  res.json({ success: true, data: db.get('faq').sortBy('order').value() });
});

router.post('/faq', (req, res) => {
  try {
    const item = {
      id: 'faq-' + uuidv4().split('-')[0],
      question: req.body.question,
      answer: req.body.answer,
      order: db.get('faq').size().value() + 1,
      created_at: new Date().toISOString()
    };
    db.get('faq').push(item).write();
    res.json({ success: true, message: 'FAQ berhasil ditambahkan.', data: item });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/faq/:id', (req, res) => {
  try {
    db.get('faq').find({ id: req.params.id }).assign(req.body).write();
    res.json({ success: true, message: 'FAQ berhasil diperbarui.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/faq/:id', (req, res) => {
  try {
    db.get('faq').remove({ id: req.params.id }).write();
    res.json({ success: true, message: 'FAQ berhasil dihapus.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── KEUNGGULAN ────────────────────────────────────────
router.get('/keunggulan', (req, res) => {
  res.json({ success: true, data: db.get('keunggulan').sortBy('order').value() });
});

router.put('/keunggulan/:id', (req, res) => {
  try {
    db.get('keunggulan').find({ id: req.params.id }).assign(req.body).write();
    res.json({ success: true, message: 'Keunggulan berhasil diperbarui.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── CHANGE PASSWORD ───────────────────────────────────
router.put('/password', (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const user = db.get('users').find({ id: req.session.adminId }).value();
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan.' });
    if (!bcrypt.compareSync(current_password, user.password)) {
      return res.status(401).json({ error: 'Password lama salah.' });
    }
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ error: 'Password baru minimal 6 karakter.' });
    }
    const hashed = bcrypt.hashSync(new_password, 10);
    db.get('users').find({ id: req.session.adminId }).assign({ password: hashed }).write();
    res.json({ success: true, message: 'Password berhasil diubah.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── NEWS ──────────────────────────────────────────────
router.get('/news', (req, res) => {
  res.json({ success: true, data: db.get('news').sortBy('order').value() || [] });
});

router.post('/news', (req, res) => {
  try {
    const item = {
      id: 'news-' + uuidv4().split('-')[0],
      title: req.body.title,
      date: req.body.date || new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }),
      image: req.body.image || '/images/news_1.jpg',
      excerpt: req.body.excerpt,
      order: db.get('news').size().value() + 1,
      created_at: new Date().toISOString()
    };
    db.get('news').push(item).write();
    res.json({ success: true, message: 'Berita berhasil ditambahkan.', data: item });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/news/:id', (req, res) => {
  try {
    db.get('news').find({ id: req.params.id }).assign(req.body).write();
    res.json({ success: true, message: 'Berita berhasil diperbarui.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/news/:id', (req, res) => {
  try {
    db.get('news').remove({ id: req.params.id }).write();
    res.json({ success: true, message: 'Berita berhasil dihapus.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── PROJECTS ──────────────────────────────────────────
router.get('/projects', (req, res) => {
  res.json({ success: true, data: db.get('projects').sortBy('order').value() || [] });
});

router.post('/projects', (req, res) => {
  try {
    const item = {
      id: uuidv4().split('-')[0],
      title: req.body.title,
      status: req.body.status,
      statusClass: req.body.statusClass || 'status-active',
      location: req.body.location,
      types: req.body.types,
      features: req.body.features,
      waMessage: req.body.waMessage,
      order: db.get('projects').size().value() + 1,
      created_at: new Date().toISOString()
    };
    db.get('projects').push(item).write();
    res.json({ success: true, message: 'Cluster/Proyek berhasil ditambahkan.', data: item });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/projects/:id', (req, res) => {
  try {
    db.get('projects').find({ id: req.params.id }).assign(req.body).write();
    res.json({ success: true, message: 'Cluster/Proyek berhasil diperbarui.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/projects/:id', (req, res) => {
  try {
    db.get('projects').remove({ id: req.params.id }).write();
    res.json({ success: true, message: 'Cluster/Proyek berhasil dihapus.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
