import React from 'react';
import { Head, router } from '@inertiajs/react';
import AdminHeader from '@/components/AdminHeader';
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
import { SweetAlert } from '@/utils/sweetAlert';

interface DashboardStats {
    totalCompressions: number;
    totalUsers: number;
    totalStorageUsed: string;
    averageCompressionRatio: number;
    recentActivity: number;
    activeUsers: number;
    compressionToday: number;
    systemUptime: string;
}

interface AdminDashboardProps {
    stats: DashboardStats;
    user?: {
        name: string;
        email: string;
        role: string;
    };
}

const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: string;
    trendUp?: boolean;
}> = ({ title, value, icon: Icon, trend, trendUp }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white border border-teal-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                {trend && (
                    <div className={`flex items-center mt-2 text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                        <ArrowTrendingUpIcon className={`w-4 h-4 mr-1 ${trendUp ? '' : 'rotate-180'}`} />
                        {trend}
                    </div>
                )}
            </div>
            <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg">
                <Icon className="w-8 h-8 text-white" />
            </div>
        </div>
    </motion.div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats, user }) => {
    // Provide default values for stats
    const safeStats = {
        totalCompressions: stats?.totalCompressions || 0,
        totalUsers: stats?.totalUsers || 0,
        totalStorageUsed: stats?.totalStorageUsed || '0 MB',
        averageCompressionRatio: stats?.averageCompressionRatio || 0,
        recentActivity: stats?.recentActivity || 0,
        activeUsers: stats?.activeUsers || 0,
        compressionToday: stats?.compressionToday || 0,
        systemUptime: stats?.systemUptime || '0 days'
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
            <Head title="Admin Dashboard" />
            <AdminHeader currentPage="dashboard" user={user} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-gray-900 mb-2"
                    >
                        Admin Dashboard
                    </motion.h1>
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center justify-between"
                    >
                        <p className="text-gray-600">
                            Kelola sistem kompresi dan monitor aktivitas pengguna
                        </p>
                        {user && (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500">
                                    Welcome, {user.name}
                                </span>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={async () => {
                                        const result = await SweetAlert.confirm(
                                            'Logout dari Admin Panel?',
                                            'Anda akan keluar dari sesi admin',
                                            'Ya, Logout',
                                            'Batal'
                                        );

                                        if (result.isConfirmed) {
                                            SweetAlert.loading('Logout...', 'Sedang keluar dari sistem');
                                            
                                            fetch('/admin/logout', {
                                                method: 'POST',
                                                headers: {
                                                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                                },
                                            }).then(() => {
                                                SweetAlert.close();
                                                SweetAlert.toast.success('Berhasil logout dari admin panel');
                                                setTimeout(() => {
                                                    window.location.href = '/admin/login';
                                                }, 1000);
                                            }).catch(() => {
                                                SweetAlert.error('Logout Gagal', 'Terjadi kesalahan saat logout');
                                            });
                                        }
                                    }}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm"
                                >
                                    Logout
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Stats Grid */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
                >
                    <StatCard
                        title="Total Kompresi"
                        value={safeStats.totalCompressions.toLocaleString()}
                        icon={DocumentTextIcon}
                        trend="+12% dari bulan lalu"
                        trendUp={true}
                    />
                    <StatCard
                        title="Total Pengguna"
                        value={safeStats.totalUsers.toLocaleString()}
                        icon={UserGroupIcon}
                        trend="+5% dari minggu lalu"
                        trendUp={true}
                    />
                    <StatCard
                        title="Storage Digunakan"
                        value={safeStats.totalStorageUsed}
                        icon={ServerStackIcon}
                        trend="2.1GB tersedia"
                    />
                    <StatCard
                        title="Rata-rata Kompresi"
                        value={`${safeStats.averageCompressionRatio}%`}
                        icon={ChartBarIcon}
                        trend="+3% dari kemarin"
                        trendUp={true}
                    />
                </motion.div>

                {/* Secondary Stats */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
                >
                    <StatCard
                        title="Aktivitas Terbaru"
                        value={safeStats.recentActivity.toLocaleString()}
                        icon={CloudArrowUpIcon}
                    />
                    <StatCard
                        title="Pengguna Aktif"
                        value={safeStats.activeUsers.toLocaleString()}
                        icon={UserGroupIcon}
                    />
                    <StatCard
                        title="Kompresi Hari Ini"
                        value={safeStats.compressionToday.toLocaleString()}
                        icon={CalendarDaysIcon}
                    />
                    <StatCard
                        title="System Uptime"
                        value={safeStats.systemUptime}
                        icon={CpuChipIcon}
                    />
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white border border-teal-100 rounded-xl p-6 shadow-sm"
                >
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => window.location.href = '/admin/history'}
                            className="flex items-center p-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-200"
                        >
                            <DocumentTextIcon className="w-6 h-6 mr-3" />
                            <span className="font-medium">Lihat History</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => window.location.href = '/admin/files'}
                            className="flex items-center p-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-200"
                        >
                            <ServerStackIcon className="w-6 h-6 mr-3" />
                            <span className="font-medium">Kelola File</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => window.location.href = '/admin/settings'}
                            className="flex items-center p-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-200"
                        >
                            <CpuChipIcon className="w-6 h-6 mr-3" />
                            <span className="font-medium">Pengaturan</span>
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;