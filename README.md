# Kompresin - Aplikasi Kompresi Gambar

Website kompresi citra berbasis web menggunakan Laravel dan React dengan metode **JPEG Quality Reduction**.

## 🚀 Tentang Aplikasi

Kompresin adalah aplikasi web untuk mengompres gambar menggunakan metode JPEG Quality Reduction yang memanfaatkan transformasi DCT (Discrete Cosine Transform) untuk mengurangi ukuran file gambar secara efisien.

### ✨ Keunggulan
- ✅ **Kompresi Efektif**: Rata-rata rasio kompresi 78% untuk foto
- ✅ **Kualitas Terjaga**: Menggunakan quality level optimal
- ✅ **Cepat**: Rata-rata waktu kompresi 18ms per file
- ✅ **Multi Format**: Support JPG, PNG, BMP, GIF

---

## 📋 Fitur Utama

### 1. Kompresi Gambar
- Upload gambar (JPG, PNG, BMP, GIF)
- Maksimal ukuran file 10MB
- Preview gambar sebelum kompresi
- Pilihan format output: JPG atau BIN
- Tampilan statistik kompresi (rasio, ukuran, BPP)

### 2. Dekompresi Gambar
- Upload file hasil kompresi (.bin)
- Ekstrak dan tampilkan gambar
- Download hasil dekompresi

### 3. Riwayat Proses
- Simpan riwayat kompresi dan dekompresi
- Data: nama file, ukuran awal/akhir, rasio kompresi
- Fitur hapus riwayat
- Pagination

### 4. Antarmuka Modern
- Desain responsif dengan Tailwind CSS
- Dark mode support
- Animasi smooth dengan Framer Motion
- Loading states dan notifikasi

---

## 🛠️ Teknologi

| Kategori | Teknologi |
|----------|-----------|
| Backend | Laravel 11, PHP 8.2+ |
| Frontend | React 18, TypeScript |
| Styling | Tailwind CSS |
| State Management | Inertia.js |
| Animasi | Framer Motion |
| Database | SQLite/MySQL |
| Image Processing | GD Library |

---

## 📦 Instalasi

### Prasyarat
- PHP 8.2+
- Composer
- Node.js & NPM
- SQLite/MySQL

### Langkah Instalasi

```bash
# 1. Clone repository
git clone https://github.com/AchmadLutfi196/Kompresin.git
cd Kompresin

# 2. Install dependencies
composer install
npm install

# 3. Setup environment
cp .env.example .env
php artisan key:generate

# 4. Konfigurasi database di .env
# DB_CONNECTION=sqlite

# 5. Migrasi database
php artisan migrate

# 6. Buat symbolic link storage
php artisan storage:link

# 7. Build assets
npm run build

# 8. Jalankan server
php artisan serve
```

Aplikasi berjalan di `http://localhost:8000`

---

## 📖 Cara Penggunaan

### Kompresi Gambar
1. Buka halaman **Kompresi**
2. Upload gambar (drag & drop atau klik)
3. Pilih format output (JPG/BIN)
4. Klik **Kompres Gambar**
5. Lihat statistik dan download hasil

### Dekompresi Gambar
1. Buka halaman **Dekompresi**
2. Upload file .bin hasil kompresi
3. Klik **Dekompresi**
4. Preview dan download gambar

---

## 🔬 Metode Kompresi

### JPEG Quality Reduction

Aplikasi menggunakan kompresi JPEG dengan tahapan:

1. **Color Space Conversion**: RGB → YCbCr
2. **Downsampling**: Pengurangan resolusi chrominance
3. **Block Splitting**: Pembagian gambar menjadi blok 8×8 pixel
4. **DCT Transform**: Transformasi ke domain frekuensi
5. **Quantization**: Pembulatan koefisien DCT
6. **Entropy Coding**: Encoding dengan Huffman coding

### Metrik Evaluasi

- **Compression Ratio**: `(1 - compressed/original) × 100%`
- **Bits Per Pixel (BPP)**: `(compressed_size × 8) / (width × height)`

---

## 📊 Hasil Pengujian

Pengujian dengan 34 gambar dalam 4 kategori:

| Kategori | Rasio Kompresi |
|----------|----------------|
| Logo (PNG) | 71.76% |
| Foto Manusia | 80.68% |
| Pemandangan Alam | 84.80% |
| Warna Solid | 2.53% |
| **Rata-rata** | **78.17%** |

---

## 📁 Struktur Project

```
Kompresin/
├── app/
│   ├── Http/Controllers/
│   │   └── CompressionController.php
│   ├── Models/
│   │   └── CompressionHistory.php
│   └── Services/
│       ├── ImageCompressionService.php
│       └── FileEncryptionService.php
├── resources/js/
│   ├── components/
│   └── pages/
│       ├── Compression/
│       ├── Decompression/
│       └── History/
├── routes/
│   └── web.php
└── storage/app/public/
```

---

## 🔐 Keamanan

- CSRF Protection
- File validation (type & size)
- SQL Injection prevention (Eloquent ORM)
- XSS protection

---

## 📝 Lisensi

MIT License

---

## 👨‍💻 Tim Pengembang

- Danendra Mahardhika (230411100086)
- Moh Naufal Thoriq (230411100142)
- Achmad Lutfi Madhani (230411100059)
- Elvita Dian Prameswari (230411100128)

**Program Studi Teknik Informatika**  
**Fakultas Teknik - Universitas Trunojoyo Madura**

---

Dibuat dengan ❤️ menggunakan Laravel, React, dan Tailwind CSS
