// admin/admin.js — Pesona Kahuripan CMS Dashboard Logic

const API = '/api/admin';
let deleteCallback = null;
let selectedColor = '#667eea';

// ─── UTILS ────────────────────────────────────────────
function toast(msg, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️';
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-text">${msg}</span><span class="toast-close" onclick="this.parentElement.remove()">✕</span>`;
  document.body.appendChild(t);
  setTimeout(() => t.remove?.(), 4000);
}

async function api(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API + path, opts);
  return res.json();
}

function showModal(id) { document.getElementById(id).style.display = 'flex'; }
function hideModal(id) { document.getElementById(id).style.display = 'none'; }
function el(id) { return document.getElementById(id); }
function val(id) { return el(id)?.value?.trim() || ''; }
function setVal(id, v) { if (el(id)) el(id).value = v || ''; }
function truncate(str, n = 60) { return str && str.length > n ? str.slice(0, n) + '…' : str; }
function stars(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); }

// ─── NAVIGATION ───────────────────────────────────────
const panels = document.querySelectorAll('.panel');
const navItems = document.querySelectorAll('.nav-item[data-panel], .quick-link[data-panel]');

const panelTitles = {
  dashboard: ['Dashboard', 'Ringkasan konten website'],
  hero: ['Hero & Banner', 'Edit tampilan utama beranda'],
  products: ['Produk Rumah', 'Kelola daftar properti'],
  projects: ['Kelola Cluster', 'Manajemen daftar cluster perumahan sukses'],
  gallery: ['Galeri Foto', 'Upload dan atur foto'],
  news: ['Berita & Artikel', 'Kelola berita dan artikel perumahan'],
  testimonials: ['Testimoni', 'Ulasan dari pelanggan'],
  faq: ['FAQ', 'Pertanyaan yang sering diajukan'],
  keunggulan: ['Keunggulan', 'Poin keunggulan perusahaan'],
  settings: ['Info Perusahaan', 'Pengaturan umum website'],
  password: ['Ganti Password', 'Ubah password akun admin']
};

function navigateTo(panelName) {
  panels.forEach(p => p.classList.remove('active'));
  navItems.forEach(n => n.classList.remove('active'));
  const panel = el('panel-' + panelName);
  if (panel) panel.classList.add('active');
  const navEl = el('nav-' + panelName);
  if (navEl) navEl.classList.add('active');
  const [title, subtitle] = panelTitles[panelName] || [panelName, ''];
  el('topbar-title').textContent = title;
  el('topbar-subtitle').textContent = subtitle;
  loadPanel(panelName);
}

navItems.forEach(item => {
  item.addEventListener('click', () => navigateTo(item.dataset.panel));
});

// ─── MODAL CLOSE ──────────────────────────────────────
document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => hideModal(btn.dataset.close));
});
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.style.display = 'none'; });
});

// ─── LOAD PANEL ───────────────────────────────────────
async function loadPanel(name) {
  switch(name) {
    case 'dashboard': loadDashboard(); break;
    case 'hero': loadHero(); break;
    case 'products': loadProducts(); break;
    case 'projects': loadProjects(); break;
    case 'gallery': loadGallery(); break;
    case 'news': loadNews(); break;
    case 'testimonials': loadTestimonials(); break;
    case 'faq': loadFaq(); break;
    case 'keunggulan': loadKeunggulan(); break;
    case 'settings': loadSettings(); break;
  }
}

// ─── DASHBOARD ────────────────────────────────────────
async function loadDashboard() {
  try {
    const [p, g, t, f, n, pr] = await Promise.all([
      api('GET', '/products'), api('GET', '/gallery'),
      api('GET', '/testimonials'), api('GET', '/faq'),
      api('GET', '/news'), api('GET', '/projects')
    ]);
    el('stat-products').textContent = p.data?.length || 0;
    el('stat-gallery').textContent = g.data?.length || 0;
    el('stat-testi').textContent = t.data?.length || 0;
    el('stat-faq').textContent = f.data?.length || 0;
    if (el('stat-news')) el('stat-news').textContent = n.data?.length || 0;
    if (el('stat-projects')) el('stat-projects').textContent = pr.data?.length || 0;
  } catch(e) {}
}

// ─── HERO ─────────────────────────────────────────────
async function loadHero() {
  const [heroRes, statsRes] = await Promise.all([api('GET', '/hero'), api('GET', '/stats')]);
  const h = heroRes.data || {};
  setVal('hero-badge', h.badge);
  setVal('hero-title', h.title);
  setVal('hero-title-em', h.title_em);
  setVal('hero-subtitle', h.subtitle);
  setVal('hero-subtitle-highlight', h.subtitle_highlight);
  setVal('hero-subtitle-units', h.subtitle_units);
  setVal('hero-cta-primary', h.cta_primary_text);
  setVal('hero-cta-wa', h.cta_wa_text);

  const sl = el('stats-list');
  sl.innerHTML = statsRes.data?.map(s => `
    <div class="form-grid" style="margin-bottom:16px;padding:16px;background:#FAF7F2;border-radius:10px;">
      <div class="form-group"><label>${s.icon} ${s.label}</label>
        <input type="text" value="${s.value}" id="stat-val-${s.id}" placeholder="Nilai statistik" />
      </div>
      <div class="form-group"><label>Label</label>
        <input type="text" value="${s.label}" id="stat-label-${s.id}" placeholder="Label statistik" />
        <button class="btn btn-primary btn-sm" style="margin-top:8px;" onclick="saveStat(${s.id})">Simpan</button>
      </div>
    </div>
  `).join('') || '';
}

async function saveStat(id) {
  const r = await api('PUT', `/stats/${id}`, {
    value: val(`stat-val-${id}`), label: val(`stat-label-${id}`)
  });
  r.success ? toast(r.message) : toast(r.error, 'error');
}

el('btn-save-hero').addEventListener('click', async () => {
  const r = await api('PUT', '/hero', {
    badge: val('hero-badge'), title: val('hero-title'), title_em: val('hero-title-em'),
    subtitle: val('hero-subtitle'), subtitle_highlight: val('hero-subtitle-highlight'),
    subtitle_units: val('hero-subtitle-units'), cta_primary_text: val('hero-cta-primary'),
    cta_wa_text: val('hero-cta-wa')
  });
  r.success ? toast(r.message) : toast(r.error, 'error');
});

// ─── IMAGE UPLOAD ─────────────────────────────────────
async function uploadImage(file) {
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  return res.json();
}

function setupImageUpload(inputId, previewId, hiddenId) {
  el(inputId)?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { const img = el(previewId); img.src = ev.target.result; img.classList.add('show'); };
    reader.readAsDataURL(file);
    const r = await uploadImage(file);
    if (r.success) { setVal(hiddenId, r.url); toast('Foto berhasil diunggah!'); }
    else toast(r.error || 'Upload gagal.', 'error');
  });
}
setupImageUpload('prod-img-input', 'prod-img-preview', 'prod-image');
setupImageUpload('gal-img-input', 'gal-img-preview', 'gal-image');
setupImageUpload('news-img-input', 'news-img-preview', 'news-image');

// ─── PRODUCTS ─────────────────────────────────────────
async function loadProducts() {
  const r = await api('GET', '/products');
  const tbody = el('products-tbody');
  if (!r.data?.length) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#999;">Belum ada produk</td></tr>'; return; }
  tbody.innerHTML = r.data.map(p => `
    <tr>
      <td><img src="${p.image}" class="td-img" onerror="this.src='/images/house_subsidi.png'" loading="lazy" /></td>
      <td><span class="badge badge-gold">${p.type}</span></td>
      <td><strong>${p.name}</strong></td>
      <td>${p.price_value} <small style="color:#999;">${p.price_unit}</small></td>
      <td>${p.is_featured ? '<span class="badge badge-emerald">✓ Featured</span>' : '<span style="color:#999;">-</span>'}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="editProduct('${p.id}')">✏️ Edit</button>
        <button class="btn btn-sm btn-danger" onclick="confirmDelete('Hapus produk <strong>${p.name}</strong>?', () => deleteProduct('${p.id}'))" style="margin-left:6px;">🗑️</button>
      </td>
    </tr>
  `).join('');
}

el('btn-add-product').addEventListener('click', () => {
  el('modal-product-title').textContent = 'Tambah Produk Baru';
  ['prod-id','prod-type','prod-name','prod-desc','prod-spec-building','prod-spec-land','prod-spec-bedroom','prod-spec-bathroom','prod-price-label','prod-price-value','prod-price-unit','prod-badge','prod-wa','prod-image','prod-kpr-price','prod-installments'].forEach(id => setVal(id, ''));
  ['prod-spec-carport-check','prod-spec-taman-check','prod-spec-balkon-check','prod-spec-laundry-check','prod-spec-ruang-keluarga-check'].forEach(id => { el(id).checked = false; });
  el('prod-featured').checked = false;
  el('prod-img-preview').classList.remove('show');
  showModal('modal-product');
});

async function editProduct(id) {
  const r = await api('GET', '/products');
  const p = r.data?.find(x => x.id === id);
  if (!p) return;
  el('modal-product-title').textContent = 'Edit Produk';
  setVal('prod-id', p.id); setVal('prod-type', p.type); setVal('prod-name', p.name);
  setVal('prod-desc', p.description); setVal('prod-spec-building', p.spec_building);
  setVal('prod-spec-land', p.spec_land); setVal('prod-spec-bedroom', p.spec_bedroom);
  setVal('prod-spec-bathroom', p.spec_bathroom); setVal('prod-price-label', p.price_label);
  setVal('prod-price-value', p.price_value); setVal('prod-price-unit', p.price_unit);
  setVal('prod-badge', p.badge); setVal('prod-wa', p.wa_message); setVal('prod-image', p.image);
  setVal('prod-kpr-price', p.kpr_price || '');
  const installmentsStr = p.installments ? p.installments.map(i => `${i.years}: ${i.value}`).join('\n') : '';
  setVal('prod-installments', installmentsStr);
  el('prod-featured').checked = p.is_featured;
  // Load facility checkboxes
  el('prod-spec-carport-check').checked = !!p.spec_carport;
  el('prod-spec-taman-check').checked = !!p.spec_taman;
  el('prod-spec-balkon-check').checked = !!p.spec_balkon;
  el('prod-spec-laundry-check').checked = !!p.spec_laundry;
  el('prod-spec-ruang-keluarga-check').checked = !!p.spec_ruang_keluarga;
  const preview = el('prod-img-preview');
  preview.src = p.image; preview.classList.add('show');
  showModal('modal-product');
}

el('btn-save-product').addEventListener('click', async () => {
  const id = val('prod-id');
  const instRaw = val('prod-installments');
  const installments = instRaw.split('\n')
    .map(line => line.trim())
    .filter(line => line.includes(':'))
    .map(line => {
      const idx = line.indexOf(':');
      return {
        years: line.substring(0, idx).trim(),
        value: line.substring(idx + 1).trim()
      };
    });
  const data = {
    type: val('prod-type'), name: val('prod-name'), description: val('prod-desc'),
    spec_building: val('prod-spec-building'), spec_land: val('prod-spec-land'),
    spec_bedroom: val('prod-spec-bedroom'), spec_bathroom: val('prod-spec-bathroom'),
    spec_carport: el('prod-spec-carport-check').checked ? 'Car Port' : null,
    spec_taman: el('prod-spec-taman-check').checked ? 'Taman' : null,
    spec_balkon: el('prod-spec-balkon-check').checked ? 'Balkon' : null,
    spec_laundry: el('prod-spec-laundry-check').checked ? 'Area Laundry' : null,
    spec_ruang_keluarga: el('prod-spec-ruang-keluarga-check').checked ? 'Ruang Keluarga' : null,
    price_label: val('prod-price-label'), price_value: val('prod-price-value'),
    price_unit: val('prod-price-unit'), badge: val('prod-badge'),
    wa_message: val('prod-wa'), image: val('prod-image'),
    kpr_price: val('prod-kpr-price'),
    installments: installments,
    is_featured: el('prod-featured').checked
  };
  const r = id ? await api('PUT', `/products/${id}`, data) : await api('POST', '/products', data);
  if (r.success) { toast(r.message); hideModal('modal-product'); loadProducts(); }
  else toast(r.error, 'error');
});

async function deleteProduct(id) {
  const r = await api('DELETE', `/products/${id}`);
  r.success ? (toast(r.message), loadProducts()) : toast(r.error, 'error');
}

// ─── GALLERY ──────────────────────────────────────────
async function loadGallery() {
  const r = await api('GET', '/gallery');
  const grid = el('gallery-grid');
  const empty = el('gallery-empty');
  if (!r.data?.length) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  grid.innerHTML = r.data.map(g => `
    <div class="gallery-item">
      <img src="${g.url}" alt="${g.caption}" onerror="this.src='/images/hero.png'" loading="lazy" />
      <div class="gallery-item-caption">${g.caption || 'Tanpa keterangan'}</div>
      <div class="gallery-item-overlay">
        <button class="btn btn-sm btn-danger" onclick="confirmDelete('Hapus foto ini?', () => deleteGallery('${g.id}'))">🗑️ Hapus</button>
      </div>
    </div>
  `).join('');
}

el('btn-add-gallery').addEventListener('click', () => {
  setVal('gal-image', ''); setVal('gal-caption', '');
  el('gal-img-preview').classList.remove('show');
  el('gal-img-input').value = '';
  showModal('modal-gallery');
});

el('btn-save-gallery').addEventListener('click', async () => {
  const url = val('gal-image');
  if (!url) { toast('Silakan upload foto terlebih dahulu.', 'error'); return; }
  const r = await api('POST', '/gallery', { url, caption: val('gal-caption') });
  if (r.success) { toast(r.message); hideModal('modal-gallery'); loadGallery(); }
  else toast(r.error, 'error');
});

async function deleteGallery(id) {
  const r = await api('DELETE', `/gallery/${id}`);
  r.success ? (toast(r.message), loadGallery()) : toast(r.error, 'error');
}

// ─── TESTIMONIALS ─────────────────────────────────────
async function loadTestimonials() {
  const r = await api('GET', '/testimonials');
  const tbody = el('testi-tbody');
  if (!r.data?.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:#999;">Belum ada testimoni</td></tr>'; return; }
  tbody.innerHTML = r.data.map(t => `
    <tr>
      <td><div style="display:flex;align-items:center;gap:10px;"><div style="width:36px;height:36px;border-radius:50%;background:${t.avatar_color};display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:0.9rem;">${t.name[0]}</div><strong>${t.name}</strong></div></td>
      <td>${t.location}</td>
      <td><span class="stars-display">${stars(t.stars)}</span></td>
      <td style="max-width:250px;">${truncate(t.text, 80)}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="editTesti('${t.id}')">✏️ Edit</button>
        <button class="btn btn-sm btn-danger" onclick="confirmDelete('Hapus testimoni dari <strong>${t.name}</strong>?', () => deleteTesti('${t.id}'))" style="margin-left:6px;">🗑️</button>
      </td>
    </tr>
  `).join('');
}

el('btn-add-testi').addEventListener('click', () => {
  el('modal-testi-title').textContent = 'Tambah Testimoni';
  setVal('testi-id', ''); setVal('testi-name', ''); setVal('testi-location', ''); setVal('testi-text', '');
  el('testi-stars').value = '5';
  document.querySelectorAll('#testi-colors .swatch').forEach(s => s.classList.remove('active'));
  document.querySelector('#testi-colors .swatch').classList.add('active');
  selectedColor = '#667eea'; setVal('testi-color', selectedColor);
  showModal('modal-testi');
});

async function editTesti(id) {
  const r = await api('GET', '/testimonials');
  const t = r.data?.find(x => x.id === id);
  if (!t) return;
  el('modal-testi-title').textContent = 'Edit Testimoni';
  setVal('testi-id', t.id); setVal('testi-name', t.name); setVal('testi-location', t.location);
  setVal('testi-text', t.text); el('testi-stars').value = t.stars;
  selectedColor = t.avatar_color || '#667eea'; setVal('testi-color', selectedColor);
  document.querySelectorAll('#testi-colors .swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.color === selectedColor);
  });
  showModal('modal-testi');
}

document.querySelectorAll('#testi-colors .swatch').forEach(swatch => {
  swatch.addEventListener('click', () => {
    document.querySelectorAll('#testi-colors .swatch').forEach(s => s.classList.remove('active'));
    swatch.classList.add('active');
    selectedColor = swatch.dataset.color;
    setVal('testi-color', selectedColor);
  });
});

el('btn-save-testi').addEventListener('click', async () => {
  const id = val('testi-id');
  const data = { name: val('testi-name'), location: val('testi-location'), text: val('testi-text'), stars: el('testi-stars').value, avatar_color: selectedColor };
  const r = id ? await api('PUT', `/testimonials/${id}`, data) : await api('POST', '/testimonials', data);
  if (r.success) { toast(r.message); hideModal('modal-testi'); loadTestimonials(); }
  else toast(r.error, 'error');
});

async function deleteTesti(id) {
  const r = await api('DELETE', `/testimonials/${id}`);
  r.success ? (toast(r.message), loadTestimonials()) : toast(r.error, 'error');
}

// ─── FAQ ──────────────────────────────────────────────
async function loadFaq() {
  const r = await api('GET', '/faq');
  const tbody = el('faq-tbody');
  if (!r.data?.length) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:40px;color:#999;">Belum ada FAQ</td></tr>'; return; }
  tbody.innerHTML = r.data.map((f, i) => `
    <tr>
      <td style="font-weight:700;color:#999;">${i+1}</td>
      <td><strong>${truncate(f.question, 60)}</strong></td>
      <td>${truncate(f.answer, 80)}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="editFaq('${f.id}')">✏️ Edit</button>
        <button class="btn btn-sm btn-danger" onclick="confirmDelete('Hapus FAQ ini?', () => deleteFaq('${f.id}'))" style="margin-left:6px;">🗑️</button>
      </td>
    </tr>
  `).join('');
}

el('btn-add-faq').addEventListener('click', () => {
  el('modal-faq-title').textContent = 'Tambah FAQ Baru';
  setVal('faq-id', ''); setVal('faq-question', ''); setVal('faq-answer', '');
  showModal('modal-faq');
});

async function editFaq(id) {
  const r = await api('GET', '/faq');
  const f = r.data?.find(x => x.id === id);
  if (!f) return;
  el('modal-faq-title').textContent = 'Edit FAQ';
  setVal('faq-id', f.id); setVal('faq-question', f.question); setVal('faq-answer', f.answer);
  showModal('modal-faq');
}

el('btn-save-faq').addEventListener('click', async () => {
  const id = val('faq-id');
  const data = { question: val('faq-question'), answer: val('faq-answer') };
  const r = id ? await api('PUT', `/faq/${id}`, data) : await api('POST', '/faq', data);
  if (r.success) { toast(r.message); hideModal('modal-faq'); loadFaq(); }
  else toast(r.error, 'error');
});

async function deleteFaq(id) {
  const r = await api('DELETE', `/faq/${id}`);
  r.success ? (toast(r.message), loadFaq()) : toast(r.error, 'error');
}

// ─── KEUNGGULAN ───────────────────────────────────────
async function loadKeunggulan() {
  const r = await api('GET', '/keunggulan');
  const list = el('keunggulan-list');
  list.innerHTML = r.data?.map(k => `
    <div class="card" style="margin-bottom:16px;">
      <div class="form-grid">
        <div class="form-group"><label>Ikon (Emoji)</label><input type="text" id="k-icon-${k.id}" value="${k.icon}" /></div>
        <div class="form-group"><label>Judul</label><input type="text" id="k-title-${k.id}" value="${k.title}" /></div>
        <div class="form-group full"><label>Deskripsi</label><textarea id="k-desc-${k.id}" rows="2">${k.desc}</textarea></div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="saveKeunggulan('${k.id}')">💾 Simpan</button>
    </div>
  `).join('') || '';
}

async function saveKeunggulan(id) {
  const r = await api('PUT', `/keunggulan/${id}`, {
    icon: val(`k-icon-${id}`), title: val(`k-title-${id}`), desc: el(`k-desc-${id}`)?.value?.trim()
  });
  r.success ? toast(r.message) : toast(r.error, 'error');
}

// ─── SETTINGS ─────────────────────────────────────────
async function loadSettings() {
  const r = await api('GET', '/settings');
  const s = r.data || {};
  setVal('s-company', s.company_name); setVal('s-tagline', s.tagline);
  setVal('s-phone', s.phone); setVal('s-phone-display', s.phone_display);
  setVal('s-address', s.address); setVal('s-hours', s.hours);
  setVal('s-founded', s.founded_year); setVal('s-instagram', s.instagram);
  setVal('s-facebook', s.facebook); setVal('s-youtube', s.youtube);
  setVal('s-tiktok', s.tiktok); setVal('s-maps-url', s.maps_url);
  setVal('s-about-title', s.about_title);
  if (el('s-about-text')) el('s-about-text').value = s.about_text || '';
  if (el('s-about-text2')) el('s-about-text2').value = s.about_text2 || '';
  if (el('s-footer')) el('s-footer').value = s.footer_text || '';
}

el('btn-save-settings').addEventListener('click', async () => {
  const r = await api('PUT', '/settings', {
    company_name: val('s-company'), tagline: val('s-tagline'),
    phone: val('s-phone'), phone_display: val('s-phone-display'),
    address: val('s-address'), hours: val('s-hours'), founded_year: val('s-founded'),
    instagram: val('s-instagram'), facebook: val('s-facebook'),
    youtube: val('s-youtube'), tiktok: val('s-tiktok'), maps_url: val('s-maps-url'),
    about_title: val('s-about-title'),
    about_text: el('s-about-text')?.value?.trim(),
    about_text2: el('s-about-text2')?.value?.trim(),
    footer_text: el('s-footer')?.value?.trim()
  });
  r.success ? toast(r.message) : toast(r.error, 'error');
});

// ─── PASSWORD ─────────────────────────────────────────
el('password-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const np = val('pw-new'), cp = val('pw-confirm');
  if (np !== cp) { toast('Password baru dan konfirmasi tidak sama.', 'error'); return; }
  const r = await api('PUT', '/password', { current_password: val('pw-current'), new_password: np });
  if (r.success) { toast(r.message); el('password-form').reset(); }
  else toast(r.error, 'error');
});

// ─── CONFIRM DELETE ───────────────────────────────────
function confirmDelete(msg, callback) {
  el('confirm-message').innerHTML = msg || 'Data yang dihapus tidak dapat dikembalikan.';
  deleteCallback = callback;
  showModal('modal-confirm');
}

el('btn-confirm-delete').addEventListener('click', async () => {
  hideModal('modal-confirm');
  if (deleteCallback) { await deleteCallback(); deleteCallback = null; }
});

// ─── LOGOUT ───────────────────────────────────────────
el('btn-logout').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/admin/';
});

// ─── NEWS ─────────────────────────────────────────────
async function loadNews() {
  const r = await api('GET', '/news');
  const tbody = el('news-tbody');
  if (!r.data?.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:#999;">Belum ada berita</td></tr>'; return; }
  tbody.innerHTML = r.data.map(n => `
    <tr>
      <td><img src="${n.image}" class="td-img" onerror="this.src='/images/news_1.jpg'" loading="lazy" /></td>
      <td><strong>${n.title}</strong></td>
      <td><span class="badge badge-gold">${n.date}</span></td>
      <td style="max-width:250px;">${truncate(n.excerpt, 80)}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="editNews('${n.id}')">✏️ Edit</button>
        <button class="btn btn-sm btn-danger" onclick="confirmDelete('Hapus berita <strong>${n.title}</strong>?', () => deleteNews('${n.id}'))" style="margin-left:6px;">🗑️</button>
      </td>
    </tr>
  `).join('');
}

el('btn-add-news')?.addEventListener('click', () => {
  el('modal-news-title').textContent = 'Tambah Berita Baru';
  ['news-id', 'news-title', 'news-date', 'news-excerpt', 'news-image'].forEach(id => setVal(id, ''));
  el('news-img-preview').classList.remove('show');
  showModal('modal-news');
});

async function editNews(id) {
  const r = await api('GET', '/news');
  const n = r.data?.find(x => x.id === id);
  if (!n) return;
  el('modal-news-title').textContent = 'Edit Berita';
  setVal('news-id', n.id);
  setVal('news-title', n.title);
  setVal('news-date', n.date);
  setVal('news-excerpt', n.excerpt);
  setVal('news-image', n.image);
  const preview = el('news-img-preview');
  preview.src = n.image; preview.classList.add('show');
  showModal('modal-news');
}

el('btn-save-news')?.addEventListener('click', async () => {
  const id = val('news-id');
  const data = {
    title: val('news-title'),
    date: val('news-date'),
    excerpt: val('news-excerpt'),
    image: val('news-image')
  };
  if (!data.title || !data.date || !data.excerpt) {
    toast('Semua field (Judul, Tanggal, Ringkasan) wajib diisi!', 'error');
    return;
  }
  const r = id ? await api('PUT', `/news/${id}`, data) : await api('POST', '/news', data);
  if (r.success) { toast(r.message); hideModal('modal-news'); loadNews(); }
  else toast(r.error, 'error');
});

async function deleteNews(id) {
  const r = await api('DELETE', `/news/${id}`);
  r.success ? (toast(r.message), loadNews()) : toast(r.error, 'error');
}

// ─── PROJECTS ─────────────────────────────────────────
async function loadProjects() {
  const r = await api('GET', '/projects');
  const tbody = el('projects-tbody');
  if (!r.data?.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:#999;">Belum ada cluster</td></tr>'; return; }
  tbody.innerHTML = r.data.map(p => {
    let badgeClass = 'badge-gold';
    if (p.statusClass === 'status-soldout') badgeClass = 'badge-red';
    else if (p.statusClass === 'status-active') badgeClass = 'badge-emerald';
    
    return `
      <tr>
        <td><strong>${p.title}</strong></td>
        <td><span class="badge ${badgeClass}">${p.status}</span></td>
        <td>${p.types}</td>
        <td>${p.location}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="editProject('${p.id}')">✏️ Edit</button>
          <button class="btn btn-sm btn-danger" onclick="confirmDelete('Hapus cluster <strong>${p.title}</strong>?', () => deleteProject('${p.id}'))" style="margin-left:6px;">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

el('btn-add-project')?.addEventListener('click', () => {
  el('modal-project-title').textContent = 'Tambah Cluster Baru';
  ['project-id', 'project-title', 'project-status', 'project-location', 'project-types', 'project-features', 'project-wa'].forEach(id => setVal(id, ''));
  setVal('project-status-class', 'status-active');
  showModal('modal-project');
});

async function editProject(id) {
  const r = await api('GET', '/projects');
  const p = r.data?.find(x => x.id === id);
  if (!p) return;
  el('modal-project-title').textContent = 'Edit Cluster';
  setVal('project-id', p.id);
  setVal('project-title', p.title);
  setVal('project-status', p.status);
  setVal('project-status-class', p.statusClass);
  setVal('project-location', p.location);
  setVal('project-types', p.types);
  setVal('project-features', p.features);
  setVal('project-wa', p.waMessage);
  showModal('modal-project');
}

el('btn-save-project')?.addEventListener('click', async () => {
  const id = val('project-id');
  const data = {
    title: val('project-title'),
    status: val('project-status'),
    statusClass: val('project-status-class'),
    location: val('project-location'),
    types: val('project-types'),
    features: val('project-features'),
    waMessage: val('project-wa')
  };
  if (!data.title || !data.status || !data.location) {
    toast('Field Nama Cluster, Status, dan Lokasi wajib diisi!', 'error');
    return;
  }
  const r = id ? await api('PUT', `/projects/${id}`, data) : await api('POST', '/projects', data);
  if (r.success) { toast(r.message); hideModal('modal-project'); loadProjects(); }
  else toast(r.error, 'error');
});

async function deleteProject(id) {
  const r = await api('DELETE', `/projects/${id}`);
  r.success ? (toast(r.message), loadProjects()) : toast(r.error, 'error');
}

// ─── INIT ─────────────────────────────────────────────
(async () => {
  const auth = await fetch('/api/auth/check').then(r => r.json());
  if (!auth.loggedIn) { window.location.href = '/admin/'; return; }
  el('user-name').textContent = auth.name || 'Admin';
  el('user-avatar').textContent = (auth.name || 'A')[0].toUpperCase();
  loadDashboard();
})();
