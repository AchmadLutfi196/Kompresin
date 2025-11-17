import { useState, FormEvent, ChangeEvent } from 'react';
import { Link, Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import StatsCard from '@/components/Compression/StatsCard';
import HuffmanTreeVisualization from '@/components/Compression/HuffmanTreeVisualization';
import HuffmanCodeTable from '@/components/Compression/HuffmanCodeTable';
import ImagePreview from '@/components/Compression/ImagePreview';
import AppHeader from '@/components/AppHeader';
import { SweetAlert } from '@/utils/sweetAlert';

interface CompressionResult {
    original_size: number;
    compressed_size: number;
    compression_ratio: number;
    original_file_size: number; // Actual JPG/PNG file size
    file_compression_ratio: number; // Real file comparison
    bits_per_pixel: number;
    entropy: number;
    width: number;
    height: number;
    compressed_file_url: string;
    compressed_filename: string;
    original_image_url: string;
    algorithm?: string; // Algorithm used (DEFLATE, etc)
    compression_time?: number; // Time taken for compression
    huffman_tree: any;
    huffman_codes: Array<{
        symbol: number;
        frequency: number;
        code: string;
        bits: number;
    }>;
}

export default function Index() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<CompressionResult | null>(null);
    const [error, setError] = useState<string>('');
    const [selectedFormat, setSelectedFormat] = useState<string>('txt');

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

    const iconFloat = {
        y: [0, -8, 0],
        transition: {
            duration: 2.5,
            repeat: Infinity
        }
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp'];
        if (!validTypes.includes(file.type)) {
            SweetAlert.error('Format File Tidak Valid', 'Silakan gunakan format JPG, PNG, atau BMP');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            SweetAlert.error('File Terlalu Besar', 'Ukuran file maksimal 10MB');
            return;
        }

        setError('');
        setSelectedFile(file);
        setResult(null);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleCompress = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            SweetAlert.warning('File Belum Dipilih', 'Silakan pilih file gambar terlebih dahulu');
            return;
        }

        setLoading(true);
        setError('');

        // Show loading notification
        SweetAlert.loading('Memproses Kompresi', 'Sedang mengompres gambar menggunakan algoritma Huffman...');

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('format', selectedFormat);

        try {
            const response = await fetch('/compress', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (data.success) {
                SweetAlert.close(); // Close loading
                setResult(data.data);
                
                // Show success notification
                SweetAlert.toast.success('Kompresi berhasil! File telah dikompres dengan algoritma Huffman');
            } else {
                SweetAlert.error('Kompresi Gagal', data.message || 'Terjadi kesalahan saat memproses file');
            }
        } catch (err) {
            SweetAlert.error('Kesalahan Jaringan', 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda');
        } finally {
            setLoading(false);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <>
            <Head title="Kompresi Gambar" />
            
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
                <AppHeader currentPage="compress" showBackButton />

                <motion.div 
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div
                        variants={cardVariants}
                        className="mb-8"
                    >
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Kompresi Gambar
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Upload gambar untuk dikompres menggunakan algoritma Huffman Code
                        </p>
                    </motion.div>

                    {/* Warning Box - Important Info */}
                    <motion.div
                        variants={cardVariants}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-5 mb-6 backdrop-blur-sm"
                    >
                        <div className="flex gap-3">
                            <motion.div 
                                className="flex-shrink-0"
                                animate={iconFloat}
                            >
                                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </motion.div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                                    ⚠️ Penting: Keterbatasan Huffman Coding untuk Gambar
                                </h3>
                                <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
                                    <p>
                                        <strong>File JPG/PNG akan jadi LEBIH BESAR</strong> karena sudah terkompresi dengan algoritma lebih efisien (DCT, LZW).
                                    </p>
                                    <p className="text-xs">
                                        <strong>✅ Cocok untuk:</strong> BMP, gambar sederhana, logo, diagram<br/>
                                        <strong>❌ Tidak cocok untuk:</strong> JPG foto natural, PNG kompleks
                                    </p>
                                    <p className="text-xs italic">
                                        Aplikasi ini dibuat untuk <strong>pembelajaran algoritma Huffman</strong>, bukan untuk kompresi praktis.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Upload Form */}
                    <motion.div
                        variants={cardVariants}
                        whileHover={{ scale: 1.01, y: -4 }}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg shadow-lg border border-white/20 p-6 mb-8"
                    >
                        <form onSubmit={handleCompress}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Pilih Gambar
                                </label>
                                <div className="flex items-center justify-center w-full">
                                    <motion.label 
                                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="max-h-60 object-contain"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <motion.svg
                                                    animate={iconFloat}
                                                    className="w-12 h-12 mb-4 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                    />
                                                </motion.svg>
                                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="font-semibold">Klik untuk upload</span> atau drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    JPG, PNG, atau BMP (Max. 10MB)
                                                </p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/jpeg,image/jpg,image/png,image/bmp"
                                            onChange={handleFileSelect}
                                        />
                                    </motion.label>
                                </div>
                                {selectedFile && (
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        File terpilih: {selectedFile.name} ({formatBytes(selectedFile.size)})
                                    </p>
                                )}
                            </div>

                            {/* Format Selector */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Pilih Format File Hasil Kompresi
                                </label>
                                <motion.div 
                                    className="grid grid-cols-2 md:grid-cols-4 gap-3"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <motion.button
                                        type="button"
                                        onClick={() => setSelectedFormat('txt')}
                                        className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                                            selectedFormat === 'txt'
                                                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 shadow-lg'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-teal-300'
                                        }`}
                                        variants={cardVariants}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <svg className="w-8 h-8 mb-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="font-semibold text-sm">TXT</span>
                                        <span className="text-xs text-gray-500 mt-1">Human Readable</span>
                                        {selectedFormat === 'txt' && (
                                            <div className="absolute top-2 right-2">
                                                <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </motion.button>

                                    <motion.button
                                        type="button"
                                        onClick={() => setSelectedFormat('json')}
                                        className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                                            selectedFormat === 'json'
                                                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 shadow-lg'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-cyan-300'
                                        }`}
                                        variants={cardVariants}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <svg className="w-8 h-8 mb-2 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                        <span className="font-semibold text-sm">JSON</span>
                                        <span className="text-xs text-gray-500 mt-1">Structured</span>
                                        {selectedFormat === 'json' && (
                                            <div className="absolute top-2 right-2">
                                                <svg className="w-5 h-5 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </motion.button>

                                    <motion.button
                                        type="button"
                                        onClick={() => setSelectedFormat('zip')}
                                        className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                                            selectedFormat === 'zip'
                                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                                        }`}
                                        variants={cardVariants}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <svg className="w-8 h-8 mb-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                        </svg>
                                        <span className="font-semibold text-sm">ZIP</span>
                                        <span className="text-xs text-gray-500 mt-1">Archive</span>
                                        {selectedFormat === 'zip' && (
                                            <div className="absolute top-2 right-2">
                                                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </motion.button>

                                    <motion.button
                                        type="button"
                                        onClick={() => setSelectedFormat('bin')}
                                        className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                                            selectedFormat === 'bin'
                                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-orange-300'
                                        }`}
                                        variants={cardVariants}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <svg className="w-8 h-8 mb-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                        </svg>
                                        <span className="font-semibold text-sm">BIN</span>
                                        <span className="text-xs text-gray-500 mt-1">Binary</span>
                                        {selectedFormat === 'bin' && (
                                            <div className="absolute top-2 right-2">
                                                <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </motion.button>
                                </motion.div>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    💡 TXT & JSON: Mudah dibaca | ZIP: Kompatibel universal | BIN: Ukuran minimal
                                </p>
                            </div>

                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl shadow-md"
                                >
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
                                    </div>
                                </motion.div>
                            )}

                            <motion.button
                                type="submit"
                                disabled={!selectedFile || loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl disabled:shadow-none"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="text-lg">Memproses...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                        <span className="text-lg">Kompres Gambar</span>
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>

                    {/* Results */}
                    {result && (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {/* Statistics */}
                            <motion.div
                                variants={containerVariants}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                            >
                                <motion.div 
                                    variants={cardVariants}
                                    whileHover={{ y: -5, scale: 1.02 }} 
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <StatsCard
                                        title="File Asli (JPG/PNG)"
                                        value={formatBytes(result.original_file_size)}
                                        subtitle={`${result.width}x${result.height} pixels`}
                                        color="cyan"
                                        icon={
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        }
                                    />
                                </motion.div>
                                <motion.div 
                                    variants={cardVariants}
                                    whileHover={{ y: -5, scale: 1.02 }} 
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <StatsCard
                                        title="File Kompres (.bin)"
                                        value={formatBytes(result.compressed_size)}
                                        subtitle={result.file_compression_ratio > 0 
                                            ? `Hemat ${result.file_compression_ratio.toFixed(2)}%` 
                                            : `Lebih besar ${Math.abs(result.file_compression_ratio).toFixed(2)}%`}
                                        color={result.file_compression_ratio > 0 ? "green" : "red"}
                                        icon={
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                            </svg>
                                        }
                                    />
                                </motion.div>
                                <motion.div 
                                    variants={cardVariants}
                                    whileHover={{ y: -5, scale: 1.02 }} 
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <StatsCard
                                        title="Kompresi Pixel Data"
                                        value={`${result.compression_ratio.toFixed(2)}%`}
                                        subtitle={`${formatBytes(result.original_size)} → ${formatBytes(result.compressed_size)}`}
                                        color="teal"
                                        icon={
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                            </svg>
                                        }
                                    />
                                </motion.div>
                                <motion.div 
                                    variants={cardVariants}
                                    whileHover={{ y: -5, scale: 1.02 }} 
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <StatsCard
                                        title="Bits Per Pixel"
                                        value={result.bits_per_pixel.toFixed(4)}
                                        subtitle={`Entropy: ${result.entropy.toFixed(4)}`}
                                        color="teal"
                                        icon={
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        }
                                    />
                                </motion.div>
                            </motion.div>

                            {/* Algorithm Info */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.23, type: "spring", stiffness: 100 }}
                                className="mb-6 p-5 rounded-xl border-2 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-teal-300 dark:border-teal-700 shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 dark:from-teal-600 dark:to-cyan-700 rounded-xl flex items-center justify-center shadow-md animate-pulse">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-teal-900 dark:text-teal-100">
                                            {result.algorithm || 'DEFLATE (LZ77 + Huffman)'}
                                            {result.compression_time && (
                                                <span className="ml-2 text-xs bg-teal-200 dark:bg-teal-800 px-2 py-1 rounded-full font-medium">
                                                    ⚡ {(result.compression_time * 1000).toFixed(0)}ms
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-teal-700 dark:text-teal-300 mt-1">
                                            Industry-standard compression • ZIP/GZIP compatible
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* File Size Comparison Info */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.25 }}
                                className={`mb-6 p-4 rounded-lg border ${
                                    result.file_compression_ratio > 0 
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                                }`}
                            >
                                <p className={`text-sm ${
                                    result.file_compression_ratio > 0 
                                        ? 'text-green-800 dark:text-green-200'
                                        : 'text-yellow-800 dark:text-yellow-200'
                                }`}>
                                    <strong>📊 Perbandingan File:</strong> File asli (JPG/PNG): <strong>{formatBytes(result.original_file_size)}</strong> → 
                                    File compressed (.bin): <strong>{formatBytes(result.compressed_size)}</strong>
                                    {result.file_compression_ratio > 0 ? (
                                        <span className="text-green-600 dark:text-green-400 font-semibold"> (Hemat {result.file_compression_ratio.toFixed(2)}%)</span>
                                    ) : (
                                        <span className="text-red-600 dark:text-red-400 font-semibold"> (Lebih besar {Math.abs(result.file_compression_ratio).toFixed(2)}%)</span>
                                    )}
                                </p>
                                
                                <p className={`text-xs mt-2 ${
                                    result.file_compression_ratio > 0 
                                        ? 'text-green-600 dark:text-green-300'
                                        : 'text-yellow-700 dark:text-yellow-300'
                                }`}>
                                    <strong>💡 Penjelasan:</strong> {result.file_compression_ratio > 0 ? (
                                        <>DEFLATE (LZ77 + Huffman) berhasil mengompresi pixel data! Ini bagus untuk gambar dengan pola repetitif.</>
                                    ) : (
                                        <>
                                            DEFLATE bekerja pada pixel data RAW (grayscale). 
                                            File JPG sudah terkompresi dengan algoritma DCT yang <strong>10-20x lebih efisien</strong>. 
                                            Hasil .bin lebih besar karena: <br/>
                                            1. Kehilangan kompresi JPG original (DCT + Quantization)<br/>
                                            2. Overhead header (~6 bytes)<br/>
                                            3. Grayscale conversion loss<br/>
                                            <strong>Gunakan BMP/PNG sederhana untuk hasil optimal.</strong>
                                        </>
                                    )}
                                </p>
                            </motion.div>

                            {/* Download Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mb-8"
                            >
                                <a
                                    href={result.compressed_file_url}
                                    download={result.compressed_filename}
                                    className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download File Kompres
                                </a>
                            </motion.div>

                            {/* Image Preview */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mb-8"
                            >
                                <ImagePreview
                                    src={result.original_image_url}
                                    alt="Original Image"
                                    title="Gambar Asli"
                                    subtitle="Preview gambar yang telah dikompres"
                                />
                            </motion.div>

                            {/* Huffman Tree */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mb-8"
                            >
                                <HuffmanTreeVisualization tree={result.huffman_tree} />
                            </motion.div>

                            {/* Huffman Code Table */}
                            <motion.div
                                variants={cardVariants}
                                whileHover={{ scale: 1.01, y: -2 }}
                            >
                                <HuffmanCodeTable codes={result.huffman_codes} />
                            </motion.div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </>
    );
}
