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
    CpuChipIcon,
    CalendarDaysIcon
} from '@heroicons/react/24/outline';

interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
}

interface CompressionHistory {
    id: number;
    original_filename: string;
    compressed_size: number;
    original_size: number;
    compression_ratio: number;
    created_at: string;
}

interface DashboardStats {
    totalCompressions: number;
    totalUsers: number;
    totalStorageUsed: string;
    avgCompressionRatio: number;
    recentCompressions?: CompressionHistory[];
}

interface AdminDashboardProps {
    user?: User;
    stats: DashboardStats;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, stats }) => {
    // ReactBits-style animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.1,
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { 
            opacity: 0, 
            y: 30,
            scale: 0.9
        },
        visible: { 
            opacity: 1, 
            y: 0,
            scale: 1
        }
    };

    const buttonVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { 
            opacity: 1, 
            scale: 1,
            transition: { duration: 0.3 }
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleQuickAction = (action: string) => {
        console.log(`Quick action: ${action}`);
        // TODO: Implement quick actions
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <Head title="Admin Dashboard" />
            
            <AdminHeader currentPage="dashboard" user={user ? { ...user, role: user.role || 'admin' } : undefined} />

            <motion.div 
                className="p-6 pt-24"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Welcome Section */}
                    <motion.div
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
                            variants={cardVariants}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 cursor-pointer"
                            whileHover={{ 
                                scale: 1.03,
                                y: -8,
                                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                                transition: { duration: 0.3 }
                            }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <motion.div
                                        whileHover={{ rotate: 360 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <DocumentTextIcon className="h-8 w-8 text-blue-500" />
                                    </motion.div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Total Kompresi
                                    </p>
                                    <motion.p 
                                        className="text-2xl font-bold text-gray-900 dark:text-white"
                                        animate={{ 
                                            scale: [1, 1.02, 1],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        {stats.totalCompressions.toLocaleString()}
                                    </motion.p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={cardVariants}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 cursor-pointer"
                            whileHover={{ 
                                scale: 1.03,
                                y: -8,
                                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                                transition: { duration: 0.3 }
                            }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <motion.div
                                        whileHover={{ rotate: 360 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <UserGroupIcon className="h-8 w-8 text-green-500" />
                                    </motion.div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Total Pengguna
                                    </p>
                                    <motion.p 
                                        className="text-2xl font-bold text-gray-900 dark:text-white"
                                        animate={{ 
                                            scale: [1, 1.02, 1],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        {stats.totalUsers.toLocaleString()}
                                    </motion.p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={cardVariants}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 cursor-pointer"
                            whileHover={{ 
                                scale: 1.03,
                                y: -8,
                                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                                transition: { duration: 0.3 }
                            }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <motion.div
                                        whileHover={{ rotate: 360 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <ServerStackIcon className="h-8 w-8 text-purple-500" />
                                    </motion.div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Storage Terpakai
                                    </p>
                                    <motion.p 
                                        className="text-2xl font-bold text-gray-900 dark:text-white"
                                        animate={{ 
                                            scale: [1, 1.02, 1],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        {stats.totalStorageUsed}
                                    </motion.p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={cardVariants}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 cursor-pointer"
                            whileHover={{ 
                                scale: 1.03,
                                y: -8,
                                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                                transition: { duration: 0.3 }
                            }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <motion.div
                                        whileHover={{ rotate: 360 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <ChartBarIcon className="h-8 w-8 text-orange-500" />
                                    </motion.div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Rata-rata Kompresi
                                    </p>
                                    <motion.p 
                                        className="text-2xl font-bold text-gray-900 dark:text-white"
                                        animate={{ 
                                            scale: [1, 1.02, 1],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        {(stats.avgCompressionRatio * 100).toFixed(1)}%
                                    </motion.p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Quick Actions */}
                    <motion.div
                        variants={containerVariants}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 border border-gray-200 dark:border-gray-700"
                        whileHover={{ 
                            scale: 1.01,
                            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                            transition: { duration: 0.2 }
                        }}
                    >
                        <motion.h2 
                            className="text-xl font-semibold text-gray-900 dark:text-white mb-4"
                            variants={cardVariants}
                        >
                            Aksi Cepat
                        </motion.h2>
                        <motion.div 
                            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                            variants={containerVariants}
                        >
                            <motion.button
                                onClick={() => handleQuickAction('cleanup')}
                                className="flex items-center justify-center px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors duration-200 border border-red-200 dark:border-red-800"
                                variants={buttonVariants}
                                whileHover={{ 
                                    scale: 1.05,
                                    backgroundColor: "rgb(254 242 242)",
                                    transition: { duration: 0.2 }
                                }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <motion.div
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <CpuChipIcon className="h-5 w-5 mr-2" />
                                </motion.div>
                                Bersihkan File
                            </motion.button>
                            
                            <motion.button
                                onClick={() => handleQuickAction('users')}
                                className="flex items-center justify-center px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors duration-200 border border-blue-200 dark:border-blue-800"
                                variants={buttonVariants}
                                whileHover={{ 
                                    scale: 1.05,
                                    backgroundColor: "rgb(239 246 255)",
                                    transition: { duration: 0.2 }
                                }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <motion.div
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <UserGroupIcon className="h-5 w-5 mr-2" />
                                </motion.div>
                                Kelola Pengguna
                            </motion.button>
                            
                            <motion.button
                                onClick={() => handleQuickAction('export')}
                                className="flex items-center justify-center px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg transition-colors duration-200 border border-green-200 dark:border-green-800"
                                variants={buttonVariants}
                                whileHover={{ 
                                    scale: 1.05,
                                    backgroundColor: "rgb(240 253 244)",
                                    transition: { duration: 0.2 }
                                }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <motion.div
                                    whileHover={{ y: -2 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                                </motion.div>
                                Ekspor Data
                            </motion.button>
                        </motion.div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                        variants={cardVariants}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
                        whileHover={{ 
                            scale: 1.01,
                            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                            transition: { duration: 0.2 }
                        }}
                    >
                        <motion.div 
                            className="p-6 border-b border-gray-200 dark:border-gray-700"
                            variants={cardVariants}
                        >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Aktivitas Terbaru
                            </h2>
                        </motion.div>
                        
                        <motion.div 
                            className="p-6"
                            variants={containerVariants}
                        >
                            {stats.recentCompressions && stats.recentCompressions.length > 0 ? (
                                <motion.div 
                                    className="space-y-4"
                                    variants={containerVariants}
                                >
                                    {stats.recentCompressions.slice(0, 5).map((compression, index) => (
                                        <motion.div
                                            key={compression.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                            variants={cardVariants}
                                            custom={index}
                                            whileHover={{ 
                                                scale: 1.02,
                                                backgroundColor: "rgb(249 250 251)",
                                                transition: { duration: 0.2 }
                                            }}
                                        >
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {compression.original_filename}
                                                </h4>
                                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    <span className="flex items-center">
                                                        <ChartBarIcon className="h-4 w-4 mr-1" />
                                                        {(compression.compression_ratio * 100).toFixed(1)}% kompresi
                                                    </span>
                                                    <span className="flex items-center">
                                                        <CalendarDaysIcon className="h-4 w-4 mr-1" />
                                                        {formatDate(compression.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                                    variants={cardVariants}
                                >
                                    <motion.div
                                        animate={{ 
                                            y: [0, -10, 0],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    </motion.div>
                                    <p>Belum ada aktivitas kompresi</p>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminDashboard;