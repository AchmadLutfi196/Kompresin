import { useState, FormEvent, ChangeEvent } from 'react';
import { Link, Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import StatsCard from '@/components/Compression/StatsCard';
import ImagePreview from '@/components/Compression/ImagePreview';
import AppHeader from '@/components/AppHeader';
import { SweetAlert } from '@/utils/sweetAlert';

interface DecompressionResult {
    decompressed_image_url: string;
    decompressed_filename: string;
    width: number;
    height: number;
    compressed_size: number;
    decompressed_size: number;
}

export default function Index() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DecompressionResult | null>(null);
    const [error, setError] = useState<string>('');

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file extension
        const validExtensions = ['.bin', '.txt', '.json', '.zip'];
        const hasValidExtension = validExtensions.some(ext => file.name.endsWith(ext));
        if (!hasValidExtension) {
            SweetAlert.error('Format File Tidak Valid', 'Silakan gunakan file hasil kompresi (.bin, .txt, .json, atau .zip)');
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
    };

    const handleDecompress = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            SweetAlert.warning('File Belum Dipilih', 'Silakan pilih file hasil kompresi terlebih dahulu');
            return;
        }

        setLoading(true);
        setError('');

        // Show loading notification
        SweetAlert.loading('Memproses Dekompresi', 'Sedang mendekompresi file...');

        const formData = new FormData();
        formData.append('compressed_file', selectedFile);

        try {
            const response = await fetch('/decompress', {
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
                SweetAlert.toast.success('Dekompresi berhasil! Gambar telah dikembalikan ke bentuk asli');
            } else {
                SweetAlert.error('Dekompresi Gagal', data.message || 'Terjadi kesalahan saat memproses file');
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

    const compressionRatio = result 
        ? ((1 - (result.compressed_size / result.decompressed_size)) * 100).toFixed(2)
        : 0;

    return (
        <>
            <Head title="Dekompresi Gambar" />
            
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
                <AppHeader currentPage="decompress" showBackButton />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Dekompresi Gambar
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Upload file .bin hasil kompresi untuk mengembalikan ke gambar asli
                        </p>
                    </motion.div>

                    {/* Upload Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8"
                    >
                        <form onSubmit={handleDecompress}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Pilih File Kompres (.bin)
                                </label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <svg
                                                className="w-12 h-12 mb-4 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="font-semibold">Klik untuk upload</span> atau drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                File .bin hasil kompresi (Max. 10MB)
                                            </p>
                                            {selectedFile && (
                                                <p className="mt-4 text-sm font-medium text-green-600 dark:text-green-400">
                                                    ✓ {selectedFile.name}
                                                </p>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".bin"
                                            onChange={handleFileSelect}
                                        />
                                    </label>
                                </div>
                                {selectedFile && (
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        File terpilih: {selectedFile.name} ({formatBytes(selectedFile.size)})
                                    </p>
                                )}
                            </div>

                            {error && (
                                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={!selectedFile || loading}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memproses...
                                    </>
                                ) : (
                                    'Dekompresi Gambar'
                                )}
                            </button>
                        </form>
                    </motion.div>

                    {/* Results */}
                    {result && (
                        <>
                            {/* Statistics */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                            >
                                <StatsCard
                                    title="Ukuran File Kompres"
                                    value={formatBytes(result.compressed_size)}
                                    subtitle="File .bin"
                                    color="blue"
                                />
                                <StatsCard
                                    title="Ukuran Hasil Dekompresi"
                                    value={formatBytes(result.decompressed_size)}
                                    subtitle={`${result.width}x${result.height} pixels`}
                                    color="green"
                                />
                                <StatsCard
                                    title="Rasio Kompresi"
                                    value={`${compressionRatio}%`}
                                    subtitle="Pengurangan ukuran"
                                    color="purple"
                                />
                                <StatsCard
                                    title="Dimensi"
                                    value={`${result.width}×${result.height}`}
                                    subtitle="Pixels"
                                    color="orange"
                                />
                            </motion.div>

                            {/* Success Message */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                            >
                                <div className="flex items-start">
                                    <svg className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <h3 className="text-sm font-medium text-green-800 dark:text-green-400">
                                            Dekompresi Berhasil!
                                        </h3>
                                        <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                                            Gambar telah berhasil dikembalikan ke bentuk aslinya menggunakan tabel Huffman.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Decompressed Image */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mb-8"
                            >
                                <ImagePreview
                                    src={result.decompressed_image_url}
                                    alt="Decompressed Image"
                                    title="Hasil Dekompresi"
                                    subtitle="Gambar yang telah dikembalikan dari file kompresi"
                                />
                            </motion.div>

                            {/* Download Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <a
                                    href={result.decompressed_image_url}
                                    download={result.decompressed_filename}
                                    className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download Gambar
                                </a>
                            </motion.div>
                        </>
                    )}

                    {/* Info Section */}
                    {!result && !loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6"
                        >
                            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-3">
                                Cara Menggunakan Dekompresi
                            </h3>
                            <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-300">
                                <li>Upload file .bin yang dihasilkan dari proses kompresi</li>
                                <li>Klik tombol "Dekompresi Gambar"</li>
                                <li>Tunggu hingga proses selesai</li>
                                <li>Lihat hasil gambar yang telah dikembalikan</li>
                                <li>Download gambar hasil dekompresi jika diperlukan</li>
                            </ol>
                            <p className="mt-4 text-sm text-blue-700 dark:text-blue-300">
                                <strong>Catatan:</strong> File .bin harus merupakan hasil kompresi dari aplikasi ini 
                                karena mengandung metadata pohon Huffman yang diperlukan untuk dekompresi.
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
}
