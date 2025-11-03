import { Link, Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppHeader from '@/components/AppHeader';

export default function Home() {
    return (
        <>
            <Head title="Kompresi Citra - Huffman Coding" />
            
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
                <AppHeader currentPage="home" />

                {/* Hero Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            Kompresi Citra dengan Huffman Code
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            Aplikasi web untuk mengompresi dan mendekompresi gambar menggunakan 
                            algoritma Huffman Coding dengan visualisasi lengkap dan analisis efisiensi.
                        </p>
                    </motion.div>

                    {/* Important Notice */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-12"
                    >
                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h4 className="font-bold text-amber-900 dark:text-amber-200 mb-2">
                                    📚 Catatan: Tujuan Pembelajaran
                                </h4>
                                <p className="text-sm text-amber-800 dark:text-amber-300">
                                    Aplikasi ini dibuat untuk <strong>pembelajaran algoritma Huffman Coding</strong>, bukan untuk kompresi praktis. 
                                    File JPG/PNG foto akan menjadi <strong>lebih besar</strong> karena sudah terkompresi optimal. 
                                    Gunakan <strong>BMP atau gambar sederhana</strong> untuk melihat Huffman bekerja dengan baik.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-teal-100 dark:border-teal-900"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Kompresi Gambar
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Upload gambar (JPG, PNG, BMP) dan kompres menggunakan algoritma Huffman Code. 
                                Dapatkan visualisasi pohon Huffman dan statistik kompresi lengkap.
                            </p>
                            <Link
                                href="/compress"
                                className="inline-flex items-center text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-semibold"
                            >
                                Mulai Kompresi
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-cyan-100 dark:border-cyan-900"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Dekompresi Gambar
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Upload file hasil kompresi (.txt, .json, .zip, .bin) dan kembalikan ke gambar asli. 
                                Bandingkan kualitas hasil dekompresi dengan citra awal.
                            </p>
                            <Link
                                href="/decompress"
                                className="inline-flex items-center text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold"
                            >
                                Mulai Dekompresi
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Concepts Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8 border border-gray-100 dark:border-gray-700"
                    >
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Konsep Dasar
                        </h3>
                        
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Kompresi Data
                                </h4>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Kompresi adalah proses mengurangi ukuran file dengan menghilangkan redundansi data. 
                                    Tujuannya adalah menghemat ruang penyimpanan dan mempercepat transmisi data tanpa 
                                    kehilangan informasi penting.
                                </p>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Huffman Coding
                                </h4>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Algoritma Huffman adalah metode kompresi lossless yang menggunakan kode dengan 
                                    panjang variabel. Simbol yang sering muncul diberi kode pendek, sedangkan simbol 
                                    yang jarang diberi kode lebih panjang. Algoritma ini membangun pohon biner optimal 
                                    berdasarkan frekuensi kemunculan setiap simbol.
                                </p>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Dekompresi
                                </h4>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Dekompresi adalah proses mengembalikan data yang telah dikompres ke bentuk aslinya. 
                                    Dengan menggunakan tabel atau pohon Huffman yang sama, kita dapat mendekode urutan 
                                    bit menjadi simbol-simbol asli dengan sempurna.
                                </p>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Metrik Efisiensi
                                </h4>
                                <div className="text-gray-600 dark:text-gray-300 space-y-2">
                                    <p><strong>Compression Ratio:</strong> Persentase pengurangan ukuran file</p>
                                    <p><strong>Bits Per Pixel (BPP):</strong> Rata-rata jumlah bit untuk menyimpan satu piksel</p>
                                    <p><strong>Entropy:</strong> Ukuran rata-rata informasi minimum yang diperlukan untuk menyandi setiap simbol</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Features List */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg shadow-lg p-8 text-white"
                    >
                        <h3 className="text-2xl font-bold mb-6">Fitur Aplikasi</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-start">
                                <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Upload & validasi format gambar</span>
                            </div>
                            <div className="flex items-start">
                                <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Visualisasi pohon Huffman</span>
                            </div>
                            <div className="flex items-start">
                                <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Tabel kode Huffman</span>
                            </div>
                            <div className="flex items-start">
                                <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Analisis statistik lengkap</span>
                            </div>
                            <div className="flex items-start">
                                <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Riwayat proses kompresi</span>
                            </div>
                            <div className="flex items-start">
                                <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Mode gelap & responsif</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Footer */}
                <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <p className="text-center text-gray-600 dark:text-gray-400">
                            © 2025 Kompresi Citra. Aplikasi demonstrasi algoritma Huffman Coding.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
