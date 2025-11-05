import React from 'react';
import { Head, router } from '@inertiajs/react';
import AdminHeader from '../../components/AdminHeader';
import { motion } from 'framer-motion';
import {
    ChartBarIcon,
    UserGroupIcon,
    DocumentTextIcon,
    ServerStackIcon,
    CloudArrowUpIcon,
    ArrowTrendingUpIcon,
    CalendarDaysIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';
import { SweetAlert } from '../../utils/sweetAlert';

interface DashboardStats {
    totalCompressions: number;
    totalUsers: number;
    totalStorageUsed: string;
    avgCompressionRatio: number;
    recentCompressions: Array<{
        id: number;
        original_filename: string;
        compressed_filename: string;
        original_size: number;
        compressed_size: number;
        compression_ratio: number;
        created_at: string;
    }>;
}

interface AdminDashboardProps {
    stats: DashboardStats;
    user?: {
        name: string;
        email: string;
        role: string;
    };
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats, user }) => {
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleQuickAction = async (action: string) => {
        switch (action) {
            case 'cleanup':
                const result = await SweetAlert.confirm(
                    'Bersihkan File',
                    'Apakah Anda yakin ingin membersihkan file lama?'
                );
                
                if (result.isConfirmed) {
                    router.visit('/admin/files');
                }
                break;
            case 'users':
                SweetAlert.info('Info', 'Fitur manajemen pengguna akan segera hadir');
                break;
            case 'export':
                SweetAlert.info('Info', 'Fitur ekspor data akan segera hadir');
                break;
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
            <Head title="Admin Dashboard" />
            
            <AdminHeader currentPage="dashboard" user={user} />

            <motion.div 
                className="p-6 pt-24"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Welcome Section */}
                    <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Selamat Datang, {user?.name || 'Admin'}! 👋
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Kelola sistem kompresi dan pantau aktivitas aplikasi
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <DocumentTextIcon className="h-8 w-8 text-blue-500" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Kompresi
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalCompressions.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <UserGroupIcon className="h-8 w-8 text-green-500" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Pengguna
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalUsers.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ServerStackIcon className="h-8 w-8 text-purple-500" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Storage Terpakai
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalStorageUsed}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ChartBarIcon className="h-8 w-8 text-orange-500" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Rata-rata Kompresi
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {(stats.avgCompressionRatio * 100).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 border border-gray-200 dark:border-gray-700"
                >
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Aksi Cepat
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button
                            onClick={() => handleQuickAction('cleanup')}
                            className="flex items-center justify-center px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200 border border-red-200 dark:border-red-800"
                        >
                            <CpuChipIcon className="h-5 w-5 mr-2" />
                            Bersihkan File
                        </button>
                        
                        <button
                            onClick={() => handleQuickAction('users')}
                            className="flex items-center justify-center px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 border border-blue-200 dark:border-blue-800"
                        >
                            <UserGroupIcon className="h-5 w-5 mr-2" />
                            Kelola Pengguna
                        </button>
                        
                        <button
                            onClick={() => handleQuickAction('export')}
                            className="flex items-center justify-center px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200 border border-green-200 dark:border-green-800"
                        >
                            <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                            Ekspor Data
                        </button>
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
                >
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Aktivitas Terbaru
                        </h2>
                    </div>
                    
                    <div className="p-6">
                        {stats.recentCompressions?.length > 0 ? (
                            <div className="space-y-4">
                                {stats.recentCompressions.slice(0, 5).map((compression) => (
                                    <div
                                        key={compression.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {compression.original_filename}
                                            </h4>
                                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                <span>
                                                    {formatFileSize(compression.original_size)} → {formatFileSize(compression.compressed_size)}
                                                </span>
                                                <span className="flex items-center">
                                                    <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                                                    {(compression.compression_ratio * 100).toFixed(1)}% kompresi
                                                </span>
                                                <span className="flex items-center">
                                                    <CalendarDaysIcon className="h-4 w-4 mr-1" />
                                                    {formatDate(compression.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Belum ada aktivitas kompresi</p>
                            </div>
                        )}
                    </div>
                </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminDashboard;