import { Link, Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppHeader from '@/components/AppHeader';
import ScrambleText from '@/components/ui/ScrambleText';

export default function Home() {
    // ReactBits-style animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.1,
                staggerChildren: 0.15,
                duration: 0.6
            }
        }
    };

    const cardVariants = {
        hidden: { 
            opacity: 0, 
            y: 30,
            scale: 0.95
        },
        visible: { 
            opacity: 1, 
            y: 0,
            scale: 1
        }
    };

    const floatingAnimation = {
        y: [0, -10, 0],
        transition: {
            duration: 3,
            repeat: Infinity
        }
    };

    return (
        <>
            <Head title="Kompresi Citra - Huffman Coding" />
            
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
                <AppHeader currentPage="home" />

                {/* Hero Section */}
                <motion.div 
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <motion.div
                        variants={cardVariants}
                        className="text-center mb-16"
                    >
                        <motion.h2 
                            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
                            animate={{ 
                                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            style={{
                                background: "linear-gradient(90deg, #1f2937, #0891b2, #059669, #0891b2, #1f2937)",
                                backgroundSize: "200% 200%",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text"
                            }}
                        >
                            <ScrambleText delay={500} speed={40}>
                                Kompresi Citra dengan Huffman Code
                            </ScrambleText>
                        </motion.h2>
                        <motion.p 
                            className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            Aplikasi web untuk mengompresi dan mendekompresi gambar menggunakan 
                            algoritma Huffman Coding dengan visualisasi lengkap dan analisis efisiensi.
                        </motion.p>
                    </motion.div>

                    {/* Important Notice */}
                    {/* <motion.div
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
                    </motion.div> */}

                    {/* Features Grid */}
                    <motion.div 
                        className="grid md:grid-cols-2 gap-8 mb-16"
                        variants={containerVariants}
                    >
                        <motion.div
                            variants={cardVariants}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-teal-100 dark:border-teal-900 cursor-pointer"
                            whileHover={{ 
                                scale: 1.03,
                                y: -8,
                                boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                                borderColor: "rgb(20 184 166)",
                                transition: { duration: 0.3 }
                            }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <motion.div 
                                className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4"
                                animate={floatingAnimation}
                                whileHover={{ 
                                    rotate: 360,
                                    scale: 1.1,
                                    transition: { duration: 0.5 }
                                }}
                            >
                                <motion.svg 
                                    className="w-6 h-6 text-white" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                    whileHover={{ scale: 1.2 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </motion.svg>
                            </motion.div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Kompresi Gambar
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Upload gambar (JPG, PNG, BMP) dan kompres menggunakan algoritma Huffman Code. 
                                Dapatkan visualisasi pohon Huffman dan statistik kompresi lengkap.
                            </p>
                            <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    href="/compress"
                                    className="inline-flex items-center text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-semibold group"
                                >
                                    Mulai Kompresi
                                    <motion.svg 
                                        className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                        whileHover={{ x: 3, scale: 1.1 }}
                                        transition={{ type: "spring", stiffness: 400 }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </motion.svg>
                                </Link>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            variants={cardVariants}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-cyan-100 dark:border-cyan-900 cursor-pointer"
                            whileHover={{ 
                                scale: 1.03,
                                y: -8,
                                boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                                borderColor: "rgb(6 182 212)",
                                transition: { duration: 0.3 }
                            }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <motion.div 
                                className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center mb-4"
                                animate={floatingAnimation}
                                whileHover={{ 
                                    rotate: -360,
                                    scale: 1.1,
                                    transition: { duration: 0.5 }
                                }}
                            >
                                <motion.svg 
                                    className="w-6 h-6 text-white" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                    whileHover={{ scale: 1.2 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                </motion.svg>
                            </motion.div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Dekompresi Gambar
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Upload file hasil kompresi (.txt, .json, .zip, .bin) dan kembalikan ke gambar asli. 
                                Bandingkan kualitas hasil dekompresi dengan citra awal.
                            </p>
                            <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    href="/decompress"
                                    className="inline-flex items-center text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold group"
                                >
                                    Mulai Dekompresi
                                    <motion.svg 
                                        className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                        whileHover={{ x: 3, scale: 1.1 }}
                                        transition={{ type: "spring", stiffness: 400 }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </motion.svg>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Concepts Section */}
                    <motion.div
                        variants={cardVariants}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8 border border-gray-100 dark:border-gray-700"
                        whileHover={{ 
                            scale: 1.01,
                            boxShadow: "0 15px 35px rgba(0,0,0,0.08)",
                            transition: { duration: 0.3 }
                        }}
                    >
                        <motion.h3 
                            className="text-2xl font-bold text-gray-900 dark:text-white mb-6"
                            whileHover={{ 
                                scale: 1.02,
                                color: "#0891b2",
                                transition: { duration: 0.2 }
                            }}
                        >
                            Konsep Dasar
                        </motion.h3>
                        
                        <motion.div 
                            className="space-y-6"
                            variants={containerVariants}
                        >
                            <motion.div
                                variants={cardVariants}
                                whileHover={{ 
                                    x: 10,
                                    transition: { duration: 0.2 }
                                }}
                            >
                                <motion.h4 
                                    className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
                                    whileHover={{ color: "#0d9488" }}
                                >
                                    Kompresi Data
                                </motion.h4>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Kompresi adalah proses mengurangi ukuran file dengan menghilangkan redundansi data. 
                                    Tujuannya adalah menghemat ruang penyimpanan dan mempercepat transmisi data tanpa 
                                    kehilangan informasi penting.
                                </p>
                            </motion.div>

                            <motion.div
                                variants={cardVariants}
                                whileHover={{ 
                                    x: 10,
                                    transition: { duration: 0.2 }
                                }}
                            >
                                <motion.h4 
                                    className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
                                    whileHover={{ color: "#0891b2" }}
                                >
                                    Huffman Coding
                                </motion.h4>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Algoritma Huffman adalah metode kompresi lossless yang menggunakan kode dengan 
                                    panjang variabel. Simbol yang sering muncul diberi kode pendek, sedangkan simbol 
                                    yang jarang diberi kode lebih panjang. Algoritma ini membangun pohon biner optimal 
                                    berdasarkan frekuensi kemunculan setiap simbol.
                                </p>
                            </motion.div>

                            <motion.div
                                variants={cardVariants}
                                whileHover={{ 
                                    x: 10,
                                    transition: { duration: 0.2 }
                                }}
                            >
                                <motion.h4 
                                    className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
                                    whileHover={{ color: "#059669" }}
                                >
                                    Dekompresi
                                </motion.h4>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Dekompresi adalah proses mengembalikan data yang telah dikompres ke bentuk aslinya. 
                                    Dengan menggunakan tabel atau pohon Huffman yang sama, kita dapat mendekode urutan 
                                    bit menjadi simbol-simbol asli dengan sempurna.
                                </p>
                            </motion.div>

                            <motion.div
                                variants={cardVariants}
                                whileHover={{ 
                                    x: 10,
                                    transition: { duration: 0.2 }
                                }}
                            >
                                <motion.h4 
                                    className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
                                    whileHover={{ color: "#dc2626" }}
                                >
                                    Metrik Efisiensi
                                </motion.h4>
                                <motion.div 
                                    className="text-gray-600 dark:text-gray-300 space-y-2"
                                    variants={containerVariants}
                                >
                                    <motion.p variants={cardVariants} whileHover={{ x: 5 }}><strong>Compression Ratio:</strong> Persentase pengurangan ukuran file</motion.p>
                                    <motion.p variants={cardVariants} whileHover={{ x: 5 }}><strong>Bits Per Pixel (BPP):</strong> Rata-rata jumlah bit untuk menyimpan satu piksel</motion.p>
                                    <motion.p variants={cardVariants} whileHover={{ x: 5 }}><strong>Entropy:</strong> Ukuran rata-rata informasi minimum yang diperlukan untuk menyandi setiap simbol</motion.p>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Features List */}
                    <motion.div
                        variants={cardVariants}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg shadow-lg p-8 text-white"
                        whileHover={{ 
                            scale: 1.01,
                            backgroundImage: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)",
                            boxShadow: "0 25px 50px rgba(59, 130, 246, 0.3)",
                            transition: { duration: 0.4 }
                        }}
                        animate={{
                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                        }}
                        transition={{
                            backgroundPosition: {
                                duration: 8,
                                repeat: Infinity,
                                ease: "linear"
                            }
                        }}
                        style={{
                            backgroundSize: "200% 200%"
                        }}
                    >
                        <motion.h3 
                            className="text-2xl font-bold mb-6"
                            animate={{ 
                                textShadow: [
                                    "0 0 0px rgba(255,255,255,0)",
                                    "0 0 20px rgba(255,255,255,0.5)",
                                    "0 0 0px rgba(255,255,255,0)"
                                ]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            Fitur Aplikasi
                        </motion.h3>
                        <motion.div 
                            className="grid md:grid-cols-2 gap-4"
                            variants={containerVariants}
                        >
                            <motion.div 
                                className="flex items-start"
                                variants={cardVariants}
                                whileHover={{ 
                                    x: 10,
                                    transition: { duration: 0.2 }
                                }}
                            >
                                <motion.svg 
                                    className="w-6 h-6 mr-3 flex-shrink-0" 
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                    whileHover={{ 
                                        scale: 1.3,
                                        rotate: 360,
                                        transition: { duration: 0.5 }
                                    }}
                                >
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </motion.svg>
                                <span>Upload & validasi format gambar</span>
                            </motion.div>
                            <motion.div 
                                className="flex items-start"
                                variants={cardVariants}
                                whileHover={{ x: 10, transition: { duration: 0.2 } }}
                            >
                                <motion.svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"
                                    whileHover={{ scale: 1.3, rotate: 360, transition: { duration: 0.5 } }}>
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </motion.svg>
                                <span>Visualisasi pohon Huffman</span>
                            </motion.div>
                            <motion.div 
                                className="flex items-start"
                                variants={cardVariants}
                                whileHover={{ x: 10, transition: { duration: 0.2 } }}
                            >
                                <motion.svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"
                                    whileHover={{ scale: 1.3, rotate: 360, transition: { duration: 0.5 } }}>
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </motion.svg>
                                <span>Tabel kode Huffman</span>
                            </motion.div>
                            <motion.div 
                                className="flex items-start"
                                variants={cardVariants}
                                whileHover={{ x: 10, transition: { duration: 0.2 } }}
                            >
                                <motion.svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"
                                    whileHover={{ scale: 1.3, rotate: 360, transition: { duration: 0.5 } }}>
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </motion.svg>
                                <span>Analisis statistik lengkap</span>
                            </motion.div>
                            <motion.div 
                                className="flex items-start"
                                variants={cardVariants}
                                whileHover={{ x: 10, transition: { duration: 0.2 } }}
                            >
                                <motion.svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"
                                    whileHover={{ scale: 1.3, rotate: 360, transition: { duration: 0.5 } }}>
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </motion.svg>
                                <span>Riwayat proses kompresi</span>
                            </motion.div>
                            <motion.div 
                                className="flex items-start"
                                variants={cardVariants}
                                whileHover={{ x: 10, transition: { duration: 0.2 } }}
                            >
                                <motion.svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"
                                    whileHover={{ scale: 1.3, rotate: 360, transition: { duration: 0.5 } }}>
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </motion.svg>
                                <span>Mode gelap & responsif</span>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Footer */}
                <motion.footer 
                    className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <motion.p 
                            className="text-center text-gray-600 dark:text-gray-400"
                            whileHover={{ 
                                scale: 1.02,
                                color: "#0891b2",
                                transition: { duration: 0.2 }
                            }}
                        >
                            © 2025 Kompresi Citra. Aplikasi demonstrasi algoritma Huffman Coding.
                        </motion.p>
                    </div>
                </motion.footer>
            </div>
        </>
    );
}
