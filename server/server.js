// server/server.js — Main Express Server
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Ensure uploads directory exists ───────────────────
const uploadsDir = path.join(__dirname, '../uploads');
try {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
} catch (err) {
  console.warn('⚠️ Could not create local uploads directory (this is normal in read-only cloud runtimes):', err.message);
}

// ─── Multer for image uploads ───────────────────────────
const storage = multer.memoryStorage();
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
const { verifySession } = require('./sessionHelper');
app.use((req, res, next) => {
  req.session = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = {};
    cookieHeader.split(';').forEach(c => {
      const parts = c.split('=');
      if (parts.length >= 2) {
        cookies[parts.shift().trim()] = decodeURIComponent(parts.join('='));
      }
    });
    const token = cookies['pk_session'];
    if (token) {
      const sessionData = verifySession(token);
      if (sessionData) {
        req.session = sessionData;
      }
    }
  }
  next();
});

// ─── Production Minified Assets & Inline CSS ──────────────
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  let _indexHtmlCache = null;
  app.get(['/', '/index.html'], (req, res, next) => {
    if (_indexHtmlCache) {
      return res.send(_indexHtmlCache);
    }
    try {
      const indexPath = path.join(__dirname, '../public/index.html');
      let html = fs.readFileSync(indexPath, 'utf-8');
      const cssPath = path.join(__dirname, '../public/style.min.css');
      if (fs.existsSync(cssPath)) {
        const cssContent = fs.readFileSync(cssPath, 'utf-8');
        html = html.replace(/<link rel="preload" href="style\.css" as="style"\s*\/?>/i, '');
        html = html.replace(/<link rel="stylesheet" href="style\.css"\s*\/?>/i, `<style>${cssContent}</style>`);
        _indexHtmlCache = html;
        return res.send(html);
      }
    } catch (err) {
      console.error('Failed to inline CSS:', err);
    }
    next();
  });

  app.get('/style.css', (req, res, next) => {
    const minPath = path.join(__dirname, '../public/style.min.css');
    if (fs.existsSync(minPath)) {
      res.setHeader('Content-Type', 'text/css');
      return res.sendFile(minPath);
    }
    next();
  });
  app.get('/main.js', (req, res, next) => {
    const minPath = path.join(__dirname, '../public/main.min.js');
    if (fs.existsSync(minPath)) {
      res.setHeader('Content-Type', 'application/javascript');
      return res.sendFile(minPath);
    }
    next();
  });
}

// ─── Fallback for missing images (e.g. JPG vs PNG vs WebP) ───
app.use((req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    let relPath = req.path;
    if (relPath.startsWith('/images/')) {
      relPath = relPath.substring(7); // Strip /images prefix
    }
    const localPath = path.join(__dirname, '../public', relPath);
    if (!fs.existsSync(localPath)) {
      const dirName = path.dirname(relPath);
      const baseName = path.basename(relPath, ext);
      const extensions = ['.webp', '.png', '.jpg', '.jpeg'];
      for (const altExt of extensions) {
        if (altExt === ext) continue;
        const altRelPath = path.join(dirName, baseName + altExt);
        const altPath = path.join(__dirname, '../public', altRelPath);
        if (fs.existsSync(altPath)) {
          const contentTypes = {
            '.webp': 'image/webp',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg'
          };
          res.setHeader('Content-Type', contentTypes[altExt]);
          return res.sendFile(altPath);
        }
      }
    }
  }
  next();
});

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
const { supabase } = require('./database');

app.post('/api/admin/upload', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Tidak ada file yang diunggah.' });

    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext = path.extname(req.file.originalname).toLowerCase();
    const filename = unique + ext;

    if (supabase) {
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(filename, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(filename);

      res.json({
        success: true,
        url: urlData.publicUrl,
        filename: filename,
        message: 'Gambar berhasil diunggah.'
      });
    } else {
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);
      res.json({
        success: true,
        url: `/uploads/${filename}`,
        filename: filename,
        message: 'Gambar berhasil diunggah secara lokal.'
      });
    }
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Gagal mengunggah gambar.' });
  }
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
if (!process.env.VERCEL) {
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
}

module.exports = app;
