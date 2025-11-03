# Quick Start Guide - Kompresi Citra

## Langkah Cepat Menjalankan Aplikasi

### 1. Persiapan Database
Pastikan database sudah dibuat dan dikonfigurasi di `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kompresin
DB_USERNAME=root
DB_PASSWORD=
```

### 2. Jalankan Migration
```bash
php artisan migrate
```

### 3. Buat Storage Link
```bash
php artisan storage:link
```

### 4. Jalankan Server Development
Buka 2 terminal:

**Terminal 1** - Laravel Server:
```bash
php artisan serve
```

**Terminal 2** - Vite Dev Server (opsional, untuk hot reload):
```bash
npm run dev
```

Atau jika sudah build:
```bash
npm run build
```

### 5. Akses Aplikasi
Buka browser dan akses:
```
http://localhost:8000
```

## Halaman yang Tersedia

1. **Homepage** (`/`) - Penjelasan konsep dan fitur
2. **Kompresi** (`/compress`) - Upload dan kompres gambar
3. **Dekompresi** (`/decompress`) - Dekompresi file .bin
4. **Riwayat** (`/history`) - Lihat riwayat proses

## Testing Aplikasi

### Test Kompresi
1. Buka `/compress`
2. Upload gambar JPG/PNG/BMP (max 10MB)
3. Klik "Kompres Gambar"
4. Lihat hasil visualisasi dan statistik
5. Download file .bin

### Test Dekompresi
1. Buka `/decompress`
2. Upload file .bin dari hasil kompresi
3. Klik "Dekompresi Gambar"
4. Lihat hasil gambar yang telah dikembalikan

### Test Riwayat
1. Buka `/history`
2. Lihat daftar riwayat
3. Test hapus riwayat

## Tips Penggunaan

- Gunakan gambar dengan ukuran kecil-menengah untuk testing awal (< 1MB)
- File .bin harus dari aplikasi ini karena mengandung metadata Huffman
- Hasil kompresi grayscale (konversi RGB ke grayscale untuk sederhana)
- Compression ratio tergantung kompleksitas gambar

## Troubleshooting

### Error: "Call to undefined function imagecreatefrombmp()"
Install ekstensi GD untuk PHP dengan BMP support:
```bash
# Ubuntu/Debian
sudo apt-get install php-gd

# Windows (Laragon)
# Aktifkan extension=gd di php.ini
```

### Error: Storage link not found
```bash
php artisan storage:link
```

### Error: Assets not found
```bash
npm run build
```

### Error: Database connection failed
- Pastikan MySQL/MariaDB berjalan
- Cek konfigurasi di `.env`
- Jalankan `php artisan migrate`

## Struktur File Storage

```
storage/
├── app/
│   ├── public/
│   │   ├── originals/     # Gambar asli yang diupload
│   │   ├── compressed/    # File .bin hasil kompresi
│   │   └── decompressed/  # Gambar hasil dekompresi
```

## Command Berguna

```bash
# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Rebuild assets
npm run build

# Watch mode untuk development
npm run dev

# Check routes
php artisan route:list

# Fresh migration (reset database)
php artisan migrate:fresh
```

## Development Mode vs Production

### Development
```bash
npm run dev
APP_DEBUG=true
APP_ENV=local
```

### Production
```bash
npm run build
APP_DEBUG=false
APP_ENV=production
php artisan optimize
```

## Kontribusi

Untuk berkontribusi:
1. Fork repository
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

---

**Selamat mencoba! 🚀**
