import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppHeader from '@/components/AppHeader';
import { motion } from 'framer-motion';
import {
    TrashIcon,
    ArrowDownTrayIcon,
    CalendarDaysIcon,
    DocumentTextIcon,
    MagnifyingGlassIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
import { SweetAlert } from '@/utils/sweetAlert';

interface CompressionHistoryItem {
    id: number;
    original_filename: string;
    compressed_filename: string;
    original_size: number;
    compressed_size: number;
    compression_ratio: number;
    format: string;
    created_at: string;
}

interface AdminHistoryProps {
    history: {
        data: CompressionHistoryItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const AdminHistory: React.FC<AdminHistoryProps> = ({ history }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFormat, setSelectedFormat] = useState('all');
    const [loading, setLoading] = useState<number | null>(null);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDelete = async (id: number) => {
        const result = await SweetAlert.confirmDelete(
            'Hapus Data Kompresi?',
            'Data history kompresi ini akan dihapus permanen'
        );

        if (!result.isConfirmed) return;
        
        setLoading(id);
        SweetAlert.loading('Menghapus Data', 'Sedang menghapus data kompresi...');
        
        try {
            router.delete(`/admin/history/${id}`, {
                onSuccess: () => {
                    SweetAlert.close();
                    SweetAlert.toast.success('Data berhasil dihapus');
                },
                onError: () => {
                    SweetAlert.error('Gagal Menghapus', 'Terjadi kesalahan saat menghapus data');
                },
                onFinish: () => {
                    setLoading(null);
                }
            });
        } catch (error) {
            console.error('Delete error:', error);
            SweetAlert.error('Kesalahan Sistem', 'Terjadi kesalahan tidak terduga');
            setLoading(null);
        }
    };

    const handleDownload = (filename: string) => {
        SweetAlert.toast.info('Mengunduh file...');
        window.open(`/storage/${filename}`, '_blank');
    };

    const filteredHistory = history.data.filter(item => {
        const matchesSearch = item.original_filename.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFormat = selectedFormat === 'all' || item.format === selectedFormat;
        return matchesSearch && matchesFormat;
    });

    const uniqueFormats = [...new Set(history.data.map(item => item.format))];

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
            <Head title="Admin History" />
            <AppHeader currentPage="admin" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-gray-900 mb-2"
                    >
                        History Kompresi
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600"
                    >
                        Kelola dan monitor semua aktivitas kompresi pengguna
                    </motion.p>
                </div>

                {/* Filters */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white border border-teal-100 rounded-xl p-6 mb-6 shadow-sm"
                >
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama file..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>

                        {/* Format Filter */}
                        <div className="relative">
                            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={selectedFormat}
                                onChange={(e) => setSelectedFormat(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white min-w-[140px]"
                            >
                                <option value="all">Semua Format</option>
                                {uniqueFormats.map(format => (
                                    <option key={format} value={format}>{format.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Summary */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
                >
                    <div className="bg-white border border-teal-100 rounded-lg p-4">
                        <div className="flex items-center">
                            <DocumentTextIcon className="w-8 h-8 text-teal-600 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Total Files</p>
                                <p className="text-xl font-semibold text-gray-900">{history.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-teal-100 rounded-lg p-4">
                        <div className="flex items-center">
                            <CalendarDaysIcon className="w-8 h-8 text-cyan-600 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Filtered Results</p>
                                <p className="text-xl font-semibold text-gray-900">{filteredHistory.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-teal-100 rounded-lg p-4">
                        <div className="flex items-center">
                            <FunnelIcon className="w-8 h-8 text-blue-600 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Active Filters</p>
                                <p className="text-xl font-semibold text-gray-900">
                                    {(searchTerm ? 1 : 0) + (selectedFormat !== 'all' ? 1 : 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* History Table */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white border border-teal-100 rounded-xl shadow-sm overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-teal-50 to-cyan-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Original</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Hasil</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ratio</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Format</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredHistory.length > 0 ? (
                                    filteredHistory.map((item, index) => (
                                        <motion.tr
                                            key={item.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                            className="hover:bg-gray-50 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.original_filename}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.compressed_filename}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div>
                                                    <div>{formatFileSize(item.original_size)}</div>
                                                    <div className="text-xs text-teal-600">→ {formatFileSize(item.compressed_size)}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    item.compression_ratio >= 50 
                                                        ? 'bg-green-100 text-green-800'
                                                        : item.compression_ratio >= 25
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {item.compression_ratio}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-800">
                                                    {item.format.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(item.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleDownload(item.compressed_filename)}
                                                        className="text-teal-600 hover:text-teal-900 p-1 rounded-full hover:bg-teal-50 transition-colors duration-150"
                                                        title="Download"
                                                    >
                                                        <ArrowDownTrayIcon className="w-5 h-5" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleDelete(item.id)}
                                                        disabled={loading === item.id}
                                                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors duration-150 disabled:opacity-50"
                                                        title="Delete"
                                                    >
                                                        {loading === item.id ? (
                                                            <div className="w-5 h-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                                                        ) : (
                                                            <TrashIcon className="w-5 h-5" />
                                                        )}
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500 text-lg">Tidak ada data yang ditemukan</p>
                                            {searchTerm || selectedFormat !== 'all' ? (
                                                <p className="text-gray-400 text-sm mt-2">Coba ubah filter pencarian Anda</p>
                                            ) : null}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminHistory;