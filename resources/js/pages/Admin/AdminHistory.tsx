import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminHeader from '../../components/AdminHeader';
import { motion } from 'framer-motion';
import {
    TrashIcon,
    ShieldCheckIcon,
    CalendarDaysIcon,
    DocumentTextIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ChartBarIcon,
    PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface CompressionHistoryItem {
    id: number;
    filename: string;
    compressed_path: string;
    original_size: number;
    compressed_size: number;
    compression_ratio: number;
    created_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

interface AdminHistoryProps {
    history: {
        data: CompressionHistoryItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    user?: {
        name: string;
        email: string;
        role: string;
    };
}

const AdminHistory: React.FC<AdminHistoryProps> = ({ history, user }) => {
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
        if (!confirm('Apakah Anda yakin ingin menghapus item ini?')) return;
        
        setLoading(id);
        try {
            router.delete(`/admin/history/${id}`, {
                onSuccess: () => {
                    // Page will reload automatically
                },
                onError: () => {
                    alert('Gagal menghapus item');
                },
                onFinish: () => {
                    setLoading(null);
                }
            });
        } catch (error) {
            console.error('Delete error:', error);
            setLoading(null);
        }
    };

    const showPrivacyInfo = () => {
        // Privacy protection indicator - no action needed
    };

    // Chart data processing
    const chartData = useMemo(() => {
        const data = history.data || [];
        
        // If no data, return default empty chart data
        if (data.length === 0) {
            return {
                ratioDistribution: {
                    labels: ['Tidak Ada Data'],
                    datasets: [{
                        data: [1],
                        backgroundColor: ['rgba(156, 163, 175, 0.8)'],
                        borderColor: ['rgba(156, 163, 175, 1)'],
                        borderWidth: 2
                    }]
                },
                dailyActivity: {
                    labels: ['Tidak Ada Data'],
                    datasets: [{
                        label: 'Kompresi Harian',
                        data: [0],
                        backgroundColor: 'rgba(156, 163, 175, 0.5)',
                        borderColor: 'rgba(156, 163, 175, 1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                compressionStats: {
                    labels: ['Tidak Ada Data'],
                    datasets: [{
                        label: 'Storage (MB)',
                        data: [0],
                        backgroundColor: ['rgba(156, 163, 175, 0.8)'],
                        borderColor: ['rgba(156, 163, 175, 1)'],
                        borderWidth: 2
                    }]
                }
            };
        }
        
        // Compression ratio distribution
        const ratioRanges = {
            'Sangat Baik (>60%)': 0,
            'Baik (40-60%)': 0,
            'Cukup (20-40%)': 0,
            'Kurang (<20%)': 0
        };
        
        // Daily compression count (last 7 days)
        const dailyCompressions: { [key: string]: number } = {};
        const last7Days = Array.from({length: 7}, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
        }).reverse();
        
        last7Days.forEach(date => dailyCompressions[date] = 0);
        
        // File size distribution
        let totalOriginalSize = 0;
        let totalCompressedSize = 0;
        
        data.forEach(item => {
            // Ratio distribution
            const ratio = item.compression_ratio;
            if (ratio > 60) ratioRanges['Sangat Baik (>60%)']++;
            else if (ratio > 40) ratioRanges['Baik (40-60%)']++;
            else if (ratio > 20) ratioRanges['Cukup (20-40%)']++;
            else ratioRanges['Kurang (<20%)']++;
            
            // Daily compressions
            const dateKey = item.created_at.split(' ')[0];
            if (dailyCompressions.hasOwnProperty(dateKey)) {
                dailyCompressions[dateKey]++;
            }
            
            // Total sizes
            totalOriginalSize += item.original_size;
            totalCompressedSize += item.compressed_size;
        });
        
        return {
            ratioDistribution: {
                labels: Object.keys(ratioRanges),
                datasets: [{
                    data: Object.values(ratioRanges),
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',   // Green - Sangat Baik
                        'rgba(59, 130, 246, 0.8)',   // Blue - Baik
                        'rgba(245, 158, 11, 0.8)',   // Yellow - Cukup
                        'rgba(239, 68, 68, 0.8)',    // Red - Kurang
                    ],
                    borderColor: [
                        'rgba(34, 197, 94, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(239, 68, 68, 1)',
                    ],
                    borderWidth: 2
                }]
            },
            dailyActivity: {
                labels: last7Days.map(date => {
                    const d = new Date(date);
                    return d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
                }),
                datasets: [{
                    label: 'Kompresi Harian',
                    data: last7Days.map(date => dailyCompressions[date]),
                    backgroundColor: 'rgba(20, 184, 166, 0.5)',
                    borderColor: 'rgba(20, 184, 166, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            compressionStats: {
                labels: ['Data Asli', 'Data Terkompresi', 'Penghematan'],
                datasets: [{
                    label: 'Storage (MB)',
                    data: [
                        totalOriginalSize / (1024 * 1024),
                        totalCompressedSize / (1024 * 1024),
                        (totalOriginalSize - totalCompressedSize) / (1024 * 1024)
                    ],
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(34, 197, 94, 0.8)'
                    ],
                    borderColor: [
                        'rgba(239, 68, 68, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(34, 197, 94, 1)'
                    ],
                    borderWidth: 2
                }]
            }
        };
    }, [history.data]);

    const filteredHistory = history.data.filter(item => {
        const filename = item.filename || '';
        const matchesSearch = filename.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFormat = true; // Format filter removed since field not available
        return matchesSearch && matchesFormat;
    });

    const uniqueFormats: string[] = []; // Format filter removed since field not available

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
            <Head title="Admin History" />
            <AdminHeader currentPage="history" user={user} />

            <motion.div 
                className="p-6 pt-24"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Compression Ratio Distribution */}
                        <motion.div 
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                            <ChartBarIcon className="w-5 h-5 text-teal-600 mr-2" />
                            Distribusi Rasio Kompresi
                        </h3>
                        <div className="h-64">
                            <Doughnut 
                                data={chartData.ratioDistribution}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            labels: {
                                                color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                                                padding: 15,
                                                usePointStyle: true
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </motion.div>

                        {/* Daily Activity */}
                        <motion.div 
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                            <PresentationChartLineIcon className="w-5 h-5 text-blue-600 mr-2" />
                            Aktivitas 7 Hari Terakhir
                        </h3>
                        <div className="h-64">
                            <Line 
                                data={chartData.dailyActivity}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: false
                                        }
                                    },
                                    scales: {
                                        x: {
                                            ticks: {
                                                color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
                                            },
                                            grid: {
                                                color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
                                            }
                                        },
                                        y: {
                                            ticks: {
                                                color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
                                            },
                                            grid: {
                                                color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </motion.div>

                        {/* Storage Statistics */}
                        <motion.div 
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                            <ChartBarIcon className="w-5 h-5 text-green-600 mr-2" />
                            Statistik Storage
                        </h3>
                        <div className="h-64">
                            <Bar 
                                data={chartData.compressionStats}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: false
                                        }
                                    },
                                    scales: {
                                        x: {
                                            ticks: {
                                                color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
                                            },
                                            grid: {
                                                color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
                                            }
                                        },
                                        y: {
                                            ticks: {
                                                color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
                                            },
                                            grid: {
                                                color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                        </motion.div>
                    </div>

                {/* Header */}
                <div className="mb-8">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                    >
                        History Kompresi
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600 dark:text-gray-400"
                    >
                        Kelola dan monitor semua aktivitas kompresi pengguna
                    </motion.p>
                </div>

                {/* Filters */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6"
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
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>

                        {/* Format Filter removed - field not available */}
                    </div>
                </motion.div>

                {/* Stats Summary */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
                >
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
                        <div className="flex items-center">
                            <DocumentTextIcon className="w-8 h-8 text-teal-600 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Files</p>
                                <p className="text-xl font-semibold text-gray-900 dark:text-white">{history.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
                        <div className="flex items-center">
                            <CalendarDaysIcon className="w-8 h-8 text-cyan-600 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Filtered Results</p>
                                <p className="text-xl font-semibold text-gray-900 dark:text-white">{filteredHistory.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
                        <div className="flex items-center">
                            <FunnelIcon className="w-8 h-8 text-blue-600 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Active Filters</p>
                                <p className="text-xl font-semibold text-gray-900 dark:text-white">
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
                    transition={{ delay: 0.3 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">File Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ratio</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredHistory.length > 0 ? (
                                    filteredHistory.map((item, index) => (
                                        <motion.tr
                                            key={item.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {item.filename}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {item.user?.name || 'Anonim'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
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

                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(item.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={showPrivacyInfo}
                                                        className="text-amber-600 hover:text-amber-900 p-1 rounded-full hover:bg-amber-50 transition-colors duration-150"
                                                        title="File diproteksi untuk privasi pengguna"
                                                    >
                                                        <ShieldCheckIcon className="w-5 h-5" />
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
            </motion.div>
        </div>
    );
};

export default AdminHistory;