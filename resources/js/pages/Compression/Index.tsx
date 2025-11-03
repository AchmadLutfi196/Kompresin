import { useState, FormEvent, ChangeEvent } from 'react';
import { Link, Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import StatsCard from '@/components/Compression/StatsCard';
import HuffmanTreeVisualization from '@/components/Compression/HuffmanTreeVisualization';
import HuffmanCodeTable from '@/components/Compression/HuffmanCodeTable';
import ImagePreview from '@/components/Compression/ImagePreview';

interface CompressionResult {
    original_size: number;
    compressed_size: number;
    compression_ratio: number;
    bits_per_pixel: number;
    entropy: number;
    width: number;
    height: number;
    compressed_file_url: string;
    compressed_filename: string;
    original_image_url: string;
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

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp'];
        if (!validTypes.includes(file.type)) {
            setError('Format file tidak valid. Gunakan JPG, PNG, atau BMP.');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('Ukuran file terlalu besar. Maksimal 10MB.');
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
        if (!selectedFile) return;

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('image', selectedFile);

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
                setResult(data.data);
            } else {
                setError(data.message || 'Terjadi kesalahan saat kompresi');
            }
        } catch (err) {
            setError('Terjadi kesalahan jaringan');
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
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
                                ← Kembali
                            </Link>
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/decompress"
                                    className="text-sm text-green-600 dark:text-green-400 hover:underline"
                                >
                                    Dekompresi
                                </Link>
                                <Link
                                    href="/history"
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Riwayat
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Kompresi Gambar
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Upload gambar untuk dikompres menggunakan algoritma Huffman Code
                        </p>
                    </motion.div>

                    {/* Upload Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8"
                    >
                        <form onSubmit={handleCompress}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Pilih Gambar
                                </label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="max-h-60 object-contain"
                                            />
                                        ) : (
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
                                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                    />
                                                </svg>
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
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
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
                                    'Kompres Gambar'
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
                                    title="Ukuran Asli"
                                    value={formatBytes(result.original_size)}
                                    subtitle={`${result.width}x${result.height} pixels`}
                                    color="blue"
                                />
                                <StatsCard
                                    title="Ukuran Kompres"
                                    value={formatBytes(result.compressed_size)}
                                    subtitle="File .bin"
                                    color="green"
                                />
                                <StatsCard
                                    title="Rasio Kompresi"
                                    value={`${result.compression_ratio}%`}
                                    subtitle={`Hemat ${formatBytes(result.original_size - result.compressed_size)}`}
                                    color="purple"
                                />
                                <StatsCard
                                    title="Bits Per Pixel"
                                    value={result.bits_per_pixel.toFixed(4)}
                                    subtitle={`Entropy: ${result.entropy.toFixed(4)}`}
                                    color="orange"
                                />
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
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <HuffmanCodeTable codes={result.huffman_codes} />
                            </motion.div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
