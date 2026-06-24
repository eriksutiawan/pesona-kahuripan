# 📘 BUKU PANDUAN PENGGUNAAN CMS & WEBSITE
**Pesona Kahuripan Group — Halaman Admin Panel**

Buku panduan ini disusun khusus untuk memudahkan pemilik/pengelola website dalam mengelola seluruh konten, properti, berita, dan pengaturan website Pesona Kahuripan Group secara mandiri melalui Admin Panel (CMS).

---

## 1. 🔑 Akses Masuk & Keamanan

### A. Cara Login ke Admin Panel
1. Buka browser Anda (Google Chrome, Safari, atau Edge).
2. Akses halaman admin panel melalui alamat URL berikut:
   `https://[domain-website-anda]/admin`  
   *(Jika dijalankan lokal di komputer pengembang: `http://localhost:3000/admin`)*
3. Masukkan data kredensial default berikut:
   *   **Username**: `admin`
   *   **Password**: `admin123`
4. Klik tombol **Login** untuk masuk ke dashboard.

> [!WARNING]
> Demi keamanan website Anda, **sangat disarankan** untuk segera mengubah password default Anda setelah login pertama kali.

### B. Cara Mengganti Password
1. Pilih menu 🔒 **Ganti Password** pada sidebar sebelah kiri.
2. Masukkan **Password Lama** (saat ini).
3. Masukkan **Password Baru** (minimal 6 karakter).
4. Klik tombol **Ganti Password** untuk menyimpan.
5. Gunakan password baru ini untuk login berikutnya.

---

## 2. 📊 Mengenal Tampilan Dashboard Utama

Setelah berhasil login, Anda akan disuguhkan dengan halaman **Dashboard** yang memuat:
*   **Ringkasan Statistik Cepat**: Jumlah produk rumah aktif, total cluster sukses, jumlah galeri foto, berita terposting, testimoni pelanggan, dan daftar FAQ.
*   **Akses Cepat**: Tombol pintas untuk langsung melompat ke halaman pengeditan konten tertentu tanpa harus mencari di sidebar.

---

## 3. 📝 Panduan Mengedit Konten Website (Menu per Menu)

### 🖼️ A. Menu: Hero & Banner
Menu ini mengontrol teks pembuka dan gambar di halaman paling atas website (bagian pertama yang dilihat pengunjung).
*   **Teks yang Dapat Diubah**:
    *   *Badge/Label Kecil*: Tulisan kecil di atas judul utama (Contoh: `✦ Perumahan Terpercaya di Bogor`).
    *   *Judul Utama & Highlight*: Judul besar beranda (Contoh: `Wujudkan Rumah Impian Anda`).
    *   *Subtitle & Highlight Unit*: Subtitle di bawah judul beserta info cicilan bulanan atau total unit (Contoh: `Rumah Subsidi & Komersil Double Dinding Terbesar di Bogor. Mulai Rp 1 Jutaan`).
    *   *Teks Tombol*: Mengubah tulisan tombol arah navigasi atau tombol WhatsApp.
*   **Statistik Perusahaan**:
    *   Anda dapat mengedit angka pencapaian perusahaan (misal: jumlah Unit Terbangun, Cluster Selesai, dan Tahun Pengalaman) beserta ikonnya.
*   *Cara Menyimpan*: Klik tombol **💾 Simpan Perubahan** di bagian kanan atas setelah mengedit.

---

### 🏘️ B. Menu: Produk Rumah
Menu ini digunakan untuk mengelola katalog perumahan yang Anda pasarkan (Subsidi atau Komersil).
*   **Menambah Produk Baru**:
    1. Klik tombol **+ Tambah Produk**.
    2. Isi data produk:
       *   **Tipe Rumah**: Contoh: `Subsidi Type 30/60` atau `Komersil Type 36/72`.
       *   **Nama Rumah**: Nama unit/cluster produk.
       *   **Tabel Cicilan (Simulasi KPR)**: Masukkan rincian masa tenor dan biaya cicilan bulanan (contoh: `20 Tahun` -> `Rp 1.250.000 /bln`).
       *   **Harga KPR**: Contoh: `Rp 185.000.000`.
       *   **Deskripsi Lengkap**: Detail spesifikasi rumah (Double Dinding, jumlah kamar tidur, kamar mandi, listrik, dll.).
       *   **Foto/Gambar**: Klik area upload gambar untuk memilih file gambar dari komputer Anda.
    3. Klik **Simpan**.
*   **Mengedit/Menghapus Produk**:
    *   Gunakan tombol **Edit** (ikon pensil) atau **Hapus** (ikon tempat sampah) pada tabel daftar produk.

---

### 📍 C. Menu: Kelola Cluster (Proyek Sukses)
Menu ini memuat daftar proyek cluster perumahan yang telah selesai atau sedang dipasarkan.
*   **Kolom Informasi**:
    *   *Nama Cluster*: Nama proyek (Contoh: `Pesona Kahuripan 9`).
    *   *Status*: Pilih status cluster saat ini (`Sold Out`, `Unit Terbatas`, atau `Sedang Dibangun`).
    *   *Tipe Rumah & Lokasi*: Tipe rumah yang tersedia di cluster tersebut beserta alamat lokasinya.
    *   *Fitur / Fasilitas*: Keunggulan cluster (misal: `Dekat stasiun, bebas banjir, double dinding`).
    *   *Pesan WA Kustom*: Teks pesan WhatsApp otomatis jika konsumen mengklik cluster tersebut.

---

### 📷 D. Menu: Galeri Foto
Digunakan untuk mengunggah foto-foto dokumentasi real-time perumahan di lapangan, serah terima kunci, atau event penting.
*   **Cara Upload**:
    1. Klik **+ Upload Foto**.
    2. Pilih gambar dari komputer Anda.
    3. Masukkan **Keterangan Singkat** (deskripsi foto) agar pengunjung mengerti konteks foto tersebut.
    4. Klik **Upload**.

---

### 📰 E. Menu: Berita & Artikel
Menampilkan berita, tips seputar properti, info update pembangunan, atau promo bulanan.
*   **Langkah Posting Berita**:
    1. Klik **+ Tambah Berita**.
    2. Masukkan **Judul Berita** (buat semenarik mungkin).
    3. Tulis **Isi Berita** secara lengkap.
    4. Upload **Gambar Utama** berita sebagai cover artikel.
    5. Klik **Simpan**.

---

### 💬 F. Menu: Testimoni
Digunakan untuk memasukkan ulasan positif dari pembeli rumah guna membangun kepercayaan calon konsumen baru.
*   **Rincian Data**:
    *   *Nama Pelanggan* dan *Pekerjaan/Jabatan* (misal: `Karyawan Swasta`).
    *   *Rating Bintang*: Dari 1 sampai 5.
    *   *Ulasan*: Teks komentar kepuasan mereka terhadap rumah Pesona Kahuripan.

---

### ❓ G. Menu: FAQ (Pertanyaan Umum)
Memuat daftar pertanyaan yang paling sering ditanyakan calon pembeli beserta jawabannya untuk mempermudah CS Anda.
*   *Contoh*: "Apakah rumahnya double dinding?" -> "Ya, semua tipe rumah di Pesona Kahuripan dibangun dengan spesifikasi Double Dinding kokoh."

---

### ⚙️ H. Menu: Info Perusahaan (Pengaturan Umum)
Bagian krusial yang mengontrol informasi global website Anda.
*   **WhatsApp Admin Utama**: Masukkan nomor telepon dengan format internasional tanpa tanda `+` (Contoh: `6282124964151`). Pengunjung yang mengklik tombol hubungi akan otomatis terhubung ke nomor ini.
*   **Media Sosial**: Tautan resmi akun media sosial perusahaan Anda:
    *   *Instagram*: `https://www.instagram.com/perum_pesonakahuripan.official`
    *   *Facebook*: `https://www.facebook.com/profile.php?id=61575422217807`
    *   *YouTube*: `https://www.youtube.com/@rumahsubsidi.pesonakahuripan`
    *   *TikTok*: `https://www.tiktok.com/@property.pesonakahuripan`
*   **Peta Google Maps**:
    *   *Maps Embed URL*: Masukkan link *embed* (biasanya didapatkan dari Google Maps -> Bagikan -> Sematkan Peta -> Salin kode `src="https://www.google.com/maps/embed?...""`).

---

## 4. 🖼️ Panduan Pengunggahan Gambar (Tips & Ketentuan)

Agar website Anda tetap berjalan cepat saat diakses pengunjung, mohon ikuti ketentuan gambar berikut:
*   **Format Gambar**: Gunakan format `.jpg`, `.jpeg`, `.png`, atau format modern `.webp`.
*   **Ukuran File Maksimal**: Sistem membatasi ukuran file gambar maksimal **5 Megabytes (5MB)**. Jika file terlalu besar, silakan kompres terlebih dahulu menggunakan website gratis seperti [TinyPNG](https://tinypng.com).
*   **Cloud Storage**: Gambar yang Anda upload di CMS akan otomatis tersimpan di cloud storage **Supabase Storage**. Ini memastikan gambar tidak akan hilang meskipun website diperbarui atau dideploy ulang.

---

## 5. 🔍 Panduan SEO Dasar (Agar Website Muncul di Google)

Website Anda telah dilengkapi dengan sistem SEO otomatis (Schema Markup & Meta Tags). Namun, agar website Anda lebih cepat naik ke halaman pertama Google untuk kata kunci seperti **"perumahan murah di bogor"** atau **"pesona kahuripan"**, ikuti tips penulisan konten berikut:

1.  **Gunakan Kata Kunci di Judul Berita**: saat menulis artikel baru, sisipkan kata kunci yang relevan. Contoh: *"Pembangunan Cluster Baru Pesona Kahuripan 9, Solusi Rumah Murah Double Dinding di Bogor"*.
2.  **Deskripsi Produk yang Lengkap**: Jangan biarkan deskripsi produk kosong. Tulis spesifikasi lengkap (pondasi, dinding, baja ringan, akses jalan, transportasi terdekat). Google sangat menyukai konten yang detail dan informatif.
3.  **Gunakan Gambar Asli**: Google dapat mendeteksi gambar hasil download internet vs gambar jepretan kamera asli. Selalu gunakan foto real-time proyek Anda untuk menaikkan peringkat pencarian.

---

## 6. 🛠️ Pemecahan Masalah (Troubleshooting)

### A. Tiba-tiba Keluar (Unauthorized) saat Simpan Data
*   **Penyebab**: Koneksi internet Anda sempat terputus atau sesi keamanan login Anda telah habis (berlaku 24 jam).
*   **Solusi**: Segera muat ulang halaman (refresh browser), lakukan login kembali, dan ulangi proses penyimpanan. *Catatan: Kami telah meningkatkan sistem session ke berbasis **Stateless Cookies** sehingga kendala logout tiba-tiba saat server restart/deployment di Vercel kini sudah teratasi sepenuhnya.*

### B. Gambar yang Diupload Tidak Muncul
*   **Penyebab**: Koneksi internet lambat saat proses upload berlangsung, atau ukuran file melebihi limit 5MB.
*   **Solusi**: Pastikan ukuran gambar di bawah 5MB, refresh halaman, dan coba upload ulang gambar tersebut.

### C. Keamanan Data
*   Seluruh perubahan data yang Anda lakukan melalui CMS ini akan langsung tersimpan di **Supabase Cloud Database**. Anda tidak perlu melakukan backup database manual karena data tersimpan di server cloud terenkripsi.
