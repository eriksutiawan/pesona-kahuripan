// server/database.js — Hybrid Database (Supabase with lowdb Local Fallback)
require('dotenv').config();

// Polyfill WebSocket for Node.js environments (required for Supabase Realtime in Node < 22)
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = require('ws');
}

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;
let localDb = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client initialized (Cloud Database mode)');
} else {
  console.log('⚠️ Supabase credentials missing. Falling back to local db.json.');
  const low = require('lowdb');
  const FileSync = require('lowdb/adapters/FileSync');
  const dbPath = path.join(__dirname, '../db.json');
  const adapter = new FileSync(dbPath);
  localDb = low(adapter);
  console.log('✅ Local Database initialized (Local db.json mode)');
}

async function dbGet(key) {
  if (supabase) {
    const { data, error } = await supabase.from('contents').select('value').eq('id', key).single();
    if (error) {
      if (error.code === 'PGRST116') { // Record not found
        return null;
      }
      throw error;
    }
    return data ? data.value : null;
  } else {
    return localDb.get(key).value();
  }
}

async function dbSet(key, value) {
  if (supabase) {
    const { error } = await supabase.from('contents').upsert({ id: key, value, updated_at: new Date().toISOString() });
    if (error) throw error;
    return true;
  } else {
    localDb.set(key, value).write();
    return true;
  }
}

async function initDatabase() {
  const defaults = {
    hero: {
      badge: '✦ Perumahan Terpercaya di Bogor',
      title: 'Wujudkan Rumah',
      title_em: 'Impian Anda',
      subtitle: 'Rumah Subsidi & Komersil Double Dinding Terbesar di Bogor.',
      subtitle_highlight: 'Rp 1 Jutaan',
      subtitle_units: '15.000 Unit',
      cta_primary_text: 'Lihat Produk',
      cta_primary_href: '#products',
      cta_wa_text: 'WhatsApp Sekarang',
      updated_at: new Date().toISOString()
    },
    stats: [
      { id: 1, label: 'Unit Terbangun', value: '15.000+', icon: '🏘️', order: 1 },
      { id: 2, label: 'Cluster Selesai', value: '12', icon: '📍', order: 2 },
      { id: 3, label: 'Tahun Pengalaman', value: '13+', icon: '🏆', order: 3 }
    ],
    settings: {
      company_name: 'Pesona Kahuripan Group',
      tagline: 'Membangun Hunian Impian Keluarga Indonesia',
      phone: '6282124964151',
      phone_display: '0821-2496-4151',
      address: 'Jl. Pesona Kahuripan 1, Desa Cikahuripan, Kec. Klapanunggal, Kab. Bogor, Jawa Barat',
      hours: 'Setiap Hari: 08.00 – 21.00 WIB',
      about_title: 'Membangun Mimpi, Satu Rumah di Satu Waktu',
      about_text: 'Pesona Kahuripan Group adalah pengembang perumahan terpercaya yang telah berdiri sejak 2013. Dengan pengalaman lebih dari satu dekade, kami telah berhasil membangun lebih dari 15.000 unit rumah yang menjadi rumah idaman bagi ribuan keluarga Indonesia.',
      about_text2: 'Kami hadir sebagai solusi hunian terjangkau namun berkualitas tinggi, dengan konstruksi Double Dinding yang kokoh dan desain modern yang tak lekang oleh waktu.',
      founded_year: '2013',
      instagram: 'https://www.instagram.com/perum_pesonakahuripan.official?utm_source=qr&igsh=cXN1OHE4d2l2eDBy',
      facebook: 'https://www.facebook.com/profile.php?id=61575422217807&rdid=EFFceOEjDSSmqqbK&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1BEMYd718D%2F%3Fref%3D1#',
      youtube: 'https://www.youtube.com/@rumahsubsidi.pesonakahuripan',
      tiktok: 'https://www.tiktok.com/@property.pesonakahuripan?_r=1&_t=ZS-97QP5a2hp8z',
      maps_url: 'https://maps.google.com/?q=Cikahuripan,Klapanunggal,Bogor',
      maps_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.5!2d107.0!3d-6.45!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e699c0f2e!2sCikahuripan%2C+Klapanunggal%2C+Bogor!5e0!3m2!1sid!2sid!4v1700000000',
      footer_text: 'Membangun hunian impian keluarga Indonesia sejak 2013. Lebih dari 15.000 unit telah kami serahterimakan.',
      updated_at: new Date().toISOString()
    },
    products: [
      {
        id: 'prod-1',
        type: 'Rumah Subsidi',
        name: 'Tipe 30/60 · FLPP KPR Bersubsidi',
        description: 'Hunian idaman dengan skema KPR FLPP bersubsidi pemerintah. Konstruksi double dinding terkokoh di kelasnya, bebas banjir, cicilan ringan flat sampai lunas.',
        spec_building: '30 m²',
        spec_land: '60 m²',
        spec_bedroom: '2 Kamar Tidur',
        spec_bathroom: '1 Kamar Mandi',
        price_label: 'Cicilan Mulai',
        price_value: 'Rp 1 Juta',
        price_unit: '/bln',
        kpr_price: 'Rp 185.000.000',
        installments: [
          { years: '20 Tahun', value: 'Rp 1.192.574 /bln' },
          { years: '15 Tahun', value: 'Rp 1.427.023 /bln' },
          { years: '10 Tahun', value: 'Rp 1.910.587 /bln' }
        ],
        image: '/images/house_subsidi.png',
        is_featured: true,
        badge: '🏅 Terlaris',
        wa_message: 'Halo, saya tertarik dengan Rumah Subsidi Tipe 30/60 FLPP',
        order: 1,
        created_at: new Date().toISOString()
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
        price_label: 'Cicilan Mulai',
        price_value: 'Rp 1,8 Juta',
        price_unit: '/bln',
        kpr_price: 'Rp 385.000.000',
        installments: [
          { years: '20 Tahun', value: 'Rp 2.480.000 /bln' },
          { years: '15 Tahun', value: 'Rp 2.950.000 /bln' },
          { years: '10 Tahun', value: 'Rp 3.820.000 /bln' }
        ],
        image: '/images/house_komersil.png',
        is_featured: false,
        badge: '✨ Best Value',
        wa_message: 'Halo, saya tertarik dengan Rumah Komersil Tipe 36/72 Modern',
        order: 2,
        created_at: new Date().toISOString()
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
        price_label: 'Cicilan Mulai',
        price_value: 'Rp 2,5 Juta',
        price_unit: '/bln',
        kpr_price: 'Rp 480.000.000',
        installments: [
          { years: '20 Tahun', value: 'Rp 2.980.000 /bln' },
          { years: '15 Tahun', value: 'Rp 3.520.000 /bln' },
          { years: '10 Tahun', value: 'Rp 4.650.000 /bln' }
        ],
        image: '/images/house_exterior.png',
        is_featured: true,
        badge: '⭐ Unit Terbatas',
        wa_message: 'Halo, saya tertarik dengan Rumah Komersil Premium Tipe 42/90 Mewah',
        order: 3,
        created_at: new Date().toISOString()
      }
    ],
    testimonials: [
      {
        id: 'testi-1',
        name: 'Ahmad Fauzi',
        location: 'Klapanunggal, Bogor',
        stars: 5,
        text: 'Proses KPR sangat cepat dan tim marketing sangat membantu. Sekarang saya sudah punya rumah sendiri dengan cicilan yang tidak membebani.',
        avatar_color: '#667eea',
        order: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 'testi-2',
        name: 'Siti Rahmawati',
        location: 'Cileungsi, Bogor',
        stars: 5,
        text: 'Rumah dengan double dinding memang beda, jauh lebih tenang dari kebisingan luar. Desainnya pun modern dan bersih. Sangat puas!',
        avatar_color: '#f5576c',
        order: 2,
        created_at: new Date().toISOString()
      },
      {
        id: 'testi-3',
        name: 'Budi Santoso',
        location: 'Jakarta Timur',
        stars: 5,
        text: 'Lokasi sangat strategis, dekat tol dan fasilitas lengkap. Developer yang jujur dan transparan. Highly recommended buat yang mau KPR pertama!',
        avatar_color: '#4facfe',
        order: 3,
        created_at: new Date().toISOString()
      }
    ],
    gallery: [
      { id: 'gal-1', url: '/images/hero.png', caption: 'Aerial View Perumahan', order: 1, created_at: new Date().toISOString() },
      { id: 'gal-2', url: '/images/house_subsidi.png', caption: 'Rumah Subsidi', order: 2, created_at: new Date().toISOString() },
      { id: 'gal-3', url: '/images/house_komersil.png', caption: 'Rumah Komersil', order: 3, created_at: new Date().toISOString() },
      { id: 'gal-4', url: '/images/interior.png', caption: 'Interior Modern', order: 4, created_at: new Date().toISOString() },
      { id: 'gal-5', url: '/images/neighborhood.png', caption: 'Lingkungan Asri', order: 5, created_at: new Date().toISOString() },
      { id: 'gal-6', url: '/images/house_exterior.png', caption: 'Eksterior Premium', order: 6, created_at: new Date().toISOString() }
    ],
    faq: [
      {
        id: 'faq-1',
        question: 'Berapa cicilan KPR subsidi Pesona Kahuripan per bulan?',
        answer: 'Cicilan KPR subsidi Pesona Kahuripan mulai dari Rp 1 Jutaan per bulan, bersifat flat (tidak naik) sampai lunas dengan skema KPR FLPP bersubsidi pemerintah.',
        order: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 'faq-2',
        question: 'Di mana lokasi Pesona Kahuripan dan bagaimana aksesnya?',
        answer: 'Pesona Kahuripan berlokasi di Desa Cikahuripan, Kecamatan Klapanunggal, Kabupaten Bogor. Dekat Tol Cileungsi (5 menit), Jakarta Timur (45 menit via tol), Bekasi (30 menit).',
        order: 2,
        created_at: new Date().toISOString()
      },
      {
        id: 'faq-3',
        question: 'Apa saja syarat pengajuan KPR subsidi Pesona Kahuripan?',
        answer: 'Syarat: WNI usia 21–65 tahun, belum pernah memiliki rumah, penghasilan maks Rp 8 juta/bulan, memiliki NPWP dan rekening tabungan, tidak sedang kredit bermasalah.',
        order: 3,
        created_at: new Date().toISOString()
      },
      {
        id: 'faq-4',
        question: 'Apa keunggulan rumah Double Dinding Pesona Kahuripan?',
        answer: 'Double Dinding (dua lapis bata) membuat rumah lebih kokoh, kedap suara, insulasi panas lebih baik, dan anti-bocor. Keunggulan eksklusif yang tidak dimiliki developer subsidi lain.',
        order: 4,
        created_at: new Date().toISOString()
      },
      {
        id: 'faq-5',
        question: 'Apakah Pesona Kahuripan 12 sudah bisa dipesan sekarang?',
        answer: 'Ya! Pesona Kahuripan 12 cluster terbaru sudah bisa dipesan. Lokasi di pinggir Jalan Provinsi, tersedia rumah subsidi dan komersial, ready stock. Hubungi 0821-2496-4151.',
        order: 5,
        created_at: new Date().toISOString()
      }
    ],
    keunggulan: [
      { id: 'k-1', icon: '🧱', title: 'Double Dinding', desc: 'Konstruksi eksklusif dengan dua lapis dinding untuk ketahanan struktural lebih baik dan insulasi suara optimal.', order: 1 },
      { id: 'k-2', icon: '📍', title: 'Lokasi Strategis', desc: 'Terletak di Cileungsi & Klapanunggal, Bogor – akses mudah ke Jakarta, Bekasi, dan seluruh wilayah Jabodetabek.', order: 2 },
      { id: 'k-3', icon: '💳', title: 'Cicilan Ringan', desc: 'Subsidi FLPP dengan cicilan flat mulai 1 Jutaan hingga lunas. DP ringan dan proses pengajuan mudah & cepat.', order: 3 },
      { id: 'k-4', icon: '🏆', title: 'Track Record Terbukti', desc: 'Lebih dari 15.000 unit telah diserahterimakan sejak 2013. Salah satu realisasi penjualan subsidi tertinggi nasional.', order: 4 },
      { id: 'k-5', icon: '🌿', title: 'Lingkungan Asri', desc: 'Dikelilingi alam hijau Bogor yang sejuk. Fasilitas taman, jogging track, dan ruang terbuka hijau tersedia.', order: 5 },
      { id: 'k-6', icon: '🛡️', title: 'Legalitas Jelas', desc: 'SHM (Sertifikat Hak Milik) atas nama pembeli. IMB lengkap, terdaftar TAPERA dan kementerian PUPR.', order: 6 }
    ],
    news: [
      {
        id: "news-1",
        title: "BTN Gelar Akad Massal KPR dan KUR di Pesona Kahuripan 9",
        date: "Aug 1, 2024",
        image: "/images/news_1.jpg",
        excerpt: "PT Bank Tabungan Negara (Persero) Tbk (BTN) menggelar akad massal Kredit Pemilikan Rumah (KPR) Subsidi dan Non-Subsidi serta Kredit Usaha Rakyat (KUR) bagi ratusan nasabah di proyek perumahan subsidi Pesona Kahuripan 9, Kabupaten Bogor, Jawa Barat. Langkah ini merupakan wujud nyata BTN dalam mempermudah akses hunian layak bagi masyarakat berpenghasilan rendah.",
        order: 1,
        created_at: new Date().toISOString()
      },
      {
        id: "news-2",
        title: "Pesona Kahuripan Group: Membangun Mimpi Kehidupan di Perumahan Berkualitas",
        date: "Jul 19, 2024",
        image: "/images/news_2.jpg",
        excerpt: "Pesona Kahuripan Group, pengembang perumahan ternama di Indonesia, telah berkecimpung dalam dunia properti selama lebih dari satu dekade. Didirikan dengan visi misi untuk menyediakan hunian berkualitas dan terjangkau bagi masyarakat, Pesona Kahuripan Group berkomitmen terus memperluas portofolio proyek perumahan double dinding terbaik di Bogor.",
        order: 2,
        created_at: new Date().toISOString()
      },
      {
        id: "news-3",
        title: "Grand Launching Pesona Kahuripan 11",
        date: "Jul 19, 2024",
        image: "/images/news_3.jpeg",
        excerpt: "Proyek perumahan non-subsidi Pesona Kahuripan 11 di Kabupaten Bogor resmi dibuka bersama Bank Tabungan Negara (BTN) pada Minggu (24/3). Acara grand launching yang meriah ini dihadiri jajaran direksi BTN, asosiasi pengembang, tokoh masyarakat setempat, serta ratusan calon pembeli yang antusias mengantre promo unit perdana.",
        order: 3,
        created_at: new Date().toISOString()
      },
      {
        id: "news-4",
        title: "Akad Perdana Pesona Kahuripan 11",
        date: "Jun 10, 2024",
        image: "/images/news_4.jpg",
        excerpt: "Setelah peluncuran sukses, PT Bank Tabungan Negara Tbk (BTN) menyelenggarakan akad massal perdana untuk 200 unit KPR subsidi dan non-subsidi di cluster terbaru Pesona Kahuripan 11. Proses administrasi akad massal yang efisien ini membantu para pembeli menerima serah terima kunci rumah impian secara instan.",
        order: 4,
        created_at: new Date().toISOString()
      },
      {
        id: "news-5",
        title: "Grand Launching Pesona Kahuripan 11 Banyak Promonya",
        date: "Mar 21, 2024",
        image: "/images/news_5.jpeg",
        excerpt: "Daftar segera dan dapatkan berbagai promo diskon uang muka (DP), cicilan ringan, serta undian elektronik menarik dalam festival perayaan Grand Launching Pesona Kahuripan 11. Cluster ini berlokasi strategis di Jalan Cileungsi - Jonggol KM 5, Gandoang, dekat sarana transportasi publik dan komersil utama.",
        order: 5,
        created_at: new Date().toISOString()
      },
      {
        id: "news-6",
        title: "Pesona Kahuripan Mendapatkan Penghargaan Lagi dari BUMN",
        date: "Dec 14, 2023",
        image: "/images/news_6.jpeg",
        excerpt: "Menutup akhir tahun dengan prestasi gemilang, Pesona Kahuripan Group kembali dinobatkan sebagai salah satu pengembang perumahan FLPP (Subsidi) terbaik secara nasional oleh Kementerian BUMN and Bank BTN. Penghargaan ini diraih atas kontribusi luar biasa dalam menyukseskan program sejuta rumah bagi masyarakat.",
        order: 6,
        created_at: new Date().toISOString()
      }
    ],
    projects: [
      {
        id: "1",
        title: "Pesona Kahuripan 1",
        status: "Sold Out",
        statusClass: "status-soldout",
        location: "Desa Cikahuripan, Kec. Klapanunggal, Kab. Bogor",
        types: "Subsidi Tipe 30/60 (Double Dinding Hebel)",
        features: "Proyek perdana kami yang sukses besar dengan 100% tingkat kepemilikan. Dekat dengan jalan raya Klapanunggal, dilengkapi sarana ibadah masjid dan taman lingkungan yang hijau.",
        waMessage: "Halo, saya ingin bertanya tentang perumahan Pesona Kahuripan 1.",
        order: 1
      },
      {
        id: "2",
        title: "Pesona Kahuripan 2",
        status: "Sold Out",
        statusClass: "status-soldout",
        location: "Desa Cikahuripan, Kec. Klapanunggal, Kab. Bogor",
        types: "Subsidi Tipe 30/60 (Double Dinding Hebel)",
        features: "Pengembangan tahap kedua di kawasan asri Cikahuripan. Lingkungan ramah anak, jalan beton lebar, drainase bebas banjir, serta sistem cluster keamanan tinggi.",
        waMessage: "Halo, saya ingin bertanya tentang perumahan Pesona Kahuripan 2.",
        order: 2
      },
      {
        id: "3",
        title: "Pesona Kahuripan 3",
        status: "Sold Out",
        statusClass: "status-soldout",
        location: "Desa Bojong Mampir, Kec. Cileungsi, Kab. Bogor",
        types: "Subsidi Tipe 30/60 (Double Dinding)",
        features: "Kawasan strategis di wilayah Bojong Mampir, Cileungsi. Sangat dekat dengan pusat pendidikan sekolah, puskesmas, dan pasar tradisional lokal.",
        waMessage: "Halo, saya ingin bertanya tentang perumahan Pesona Kahuripan 3.",
        order: 3
      },
      {
        id: "4",
        title: "Pesona Kahuripan 4",
        status: "Sold Out",
        statusClass: "status-soldout",
        location: "Desa Bojong, Kec. Klapanunggal, Kab. Bogor",
        types: "Subsidi Tipe 30/60 (Double Dinding)",
        features: "Kawasan dengan nuansa alam asri dan pemandangan perbukitan yang hijau. Memiliki akses jalan yang mudah dan fasilitas umum komplek yang memadai.",
        waMessage: "Halo, saya ingin bertanya tentang perumahan Pesona Kahuripan 4.",
        order: 4
      },
      {
        id: "5",
        title: "Pesona Kahuripan 5",
        status: "Sold Out",
        statusClass: "status-soldout",
        location: "Desa Cikahuripan, Kec. Klapanunggal, Kab. Bogor",
        types: "Subsidi Tipe 30/60 (Double Dinding)",
        features: "Kawasan cluster eksklusif dengan sistem gerbang tunggal (One Gate System). Dekat sarana olah raga dan transportasi umum lokal yang mudah dijangkau.",
        waMessage: "Halo, saya ingin bertanya tentang perumahan Pesona Kahuripan 5.",
        order: 5
      },
      {
        id: "6",
        title: "Pesona Kahuripan 6",
        status: "Sold Out",
        statusClass: "status-soldout",
        location: "Desa Dayeuh, Kec. Cileungsi, Kab. Bogor",
        types: "Subsidi Tipe 30/60 (Double Dinding)",
        features: "Hunian strategis di Desa Dayeuh, Cileungsi. Hanya berjarak beberapa menit dari pusat perbelanjaan swalayan, stasiun pengisian bahan bakar (SPBU), dan sekolah negeri.",
        waMessage: "Halo, saya ingin bertanya tentang perumahan Pesona Kahuripan 6.",
        order: 6
      },
      {
        id: "7",
        title: "Pesona Kahuripan 7",
        status: "Sold Out",
        statusClass: "status-soldout",
        location: "Desa Dayeuh, Kec. Cileungsi, Kab. Bogor",
        types: "Subsidi Tipe 30/60 (Double Dinding)",
        features: "Melanjutkan kesuksesan tahap 6 dengan sistem pengelolaan air mandiri bebas banjir. Fasilitas umum lengkap termasuk balai warga dan lapangan olahraga.",
        waMessage: "Halo, saya ingin bertanya tentang perumahan Pesona Kahuripan 7.",
        order: 7
      },
      {
        id: "8",
        title: "Pesona Kahuripan 8",
        status: "Sold Out",
        statusClass: "status-soldout",
        location: "Desa Muktijaya, Kec. Setu, Kab. Bekasi",
        types: "Subsidi Tipe 30/60 (Double Dinding)",
        features: "Ekspansi pertama kami di wilayah Setu, Bekasi. Lokasi sangat favorit untuk pekerja industri karena akses super cepat ke area MM2100 dan pintu Tol Setu.",
        waMessage: "Halo, saya ingin bertanya tentang perumahan Pesona Kahuripan 8.",
        order: 8
      },
      {
        id: "9",
        title: "Pesona Kahuripan 9",
        status: "Ready Stock & Inden",
        statusClass: "status-active",
        location: "Desa Jatisari, Kec. Cileungsi, Kab. Bogor",
        types: "Subsidi Tipe 30/60 & Ruko Komersil",
        features: "Cluster modern dengan area ruko komersial yang ramai di jalan utama perumahan. Dekat sarana ibadah besar dan memiliki rute angkot langsung.",
        waMessage: "Halo, saya tertarik dengan unit perumahan di Pesona Kahuripan 9. Mohon informasinya.",
        order: 9
      },
      {
        id: "11",
        title: "Pesona Kahuripan 11",
        status: "Pemasaran Aksif",
        statusClass: "status-active",
        location: "Desa Gandoang, Kec. Cileungsi, Kab. Bogor",
        types: "Subsidi & Komersil (Tipe 36/66, 42/90)",
        features: "Menyediakan kombinasi unit subsidi dengan rumah komersil premium. Memiliki utilitas bawah tanah (underground utilities) and one gate system yang aman.",
        waMessage: "Halo, saya tertarik dengan unit perumahan di Pesona Kahuripan 11. Mohon informasinya.",
        order: 10
      },
      {
        id: "12",
        title: "Pesona Kahuripan 12",
        status: "Unit Terbaru & Terlaris",
        statusClass: "status-featured",
        location: "Pinggir Jalan Provinsi, Cileungsi (Jatisari), Kab. Bogor",
        types: "Subsidi & Komersil Premium (Double Dinding)",
        features: "Proyek terbaru kami yang berlokasi langsung di pinggir Jalan Provinsi utama. Akses super mudah, dekat jalan tol baru, unit ready stock double dinding hebel.",
        waMessage: "Halo, saya tertarik dengan unit perumahan di Pesona Kahuripan 12 (Terbaru). Mohon informasinya.",
        order: 11
      }
    ],
    users: [
      {
        id: 'user-1',
        username: 'admin',
        password: bcrypt.hashSync('admin123', 10),
        name: 'Administrator',
        created_at: new Date().toISOString()
      }
    ]
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from('contents').select('id').eq('id', 'hero').single();
      if (data) {
        console.log('✅ Supabase Database already seeded');
        return;
      }

      console.log('⏳ Seeding Supabase database with default values...');
      for (const [key, val] of Object.entries(defaults)) {
        const { error } = await supabase.from('contents').upsert({ id: key, value: val, updated_at: new Date().toISOString() });
        if (error) {
          console.error(`❌ Failed to seed ${key}:`, error.message);
        }
      }
      console.log('✅ Supabase database seeding complete!');
    } catch (err) {
      console.error('❌ Supabase database initialization error:', err.message);
    }
  } else {
    // If localDb is empty, set defaults
    if (!localDb.has('hero').value()) {
      localDb.defaults(defaults).write();
      console.log('✅ Local Database initialized with default data');
    } else {
      console.log('✅ Local Database already populated');
    }
  }
}

module.exports = { dbGet, dbSet, initDatabase, supabase };
