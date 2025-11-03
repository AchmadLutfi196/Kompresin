# Penjelasan Implementasi Huffman Code

## Cara Kerja Algoritma

### 1. Analisis Frekuensi (`buildFrequencyTable`)
```php
// Menghitung berapa kali setiap nilai piksel muncul
$frequencies = [];
for ($i = 0; $i < strlen($data); $i++) {
    $byte = ord($data[$i]);
    $frequencies[$byte]++;
}
// Contoh output: [128 => 150, 255 => 200, 64 => 100, ...]
```

### 2. Pembuatan Pohon Huffman (`buildHuffmanTree`)
```php
// Langkah-langkah:
// 1. Buat node daun untuk setiap simbol
// 2. Urutkan berdasarkan frekuensi (ascending)
// 3. Ambil 2 node dengan frekuensi terendah
// 4. Gabungkan menjadi node parent baru
// 5. Ulangi sampai hanya tersisa 1 node (root)

// Contoh visualisasi:
//       [450]
//      /     \
//   [200]   [250]
//   /  \    /   \
// [64] [128] [255] ...
```

### 3. Generate Kode Huffman (`generateHuffmanCodes`)
```php
// Traversal pohon dari root ke leaf
// - Ke kiri: tambahkan '0'
// - Ke kanan: tambahkan '1'

// Contoh hasil:
// Simbol 64  => '00'
// Simbol 128 => '01'
// Simbol 255 => '10'
```

### 4. Encoding Data (`encodeData`)
```php
// Ganti setiap simbol dengan kode Huffman-nya
// Original: [64, 128, 64, 255]
// Encoded:  '00' + '01' + '00' + '10' = '00010010'
```

### 5. Decoding Data (`decodeData`)
```php
// Baca bit demi bit, traversal pohon:
// - Bit '0': ke kiri
// - Bit '1': ke kanan
// - Jika sampai leaf: catat simbolnya, kembali ke root

// Encoded: '00010010'
// Step 1: '0' -> kiri, '0' -> kiri -> LEAF (64)
// Step 2: '0' -> kiri, '1' -> kanan -> LEAF (128)
// Step 3: '0' -> kiri, '0' -> kiri -> LEAF (64)
// Step 4: '1' -> kanan, '0' -> kiri -> LEAF (255)
// Result: [64, 128, 64, 255]
```

## Contoh Kasus Nyata

### Input: Gambar 10x10 pixels (100 pixels)
```
Nilai piksel: [120, 120, 150, 150, 150, 200, 200, 200, 200, 255, ...]
```

### Step 1: Frekuensi
```php
[
    120 => 25 kali,
    150 => 30 kali,
    200 => 40 kali,
    255 => 5 kali
]
```

### Step 2: Kode Huffman
```php
// Simbol dengan frekuensi tinggi dapat kode pendek
[
    200 => '0'    (40 kali, kode 1 bit)
    150 => '10'   (30 kali, kode 2 bit)
    120 => '110'  (25 kali, kode 3 bit)
    255 => '111'  (5 kali, kode 3 bit)
]
```

### Step 3: Perhitungan Efisiensi

**Ukuran Asli:**
```
100 pixels × 8 bits = 800 bits
```

**Ukuran Terkompresi:**
```
(200×1) + (150×2) + (120×3) + (255×3)
= 40 + 60 + 75 + 15
= 190 bits
```

**Compression Ratio:**
```
(1 - 190/800) × 100% = 76.25%
```

**Bits Per Pixel:**
```
190 bits / 100 pixels = 1.9 bpp
```

**Entropy:**
```
H = -Σ(p × log₂(p))
  = -(0.4×log₂(0.4) + 0.3×log₂(0.3) + 0.25×log₂(0.25) + 0.05×log₂(0.05))
  ≈ 1.7 bits/symbol
```

## Format File .bin

File .bin yang disimpan menggunakan PHP serialize:

```php
[
    'metadata' => [
        'huffman_tree' => [...],      // Pohon untuk decoding
        'huffman_codes' => [...],     // Tabel kode
        'width' => 10,                // Dimensi
        'height' => 10,
        'type' => 'png'
    ],
    'encoded_data' => '00010010...'   // Data terkompresi (string bit)
]
```

## Optimasi yang Diterapkan

### 1. Konversi ke Grayscale
```php
// Mengurangi kompleksitas dari RGB (3 channel) ke 1 channel
$gray = (int)(($r + $g + $b) / 3);
```

### 2. Penggunaan Array untuk Kode
```php
// Akses O(1) untuk encoding
$huffmanCodes = [
    64 => '00',
    128 => '01',
    // ...
];
```

### 3. Single Pass Encoding
```php
// Encode semua data dalam satu loop
for ($i = 0; $i < strlen($data); $i++) {
    $encoded .= $huffmanCodes[ord($data[$i])];
}
```

## Limitasi dan Pengembangan

### Limitasi Saat Ini:
1. **Grayscale Only**: Konversi RGB ke grayscale untuk simplifikasi
2. **Memory Intensive**: Semua data di-load ke memory
3. **No Progressive**: Tidak ada streaming/progressive decoding

### Pengembangan Potensial:
1. **RGB Support**: Handle 3 channel terpisah
2. **Chunking**: Process data dalam chunks untuk file besar
3. **Adaptive Huffman**: Update tree secara dinamis
4. **Dictionary**: Pre-built dictionary untuk pattern umum

## Perbandingan dengan Metode Lain

### Huffman vs RLE (Run-Length Encoding)
```
Data: [100, 100, 100, 150, 150, 200]

RLE:  [3×100, 2×150, 1×200]
      Bagus untuk data dengan banyak repetisi

Huffman: Kode variabel berdasarkan frekuensi
         Bagus untuk distribusi tidak merata
```

### Huffman vs LZW (Lempel-Ziv-Welch)
```
LZW: Build dictionary dari pattern yang muncul
     Lebih baik untuk text dengan pattern

Huffman: Berdasarkan statistik simbol
         Lebih sederhana dan cepat
```

### Huffman vs JPEG
```
JPEG: DCT + Quantization + Huffman
      Lossy compression untuk gambar natural
      Ratio lebih tinggi tapi ada loss

Huffman: Lossless compression
         Tidak ada loss data
         Ratio lebih rendah
```

## Tips Penggunaan

### Kapan Huffman Efektif:
✅ Gambar dengan distribusi warna tidak merata
✅ Gambar dengan area solid besar
✅ Gambar dengan palette terbatas
✅ Ketika lossless diperlukan

### Kapan Huffman Kurang Efektif:
❌ Gambar natural dengan banyak gradasi
❌ Noise atau texture kompleks
❌ Distribusi warna sangat merata
❌ File sudah terkompresi (PNG, JPEG)

## Referensi

1. Huffman, D. A. (1952). "A Method for the Construction of Minimum-Redundancy Codes"
2. Salomon, D. (2007). "Data Compression: The Complete Reference"
3. Sayood, K. (2017). "Introduction to Data Compression"

## Latihan

Coba experiment dengan:
1. Gambar hitam-putih sederhana (logo, text)
2. Gambar dengan gradient smooth
3. Foto natural
4. Screenshot dengan banyak area solid

Bandingkan compression ratio dan lihat pola mana yang paling efektif!

---

**Happy Compressing! 🎯**
