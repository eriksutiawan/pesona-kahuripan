/* ===================================================
   PESONA KAHURIPAN — JavaScript
   =================================================== */

// ============================================================
// CMS CONTENT LOADER — Loads all content from the database
// ============================================================
async function loadCmsContent() {
  try {
    const res = await fetch('/api/content/all');
    if (!res.ok) return; // Graceful fallback — use static HTML
    const { data } = await res.json();
    if (!data) return;
    window.cmsData = data;

    // ── Hero ──────────────────────────────────────
    if (data.hero) {
      const h = data.hero;
      const heroTitle = document.querySelector('.hero-title');
      if (heroTitle) heroTitle.innerHTML = `${h.title}<br/><em>${h.title_em}</em>`;
      const heroBadge = document.querySelector('.hero-badge');
      if (heroBadge) heroBadge.textContent = h.badge;
      const heroSub = document.querySelector('.hero-subtitle');
      if (heroSub) heroSub.innerHTML = `${h.subtitle}<br/>Cicilan mulai <strong>${h.subtitle_highlight}</strong> · Sudah lebih dari <strong>${h.subtitle_units}</strong> Terbangun`;
    }

    // ── Stats ─────────────────────────────────────
    if (data.stats?.length) {
      const statItems = document.querySelectorAll('.stat-item');
      data.stats.forEach((s, i) => {
        if (statItems[i]) {
          const numEl = statItems[i].querySelector('.stat-num');
          const labelEl = statItems[i].querySelector('.stat-label');
          if (numEl) numEl.textContent = s.value;
          if (labelEl) labelEl.textContent = s.label;
        }
      });
    }

    // ── Settings ──────────────────────────────────
    if (data.settings) {
      const s = data.settings;
      // Company name in logo
      const logoMain = document.querySelector('.logo-main');
      if (logoMain && s.company_name) logoMain.textContent = s.company_name.replace(' Group', '');
      // Phone number
      document.querySelectorAll('.wa-number').forEach(el => { el.textContent = s.phone_display; });
      const waLinks = document.querySelectorAll('a[href^="https://wa.me/"]');
      waLinks.forEach(a => { if (s.phone) a.href = `https://wa.me/${s.phone}`; });
      // About section
      const aboutTitle = document.querySelector('.about-title');
      if (aboutTitle && s.about_title) aboutTitle.textContent = s.about_title;
      const aboutTexts = document.querySelectorAll('.about-text');
      if (aboutTexts[0] && s.about_text) aboutTexts[0].innerHTML = s.about_text.replace(/\n/g, '<br>');
      if (aboutTexts[1] && s.about_text2) aboutTexts[1].innerHTML = s.about_text2.replace(/\n/g, '<br>');
      // Footer
      const footerDesc = document.querySelector('.footer-desc');
      if (footerDesc && s.footer_text) footerDesc.textContent = s.footer_text;
      // Address
      document.querySelectorAll('.company-address').forEach(el => { if(s.address) el.textContent = s.address; });
      // Hours
      document.querySelectorAll('.company-hours').forEach(el => { if(s.hours) el.textContent = s.hours; });
      // Social links
      if (s.instagram) { const ig = document.getElementById('social-ig'); if (ig) ig.href = s.instagram; }
      if (s.facebook) { const fb = document.getElementById('social-fb'); if (fb) fb.href = s.facebook; }
      if (s.youtube) { const yt = document.getElementById('social-yt'); if (yt) yt.href = s.youtube; }
      if (s.tiktok) { const tt = document.getElementById('social-tt'); if (tt) tt.href = s.tiktok; }
    }

    // ── Products ──────────────────────────────────
    if (data.products?.length) {
      const container = document.getElementById('products-container');
      if (container) {
        container.innerHTML = data.products.map(p => `
          <div class="product-card ${p.is_featured ? 'card-featured' : ''}" data-animate="fadeInUp">
            ${p.badge ? `<div class="card-badge">${p.badge}</div>` : ''}
            <div class="card-img-wrap">
              <img src="${p.image}" alt="${p.name}" class="card-img" loading="lazy" />
              <div class="card-img-overlay"></div>
            </div>
            <div class="card-body">
              <div class="card-type">${p.type}</div>
              <h3 class="card-title">${p.name}</h3>
              <p class="card-desc">${p.description}</p>
              <div class="card-tabs">
                <button class="card-tab-btn active" onclick="switchCardTab(this, 'specs')">Spesifikasi</button>
                <button class="card-tab-btn" onclick="switchCardTab(this, 'kpr')">Simulasi KPR</button>
              </div>
              <div class="card-tab-content" data-tab="specs">
                <ul class="card-specs">
                  <li><span class="spec-icon">📐</span> Luas Bangunan: ${p.spec_building}</li>
                  <li><span class="spec-icon">🏡</span> Luas Tanah: ${p.spec_land}</li>
                  <li><span class="spec-icon">🛏️</span> ${p.spec_bedroom}</li>
                  <li><span class="spec-icon">🚿</span> ${p.spec_bathroom}</li>
                </ul>
              </div>
              <div class="card-tab-content" data-tab="kpr" style="display: none;">
                <div class="card-kpr-summary">
                  <div class="kpr-price-row">
                    <span class="kpr-label">Harga KPR:</span>
                    <span class="kpr-value">${p.kpr_price || '-'}</span>
                  </div>
                  <div class="kpr-divider"></div>
                  <div class="kpr-installments-list">
                    ${p.installments ? p.installments.map(inst => `
                      <div class="kpr-inst-item">
                        <span class="kpr-inst-years">${inst.years}</span>
                        <span class="kpr-inst-value">${inst.value}</span>
                      </div>
                    `).join('') : '<div class="kpr-inst-item">Hubungi kami untuk cicilan</div>'}
                  </div>
                </div>
              </div>
              <div class="card-price">
                <span class="price-label">${p.price_label}</span>
                <span class="price-num">${p.price_value}<span class="price-per">${p.price_unit}</span></span>
              </div>
              <button class="btn ${p.is_featured ? 'btn-primary' : 'btn-outline'} card-btn" onclick="showProductDetail('${p.id}')">
                💬 Tanya Sekarang
              </button>
            </div>
          </div>
        `).join('');

        // Re-run animations for newly inserted elements
        observeAnimations();
      }
    }

    // ── Testimonials ──────────────────────────────
    if (data.testimonials?.length) {
      const container = document.getElementById('testimonials-container');
      if (container) {
        container.innerHTML = data.testimonials.map(t => `
          <div class="testi-card" data-animate="fadeInUp">
            <div class="testi-stars">${'★'.repeat(t.stars)}${'☆'.repeat(5 - t.stars)}</div>
            <p class="testi-text">"${t.text}"</p>
            <div class="testi-author">
              <div class="testi-avatar" style="background:${t.avatar_color || '#667eea'}">${t.name[0]}</div>
              <div>
                <div class="testi-name">${t.name}</div>
                <div class="testi-loc">${t.location}</div>
              </div>
            </div>
          </div>
        `).join('');
        observeAnimations();
      }
    }

    // ── Gallery ───────────────────────────────────
    if (data.gallery?.length) {
      const container = document.getElementById('gallery-dynamic');
      if (container) {
        container.innerHTML = data.gallery.map((g, i) => `
          <div class="galeri-item${i === 0 ? ' galeri-large' : i === 3 ? ' galeri-wide' : ''}" data-animate="fadeInUp" onclick="openLightbox('${g.url}', '${g.caption || ''}')">
            <img src="${g.url}" alt="${g.caption || 'Pesona Kahuripan'}" loading="lazy" />
            <div class="galeri-overlay"><span>${g.caption || 'Lihat Foto'}</span></div>
          </div>
        `).join('');
        observeAnimations();
      }
    }

    // ── FAQ ───────────────────────────────────────
    if (data.faq?.length) {
      const container = document.getElementById('faq-dynamic');
      if (container) {
        container.innerHTML = data.faq.map((f, i) => `
          <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
            <button class="faq-question" aria-expanded="false" id="faq-q-${i}">
              <span itemprop="name">${f.question}</span>
              <span class="faq-icon">+</span>
            </button>
            <div class="faq-answer" id="faq-a-${i}" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
              <div itemprop="text"><p>${f.answer}</p></div>
            </div>
          </div>
        `).join('');
        // Re-init FAQ accordion
        initFaqAccordion();
      }
    }

    // ── Keunggulan ────────────────────────────────
    if (data.keunggulan?.length) {
      const container = document.getElementById('keunggulan-container');
      if (container) {
        container.innerHTML = data.keunggulan.map(k => `
          <div class="keunggulan-item" data-animate="fadeInUp">
            <div class="keunggulan-icon">${k.icon}</div>
            <h3 class="keunggulan-title">${k.title}</h3>
            <p class="keunggulan-desc">${k.desc}</p>
          </div>
        `).join('');
        observeAnimations();
      }
    }

    // ── News & Events ─────────────────────────────
    if (data.news?.length) {
      const container = document.getElementById('news-container');
      if (container) {
        container.innerHTML = data.news.map((item, index) => {
          const delay = (index % 3) * 100;
          return `
            <div class="news-card" data-animate="fadeInUp" data-delay="${delay}">
              <div class="news-img-wrapper">
                <img src="${item.image || '/images/news_1.jpg'}" alt="${item.title}" loading="lazy" />
              </div>
              <div class="news-body">
                <span class="news-date">${item.date}</span>
                <h3 class="news-card-title">${item.title}</h3>
                <p class="news-excerpt">${item.excerpt}</p>
                <button class="news-more-btn" onclick="showNewsDetail('${item.id}')">Baca Selengkapnya →</button>
              </div>
            </div>
          `;
        }).join('');
        observeAnimations();
      }
    }

    // ── Projects Badges & Timeline ──────────────────
    if (data.projects?.length) {
      // 1. Location badges grid
      const container = document.getElementById('project-badges-container');
      if (container) {
        container.innerHTML = data.projects.map((p, index) => {
          const isActive = index === data.projects.length - 1; // latest is active by default
          return `
            <button class="project-badge-btn ${isActive ? 'active-badge' : ''}" onclick="showProjectDetails('${p.id}')">
              ${p.title}${p.statusClass === 'status-featured' ? ' (Terbaru)' : ''}
            </button>
          `;
        }).join('');
      }

      // 2. Timeline section
      const timelineTitle = document.getElementById('timeline-title');
      const timelineDesc = document.getElementById('timeline-desc');
      const timelineItemsContainer = document.getElementById('timeline-items-container');
      const timelineCtaText = document.getElementById('timeline-cta-text');
      const timelineCtaBtn = document.getElementById('timeline-cta-btn');

      const totalProjects = data.projects.length;
      if (timelineTitle) {
        timelineTitle.innerHTML = `${totalProjects} Cluster <em>Sukses</em> Kami`;
      }
      if (timelineDesc) {
        timelineDesc.textContent = `Dari Pesona Kahuripan 1 hingga ${totalProjects}, kami terus tumbuh dan dipercaya.`;
      }

      if (timelineItemsContainer) {
        timelineItemsContainer.innerHTML = data.projects.map((p, index) => {
          const isFirst = index === 0;
          const isLast = index === totalProjects - 1;
          const label = isFirst ? 'Pelopor' : isLast ? 'Terbaru!' : '';
          const itemClass = `cluster-item ${isFirst ? 'active' : ''} ${isLast ? 'cluster-new' : ''}`;
          const delay = index * 50;
          
          return `
            <div class="${itemClass}" data-animate="zoomIn" data-delay="${delay}" onclick="showProjectDetails('${p.id}')">
              <div class="cluster-num">${p.title.replace('Pesona Kahuripan ', 'PK ')}</div>
              ${label ? `<div class="cluster-label">${label}</div>` : ''}
            </div>
          `;
        }).join('');
      }

      // Latest project for CTA
      const latestProject = data.projects[totalProjects - 1];
      if (latestProject) {
        if (timelineCtaText) {
          timelineCtaText.textContent = `${latestProject.title} kini telah hadir dengan keunggulan lokasi terbaik.`;
        }
        if (timelineCtaBtn) {
          timelineCtaBtn.textContent = `Info ${latestProject.title.replace('Pesona Kahuripan ', 'PK ')} →`;
          const phoneNum = data.settings?.phone || '6282124964151';
          timelineCtaBtn.href = `https://wa.me/${phoneNum}?text=${encodeURIComponent(latestProject.waMessage)}`;
        }
      }

      observeAnimations();
    }

    // Store phone for WA links
    if (data.settings?.phone) window._sitePhone = data.settings.phone;

  } catch (err) {
    console.log('CMS: Using static content (server offline).');
    fetch('/api/debug/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'loadCmsContent-crash', message: err.message, stack: err.stack })
    }).catch(() => {});
  }
}

// ============================================================
// ANIMATION OBSERVER (reusable)
// ============================================================
function observeAnimations() {
  const animated = document.querySelectorAll('[data-animate]:not(.visible)');
  if (!animated.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  animated.forEach(el => obs.observe(el));
}

// ============================================================
// FAQ ACCORDION (reusable)
// ============================================================
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(fi => {
        fi.classList.remove('open');
        fi.querySelector('.faq-answer')?.classList.remove('open');
        fi.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        answer.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

// Load CMS content immediately (before DOMContentLoaded for faster render)
loadCmsContent();

document.addEventListener('DOMContentLoaded', () => {

  // ---- NAVBAR SCROLL ----
  const navbar = document.getElementById('navbar');
  const handleScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  // ---- HAMBURGER MENU ----
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  const navbarEl = document.getElementById('navbar');
  
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    if (navbarEl) {
      navbarEl.classList.toggle('menu-open');
    }
  });
  // Close menu on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      if (navbarEl) {
        navbarEl.classList.remove('menu-open');
      }
    });
  });

  // ---- ACTIVE NAV HIGHLIGHT ----
  const sections = document.querySelectorAll('section[id]');
  const navLinksList = document.querySelectorAll('.nav-link');
  const navObserverOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
        if (activeLink) {
          navLinksList.forEach(link => link.classList.remove('active'));
          activeLink.classList.add('active');
        }
      }
    });
  }, navObserverOptions);
  sections.forEach(section => navObserver.observe(section));

  // ---- INTERSECTION OBSERVER FOR ANIMATIONS ----
  const animElements = document.querySelectorAll('[data-animate]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;
        setTimeout(() => {
          el.classList.add('visible');
        }, delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  animElements.forEach(el => observer.observe(el));

  // ---- CONTACT FORM → WhatsApp ----
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nama = document.getElementById('nama').value.trim();
      const telepon = document.getElementById('telepon').value.trim();
      const produk = document.getElementById('produk').value;
      const pesan = document.getElementById('pesan').value.trim();

      if (!nama || !telepon) {
        alert('Mohon isi Nama dan Nomor WhatsApp Anda.');
        return;
      }

      const produkMap = {
        subsidi: 'Rumah Subsidi Tipe 30/60',
        komersil36: 'Rumah Komersil Tipe 36/72',
        komersil42: 'Rumah Komersil Tipe 42/90',
        pk12: 'Pesona Kahuripan 12',
      };
      const produkLabel = produkMap[produk] || 'Produk Pesona Kahuripan';

      let msg = `Halo Pesona Kahuripan! 👋\n\n`;
      msg += `Nama: *${nama}*\n`;
      msg += `No. HP: *${telepon}*\n`;
      if (produk) msg += `Produk Diminati: *${produkLabel}*\n`;
      if (pesan) msg += `Pesan: ${pesan}\n`;
      msg += `\nSaya ingin mengetahui lebih lanjut tentang hunian Pesona Kahuripan. Terima kasih!`;

      const waNumber = '6282124964151';
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank', 'noopener');
    });
  }

  // ---- SMOOTH SCROLL FOR ANCHOR LINKS ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });

  // ---- GALERI LIGHTBOX ----
  const galeriItems = document.querySelectorAll('.galeri-item');
  
  // Create lightbox
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  lightbox.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.92);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; pointer-events: none;
    transition: opacity 0.3s ease;
    padding: 20px;
  `;
  const lightboxImg = document.createElement('img');
  lightboxImg.style.cssText = `
    max-width: 90vw; max-height: 85vh;
    object-fit: contain;
    border-radius: 12px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.5);
    transform: scale(0.9);
    transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
  `;
  const lightboxClose = document.createElement('button');
  lightboxClose.innerHTML = '✕';
  lightboxClose.style.cssText = `
    position: absolute; top: 24px; right: 28px;
    color: white; font-size: 1.8rem;
    background: rgba(255,255,255,0.15); border: none;
    width: 48px; height: 48px; border-radius: 50%;
    cursor: pointer; backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    transition: background 0.25s;
  `;
  lightboxClose.addEventListener('mouseenter', () => lightboxClose.style.background = 'rgba(255,255,255,0.25)');
  lightboxClose.addEventListener('mouseleave', () => lightboxClose.style.background = 'rgba(255,255,255,0.15)');
  lightbox.appendChild(lightboxImg);
  lightbox.appendChild(lightboxClose);
  document.body.appendChild(lightbox);

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.style.opacity = '1';
    lightbox.style.pointerEvents = 'all';
    setTimeout(() => { lightboxImg.style.transform = 'scale(1)'; }, 10);
    document.body.style.overflow = 'hidden';
  }
  window.openLightbox = openLightbox;
  function closeLightbox() {
    lightboxImg.style.transform = 'scale(0.9)';
    lightbox.style.opacity = '0';
    lightbox.style.pointerEvents = 'none';
    document.body.style.overflow = '';
  }

  galeriItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) openLightbox(img.src, img.alt);
    });
  });
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  // ---- COUNTER ANIMATION FOR STATS ----
  function animateCounter(el, target, duration = 2000) {
    const start = 0;
    const startTime = performance.now();
    const isFloat = target % 1 !== 0;
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + eased * target);
      el.textContent = current.toLocaleString('id-ID') + '+';
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const stat1Observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = document.getElementById('stat1');
        if (el) animateCounter(el, 15000);
        stat1Observer.disconnect();
      }
    });
  }, { threshold: 0.5 });
  const stat1 = document.getElementById('stat1');
  if (stat1) stat1Observer.observe(stat1);

  // ---- LOKASI PROJECT DETAILS MODAL ----
  function showProjectDetails(id) {
    const projects = (window.cmsData && window.cmsData.projects) || [];
    const project = projects.find(p => p.id == id);
    if (!project) return;
 
    // Update active state in buttons
    const buttons = document.querySelectorAll('.project-badge-btn');
    buttons.forEach(btn => {
      btn.classList.remove('active-badge');
      if (btn.getAttribute('onclick').includes(`'${id}'`)) {
        btn.classList.add('active-badge');
      }
    });

    // Update active state in timeline items
    const timelineItems = document.querySelectorAll('.cluster-item');
    timelineItems.forEach(item => {
      item.classList.remove('active');
      const onclickAttr = item.getAttribute('onclick');
      if (onclickAttr && onclickAttr.includes(`'${id}'`)) {
        item.classList.add('active');
      }
    });
 
    // Update elements
    document.getElementById('modal-project-title').textContent = project.title;
 
    const statusEl = document.getElementById('modal-project-status');
    statusEl.textContent = project.status;
    statusEl.className = 'project-modal-badge ' + project.statusClass;
 
    document.getElementById('modal-project-location').textContent = project.location;
    document.getElementById('modal-project-types').textContent = project.types;
    document.getElementById('modal-project-features').textContent = project.features;
 
    // Update WhatsApp link
    let phoneNum = '6282124964151';
    if (window.cmsData && window.cmsData.settings && window.cmsData.settings.phone) {
      phoneNum = window.cmsData.settings.phone;
    }
    document.getElementById('modal-project-wa').href = `https://wa.me/${phoneNum}?text=${encodeURIComponent(project.waMessage)}`;
 
    // Show modal
    const modal = document.getElementById('projectModal');
    if (modal) {
      modal.classList.add('open');
    }
  }

  function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    if (modal) {
      modal.classList.remove('open');
    }
  }

  // Expose to window
  window.showProjectDetails = showProjectDetails;
  window.closeProjectModal = closeProjectModal;
  
  // Close project modal on escape key and outside click
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProjectModal();
      closeNewsModal();
      closeProductDetailModal();
    }
  });
  
  const modalContainer = document.getElementById('projectModal');
  if (modalContainer) {
    modalContainer.addEventListener('click', (e) => {
      if (e.target === modalContainer) closeProjectModal();
    });
  }

  // ---- NEWS DETAIL MODAL ----
  function showNewsDetail(id) {
    const newsList = (window.cmsData && window.cmsData.news) || [];
    const item = newsList.find(n => n.id === id);
    if (!item) return;

    const modal = document.getElementById('newsModal');
    const imgEl = document.getElementById('news-modal-img');
    const dateEl = document.getElementById('news-modal-date');
    const titleEl = document.getElementById('news-modal-title');
    const textEl = document.getElementById('news-modal-text');
    const waEl = document.getElementById('news-modal-wa');

    if (imgEl) { imgEl.src = item.image || '/images/news_1.jpg'; imgEl.alt = item.title; }
    if (dateEl) dateEl.textContent = item.date;
    if (titleEl) titleEl.textContent = item.title;
    if (textEl) textEl.innerHTML = item.excerpt.replace(/\n/g, '<br>');

    // WA link for follow-up
    let phoneNum = '6282124964151';
    if (window.cmsData && window.cmsData.settings && window.cmsData.settings.phone) {
      phoneNum = window.cmsData.settings.phone;
    }
    if (waEl) waEl.href = `https://wa.me/${phoneNum}?text=${encodeURIComponent('Halo, saya ingin bertanya detail mengenai berita: ' + item.title)}`;

    if (modal) modal.classList.add('open');
  }

  function closeNewsModal() {
    const modal = document.getElementById('newsModal');
    if (modal) modal.classList.remove('open');
  }

  // Expose news modal to window
  window.showNewsDetail = showNewsDetail;
  window.closeNewsModal = closeNewsModal;

  // Close news modal on backdrop click
  const newsModalContainer = document.getElementById('newsModal');
  if (newsModalContainer) {
    newsModalContainer.addEventListener('click', (e) => {
      if (e.target === newsModalContainer) closeNewsModal();
    });
  }

  // ---- SYARAT & KETENTUAN TABS ----
  function switchRequirementTab(event, tabId) {
    if (event) event.preventDefault();

    // Remove active class from all header buttons
    const tabBtns = document.querySelectorAll('.req-tab-header-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));

    // Add active class to the clicked tab button
    if (event && event.currentTarget) {
      event.currentTarget.classList.add('active');
    }

    // Hide all tab content panes
    const tabPanes = document.querySelectorAll('.requirements-tab-pane');
    tabPanes.forEach(pane => pane.classList.remove('active'));

    // Show selected tab content pane
    const activePane = document.getElementById(tabId);
    if (activePane) activePane.classList.add('active');
  }

  // Expose tab switcher globally
  window.switchRequirementTab = switchRequirementTab;

  // ---- PRODUCT DETAIL MODAL ----
  function showProductDetail(id) {
    const productsList = (window.cmsData && window.cmsData.products) || [
      {
        id: 'prod-1',
        type: 'Rumah Subsidi',
        name: 'Tipe 30/60 · FLPP KPR Bersubsidi',
        description: 'Hunian idaman dengan skema KPR FLPP bersubsidi pemerintah. Konstruksi double dinding terkokoh di kelasnya, bebas banjir, cicilan ringan flat sampai lunas.',
        spec_building: '30 m²',
        spec_land: '60 m²',
        spec_bedroom: '2 Kamar Tidur',
        spec_bathroom: '1 Kamar Mandi',
        kpr_price: 'Rp 185.000.000',
        installments: [
          { years: '20 Tahun', value: 'Rp 1.192.574 /bln' },
          { years: '15 Tahun', value: 'Rp 1.427.023 /bln' },
          { years: '10 Tahun', value: 'Rp 1.910.587 /bln' }
        ],
        image: 'house_subsidi.png',
        badge: '🏅 Terlaris',
        wa_message: 'Halo, saya tertarik dengan Rumah Subsidi Tipe 30/60 FLPP'
      },
      {
        id: 'prod-2',
        type: 'Rumah Komersil',
        name: 'Tipe 36/72 · Cluster Komersial Modern',
        description: 'Desain minimalis modern bergaya Jepang, memiliki halaman depan luas, dan berada strategis dekat gerbang masuk komplek utama.',
        spec_building: '36 m²',
        spec_land: '72 m²',
        spec_bedroom: '2 Kamar Tidur',
        spec_bathroom: '1 Kamar Mandi',
        kpr_price: 'Rp 385.000.000',
        installments: [
          { years: '20 Tahun', value: 'Rp 2.480.000 /bln' },
          { years: '15 Tahun', value: 'Rp 2.950.000 /bln' },
          { years: '10 Tahun', value: 'Rp 3.820.000 /bln' }
        ],
        image: 'house_komersil.png',
        badge: '✨ Best Value',
        wa_message: 'Halo, saya tertarik dengan Rumah Komersil Tipe 36/72 Modern'
      },
      {
        id: 'prod-3',
        type: 'Rumah Komersil Premium',
        name: 'Tipe 42/90 · Cluster Premium Mewah',
        description: 'Unit premium termewah dengan spesifikasi double dinding eksklusif, plafon tinggi, sirkulasi udara optimal, dan halaman belakang luas.',
        spec_building: '42 m²',
        spec_land: '90 m²',
        spec_bedroom: '3 Kamar Tidur',
        spec_bathroom: '2 Kamar Mandi',
        kpr_price: 'Rp 480.000.000',
        installments: [
          { years: '20 Tahun', value: 'Rp 2.980.000 /bln' },
          { years: '15 Tahun', value: 'Rp 3.520.000 /bln' },
          { years: '10 Tahun', value: 'Rp 4.650.000 /bln' }
        ],
        image: 'house_exterior.png',
        badge: '⭐ Unit Terbatas',
        wa_message: 'Halo, saya tertarik dengan Rumah Komersil Premium Tipe 42/90 Mewah'
      }
    ];

    const p = productsList.find(x => x.id === id);
    if (!p) return;

    const modal = document.getElementById('productDetailModal');
    const badgeEl = document.getElementById('modal-product-badge');
    const typeEl = document.getElementById('modal-product-type');
    const nameEl = document.getElementById('modal-product-name');
    const imgEl = document.getElementById('modal-product-img');
    const descEl = document.getElementById('modal-product-desc');
    const specBuildingEl = document.getElementById('modal-product-spec-building');
    const specLandEl = document.getElementById('modal-product-spec-land');
    const specBedroomEl = document.getElementById('modal-product-spec-bedroom');
    const specBathroomEl = document.getElementById('modal-product-spec-bathroom');
    const kprPriceEl = document.getElementById('modal-product-kpr-price');
    const installmentsTbody = document.getElementById('modal-product-installments-tbody');
    const waEl = document.getElementById('modal-product-wa');

    if (badgeEl) {
      if (p.badge) {
        badgeEl.textContent = p.badge;
        badgeEl.style.display = 'inline-block';
      } else {
        badgeEl.style.display = 'none';
      }
    }
    if (typeEl) typeEl.textContent = p.type;
    if (nameEl) nameEl.textContent = p.name;
    if (imgEl) {
      imgEl.src = p.image;
      imgEl.alt = p.name;
    }
    if (descEl) descEl.textContent = p.description;
    if (specBuildingEl) specBuildingEl.textContent = `Luas Bangunan: ${p.spec_building}`;
    if (specLandEl) specLandEl.textContent = `Luas Tanah: ${p.spec_land}`;
    if (specBedroomEl) specBedroomEl.textContent = p.spec_bedroom;
    if (specBathroomEl) specBathroomEl.textContent = p.spec_bathroom;
    if (kprPriceEl) kprPriceEl.textContent = p.kpr_price || 'Hubungi Kami';

    if (installmentsTbody) {
      if (p.installments && p.installments.length) {
        installmentsTbody.innerHTML = p.installments.map(i => `
          <tr>
            <td><strong>${i.years}</strong></td>
            <td><span class="installment-amount">${i.value}</span></td>
          </tr>
        `).join('');
      } else {
        installmentsTbody.innerHTML = `
          <tr>
            <td colspan="2" style="text-align:center;color:#888;padding:15px 0;">Hubungi sales untuk simulasi KPR</td>
          </tr>
        `;
      }
    }

    // Set WA href
    let phoneNum = '6282124964151';
    if (window.cmsData && window.cmsData.settings && window.cmsData.settings.phone) {
      phoneNum = window.cmsData.settings.phone;
    }
    const defaultMsg = `Halo, saya tertarik dengan ${p.name}. Mohon informasi detail KPR dan jadwal survey lokasi.`;
    const waText = p.wa_message || defaultMsg;
    if (waEl) {
      waEl.href = `https://wa.me/${phoneNum}?text=${encodeURIComponent(waText)}`;
    }

    if (modal) modal.classList.add('open');
  }

  function closeProductDetailModal() {
    const modal = document.getElementById('productDetailModal');
    if (modal) modal.classList.remove('open');
  }

  // Expose product detail modal to window
  window.showProductDetail = showProductDetail;
  window.closeProductDetailModal = closeProductDetailModal;

  // Close product modal on backdrop click
  const productDetailModalContainer = document.getElementById('productDetailModal');
  if (productDetailModalContainer) {
    productDetailModalContainer.addEventListener('click', (e) => {
      if (e.target === productDetailModalContainer) closeProductDetailModal();
    });
  }

  // ---- CARD TAB SWITCHER ----
  function switchCardTab(btn, tabName) {
    const card = btn.closest('.product-card');
    if (!card) return;
    
    // Toggle tab buttons
    card.querySelectorAll('.card-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Toggle tab contents
    card.querySelectorAll('.card-tab-content').forEach(content => {
      if (content.getAttribute('data-tab') === tabName) {
        content.style.display = 'block';
      } else {
        content.style.display = 'none';
      }
    });
  }

  // Expose switcher globally
  window.switchCardTab = switchCardTab;

  // ---- LAZY LOAD GOOGLE MAPS IFRAME ----
  const mapIframe = document.querySelector('.map-container iframe');
  if (mapIframe) {
    const mapObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const src = mapIframe.getAttribute('data-src');
          if (src) {
            mapIframe.src = src;
            mapIframe.removeAttribute('data-src');
          }
          mapObserver.disconnect();
        }
      });
    }, { rootMargin: '300px 0px' });
    mapObserver.observe(mapIframe);
  }
});
