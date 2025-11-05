# Kompresi Citra - Huffman Coding

Website kompresi citra berbasis web menggunakan Laravel dan Tailwind CSS dengan penerapan algoritma Huffman Code.

## ⚠️ Catatan Penting: Tujuan Pembelajaran

**Aplikasi ini dibuat untuk pembelajaran algoritma Huffman Coding, bukan untuk kompresi praktis.**

### Limitasi Huffman untuk Gambar:
- ❌ **File JPG/PNG akan jadi LEBIH BESAR** (10-200% lebih besar)
- ❌ Tidak cocok untuk foto natural atau gambar kompleks
- ✅ **Cocok untuk**: BMP, gambar sederhana, logo, diagram
- 📚 **Tujuan**: Memahami cara kerja algoritma Huffman

### Mengapa File Jadi Lebih Besar?

1. **JPG sudah optimal**: Menggunakan DCT + Quantization + Huffman (10-20x lebih efisien)
2. **Proses kita**: JPG → Decode → Grayscale (RAW) → Huffman → .bin
3. **Overhead**: Metadata + Huffman table + kehilangan kompresi original
4. **Entropy tinggi**: Gambar natural memiliki entropy 7-8 bits/pixel (mendekati random)

**Gunakan aplikasi ini untuk memahami algoritma, bukan untuk mengecilkan file praktis!**

---

## 🚀 Fitur Utama

### 1. Upload Gambar
- Format yang didukung: JPG, PNG, BMP
- Validasi ukuran file (maksimal 10MB)
- Preview gambar sebelum proses kompresi

### 2. Kompresi Gambar
- Implementasi algoritma Huffman Code untuk mengompresi data piksel
- Tampilan perbandingan ukuran sebelum dan sesudah kompresi
- Tampilan tingkat rasio kompresi dalam persentase
- Menyimpan hasil kompres dalam format biner (.bin)
- Visualisasi pohon Huffman berdasarkan frekuensi simbol
- Tabel kode Huffman (simbol, frekuensi, kode biner)

### 3. Dekompresi Gambar
- Upload file hasil kompresi (.bin)
- Gunakan tabel Huffman untuk mengembalikan ke gambar asli
- Tampilan hasil dekompresi
- Perbandingan kualitas dengan citra awal

### 4. Visualisasi Proses Huffman
- Pohon Huffman visual dengan canvas HTML5
- Tabel lengkap simbol, frekuensi, dan kode biner
- Penjelasan cara membaca visualisasi

### 5. Riwayat Proses
- Simpan riwayat kompresi dan dekompresi di database
- Data yang tersimpan: id, nama file, ukuran awal, ukuran akhir, rasio kompresi
- Fitur hapus riwayat per baris
- Pagination untuk riwayat banyak

### 6. Analisis Efisiensi
- Compression Ratio (%)
- Bits Per Pixel (BPP)
- Entropy
- Perbandingan dengan metode standar

### 7. Antarmuka Pengguna (UI)
- Halaman utama: penjelasan konsep kompresi-dekompresi
- Halaman kompresi: form upload, visualisasi, statistik
- Halaman dekompresi: upload .bin, hasil rekonstruksi
- Halaman riwayat: tabel riwayat dengan fitur hapus
- Desain responsif dengan Tailwind CSS
- Mendukung mode gelap (dark mode)
- Animasi smooth dengan Framer Motion

## 📋 Teknologi yang Digunakan

- **Backend**: Laravel 11
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Inertia.js
- **Animasi**: Framer Motion
- **Database**: MySQL/SQLite

## 🛠️ Instalasi

### Prasyarat
- PHP 8.2 atau lebih tinggi
- Composer
- Node.js & NPM
- MySQL/SQLite

### Langkah Instalasi

1. Clone repository
```bash
git clone <repository-url>
cd Kompresin
```

2. Install dependencies PHP
```bash
composer install
```

3. Install dependencies JavaScript
```bash
npm install
```

4. Salin file environment
```bash
cp .env.example .env
```

5. Generate application key
```bash
php artisan key:generate
```

6. Konfigurasi database di file `.env`
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kompresin
DB_USERNAME=root
DB_PASSWORD=
```

7. Jalankan migrasi database
```bash
php artisan migrate
```

8. Buat symbolic link untuk storage
```bash
php artisan storage:link
```

9. Compile assets
```bash
npm run build
```

atau untuk development:
```bash
npm run dev
```

10. Jalankan server
```bash
php artisan serve
```

Aplikasi akan berjalan di `http://localhost:8000`

## 📖 Cara Menggunakan

### Kompresi Gambar

1. Buka halaman "Kompresi Gambar"
2. Klik area upload atau drag & drop gambar
3. Preview gambar akan muncul
4. Klik tombol "Kompres Gambar"
5. Tunggu proses kompresi selesai
6. Lihat hasil statistik, visualisasi pohon Huffman, dan tabel kode
7. Download file .bin hasil kompresi

### Dekompresi Gambar

1. Buka halaman "Dekompresi Gambar"
2. Upload file .bin hasil kompresi
3. Klik tombol "Dekompresi Gambar"
4. Tunggu proses dekompresi selesai
5. Lihat hasil gambar yang telah dikembalikan
6. Download gambar hasil dekompresi

### Melihat Riwayat

1. Buka halaman "Riwayat"
2. Lihat daftar semua proses kompresi dan dekompresi
3. Klik tombol hapus untuk menghapus riwayat tertentu

## 🔬 Algoritma Huffman Code

### Konsep Dasar

Algoritma Huffman adalah metode kompresi lossless yang menggunakan kode dengan panjang variabel. Prinsip kerjanya:

1. **Analisis Frekuensi**: Menghitung frekuensi kemunculan setiap simbol (nilai piksel)
2. **Pembuatan Pohon**: Membangun pohon biner berdasarkan frekuensi
3. **Pengkodean**: Simbol dengan frekuensi tinggi mendapat kode pendek
4. **Kompresi**: Data asli diubah menjadi kode Huffman
5. **Dekompresi**: Menggunakan pohon Huffman untuk decode

### Metrik Efisiensi

- **Compression Ratio**: Persentase pengurangan ukuran file
  ```
  Ratio = (1 - (compressed_size / original_size)) × 100%
  ```

- **Bits Per Pixel (BPP)**: Rata-rata jumlah bit untuk menyimpan satu piksel
  ```
  BPP = total_bits / total_pixels
  ```

- **Entropy**: Ukuran rata-rata informasi minimum
  ```
  H = -Σ(p(x) × log₂(p(x)))
  ```

## 📁 Struktur Project

```
Kompresin/
├── app/
│   ├── Http/Controllers/
│   │   └── CompressionController.php
│   ├── Models/
│   │   └── CompressionHistory.php
│   └── Services/
│       ├── HuffmanNode.php
│       └── HuffmanCompressionService.php
├── database/
│   └── migrations/
│       └── xxxx_create_compression_histories_table.php
├── resources/
│   └── js/
│       ├── components/Compression/
│       │   ├── StatsCard.tsx
│       │   ├── HuffmanTreeVisualization.tsx
│       │   ├── HuffmanCodeTable.tsx
│       │   └── ImagePreview.tsx
│       └── pages/
│           ├── Home.tsx
│           ├── Compression/Index.tsx
│           ├── Decompression/Index.tsx
│           └── History/Index.tsx
└── routes/
    └── web.php
```

## 🎨 Fitur UI/UX

- **Responsive Design**: Bekerja di desktop, tablet, dan mobile
- **Dark Mode**: Toggle antara mode terang dan gelap
- **Smooth Animations**: Transisi halus dengan Framer Motion
- **Loading States**: Indikator loading saat proses berlangsung
- **Error Handling**: Pesan error yang jelas dan informatif
- **Toast Notifications**: Notifikasi sukses/error yang tidak mengganggu

## 🔐 Keamanan

- CSRF Protection
- File validation (type & size)
- SQL Injection prevention dengan Eloquent ORM
- XSS protection dengan sanitasi input

## 📊 Database Schema

### compression_histories

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| type | string | 'compress' atau 'decompress' |
| filename | string | Nama file asli |
| original_path | string | Path file asli |
| compressed_path | string | Path file kompres |
| decompressed_path | string | Path file dekompresi |
| original_size | bigint | Ukuran asli (bytes) |
| compressed_size | bigint | Ukuran kompres (bytes) |
| compression_ratio | decimal(5,2) | Rasio kompresi (%) |
| bits_per_pixel | decimal(10,4) | BPP |
| entropy | decimal(10,4) | Entropy |
| huffman_table | json | Tabel kode Huffman |
| image_width | integer | Lebar gambar |
| image_height | integer | Tinggi gambar |
| created_at | timestamp | Waktu dibuat |
| updated_at | timestamp | Waktu diupdate |

## 🚧 Pengembangan Selanjutnya

Fitur yang bisa ditambahkan:

- [ ] Dukungan kompresi warna RGB (saat ini grayscale)
- [ ] Export laporan PDF
- [ ] Perbandingan multiple algoritma kompresi
- [ ] Batch compression
- [ ] API endpoint untuk integrasi
- [ ] User authentication untuk riwayat personal
- [ ] Grafik statistik kompresi

## 📝 Lisensi

MIT License

## 👨‍💻 Kontributor

Dibuat dengan ❤️ menggunakan Laravel, React, dan Tailwind CSS

## 🐛 Bug Report

Jika menemukan bug atau ingin request fitur, silakan buat issue baru.

## 📞 Kontak

Untuk pertanyaan atau diskusi, silakan hubungi melalui issue tracker.

---

**Note**: Aplikasi ini dibuat untuk tujuan edukasi dalam memahami algoritma kompresi Huffman Code.
#   K o m p r e s i n 
 

 
