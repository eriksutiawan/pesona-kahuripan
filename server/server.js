// server/server.js — Main Express Server
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Ensure uploads directory exists ───────────────────
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ─── Multer for image uploads ───────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, unique + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Hanya file gambar yang diizinkan (JPG, PNG, WebP).'));
  }
});

// ─── Middleware ─────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'pk-cms-secret-2024-pesona-kahuripan',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// ─── Static Files ───────────────────────────────────────
// Serve public images (original website assets)
app.use('/images', express.static(path.join(__dirname, '../public')));
// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));
// Serve admin panel
app.use('/admin', express.static(path.join(__dirname, '../admin')));
// Serve main public website at root
app.use(express.static(path.join(__dirname, '../public')));

// ─── Image Upload Endpoint ──────────────────────────────
const requireAuth = require('./middleware/auth');

app.post('/api/admin/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Tidak ada file yang diunggah.' });
  res.json({
    success: true,
    url: '/uploads/' + req.file.filename,
    filename: req.file.filename,
    message: 'Gambar berhasil diunggah.'
  });
});

// Upload error handler
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Ukuran file maksimal 5MB.' });
  }
  if (err.message && err.message.includes('gambar')) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// ─── API Routes ─────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/content', require('./routes/content'));
app.use('/api/admin', requireAuth, require('./routes/admin'));

// ─── Fallback: Serve index.html for SPA ────────────────
app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/admin') || req.path.startsWith('/uploads')) return;
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ─── Start Server ───────────────────────────────────────
initDatabase();
app.listen(PORT, () => {
  console.log('');
  console.log('🏠 ════════════════════════════════════════════');
  console.log('   Pesona Kahuripan CMS Server');
  console.log('════════════════════════════════════════════════');
  console.log(`  🌐 Website  : http://localhost:${PORT}`);
  console.log(`  🔧 Admin    : http://localhost:${PORT}/admin`);
  console.log(`  🔑 Login    : admin / admin123`);
  console.log('════════════════════════════════════════════════');
  console.log('');
});
