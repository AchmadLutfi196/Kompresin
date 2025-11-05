import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import AdminHeader from '../../components/AdminHeader';
import { motion } from 'framer-motion';
import {
    CogIcon,
    ServerStackIcon,
    DocumentIcon,
    ClockIcon,
    ShieldCheckIcon,
    BoltIcon,
    ChartBarIcon,
    ExclamationTriangleIcon
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

interface SystemSettings {
    maxFileSize: number;
    allowedFormats: string[];
    compressionLevel: number;
    cleanupSchedule: string;
    enableLogging: boolean;
    maintenanceMode: boolean;
    maxStorageSize: number;
    backupEnabled: boolean;
}

interface AdminSettingsProps {
    settings: SystemSettings;
    phpVersion: string;
    laravelVersion: string;
    diskSpace: {
        used: string;
        available: string;
        total: string;
    };
    user?: {
        name: string;
        email: string;
        role: string;
    };
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ settings, phpVersion, laravelVersion, diskSpace, user }) => {
    const [formData, setFormData] = useState<SystemSettings>(settings);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const handleInputChange = (key: keyof SystemSettings, value: any) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        // Simulate save
        setTimeout(() => {
            setSaving(false);
            alert('Pengaturan berhasil disimpan!');
        }, 1000);
    };

    const tabs = [
        {
            id: 'general',
            name: 'General',
            icon: CogIcon,
            color: 'text-teal-600'
        },
        {
            id: 'compression',
            name: 'Compression',
            icon: DocumentIcon,
            color: 'text-cyan-600'
        },
        {
            id: 'storage',
            name: 'Storage',
            icon: ServerStackIcon,
            color: 'text-blue-600'
        },
        {
            id: 'security',
            name: 'Security',
            icon: ShieldCheckIcon,
            color: 'text-purple-600'
        }
    ];

    // System analytics data
    const systemAnalytics = useMemo(() => {
        // Simulated system data - in real app, this would come from props
        const currentTime = new Date();
        const last7Days = Array.from({length: 7}, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
        }).reverse();

        return {
            systemUsage: {
                labels: ['CPU', 'Memory', 'Storage', 'Bandwidth'],
                datasets: [{
                    label: 'Usage (%)',
                    data: [65, 78, 45, 82], // Simulated data
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',    // CPU - Red
                        'rgba(245, 158, 11, 0.8)',   // Memory - Yellow  
                        'rgba(34, 197, 94, 0.8)',    // Storage - Green
                        'rgba(59, 130, 246, 0.8)'    // Bandwidth - Blue
                    ],
                    borderColor: [
                        'rgba(239, 68, 68, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(34, 197, 94, 1)',
                        'rgba(59, 130, 246, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            performanceTrend: {
                labels: last7Days,
                datasets: [{
                    label: 'Response Time (ms)',
                    data: [245, 198, 156, 203, 178, 134, 167], // Simulated data
                    backgroundColor: 'rgba(20, 184, 166, 0.5)',
                    borderColor: 'rgba(20, 184, 166, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            storageBreakdown: {
                labels: ['User Files', 'Compressed Data', 'System Files', 'Logs', 'Free Space'],
                datasets: [{
                    data: [35, 25, 15, 5, 20], // Simulated data in percentage
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',   // User Files - Blue
                        'rgba(34, 197, 94, 0.8)',    // Compressed - Green
                        'rgba(245, 158, 11, 0.8)',   // System - Yellow
                        'rgba(239, 68, 68, 0.8)',    // Logs - Red
                        'rgba(156, 163, 175, 0.8)'   // Free - Gray
                    ],
                    borderColor: [
                        'rgba(59, 130, 246, 1)',
                        'rgba(34, 197, 94, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(156, 163, 175, 1)'
                    ],
                    borderWidth: 2
                }]
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
            <Head title="Admin Settings" />
            <AdminHeader currentPage="settings" user={user} />

            <motion.div 
                className="p-6 pt-24"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* System Analytics */}
                    <div className="mb-8">
                    <motion.h2 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center"
                    >
                        <ChartBarIcon className="w-6 h-6 text-teal-600 mr-2" />
                        System Analytics
                    </motion.h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* System Resource Usage */}
                        <motion.div 
                            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                                <ServerStackIcon className="w-5 h-5 text-red-600 mr-2" />
                                Resource Usage
                            </h3>
                            <div className="h-64">
                                <Bar 
                                    data={systemAnalytics.systemUsage}
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
                                                beginAtZero: true,
                                                max: 100,
                                                ticks: {
                                                    color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
                                                    callback: function(value) {
                                                        return value + '%';
                                                    }
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

                        {/* Performance Trend */}
                        <motion.div 
                            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                                <BoltIcon className="w-5 h-5 text-teal-600 mr-2" />
                                Performance Trend
                            </h3>
                            <div className="h-64">
                                <Line 
                                    data={systemAnalytics.performanceTrend}
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
                                                    color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
                                                    callback: function(value) {
                                                        return value + 'ms';
                                                    }
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

                        {/* Storage Breakdown */}
                        <motion.div 
                            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                                <DocumentIcon className="w-5 h-5 text-blue-600 mr-2" />
                                Storage Breakdown
                            </h3>
                            <div className="h-64">
                                <Doughnut 
                                    data={systemAnalytics.storageBreakdown}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                                labels: {
                                                    color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                                                    padding: 10,
                                                    usePointStyle: true,
                                                    font: {
                                                        size: 11
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                    >
                        System Settings
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600"
                    >
                        Konfigurasi sistem kompresi dan pengaturan aplikasi
                    </motion.p>
                </div>

                {/* System Info */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                >
                    <div className="bg-white border border-teal-100 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center">
                            <BoltIcon className="w-8 h-8 text-orange-600 mr-4" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">PHP Version</p>
                                <p className="text-xl font-bold text-gray-900">{phpVersion}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-teal-100 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center">
                            <CogIcon className="w-8 h-8 text-red-600 mr-4" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Laravel Version</p>
                                <p className="text-xl font-bold text-gray-900">{laravelVersion}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-teal-100 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center">
                            <ServerStackIcon className="w-8 h-8 text-green-600 mr-4" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Disk Space</p>
                                <p className="text-xl font-bold text-gray-900">{diskSpace.available}</p>
                                <p className="text-xs text-gray-500">of {diskSpace.total} available</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Tabs */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                            <div className="p-4 bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-200/50 dark:border-gray-700/50">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pengaturan</h3>
                            </div>
                            <div className="p-2">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <motion.button
                                            key={tab.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 mb-1 ${
                                                activeTab === tab.id
                                                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            <Icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                                            <span className="font-medium">{tab.name}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Settings Content */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-3"
                    >
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                            <div className="p-6">
                                {activeTab === 'general' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                                <CogIcon className="w-6 h-6 text-teal-600 mr-2" />
                                                General Settings
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Maintenance Mode
                                                </label>
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.maintenanceMode}
                                                        onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                                                        className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-teal-600 focus:ring-teal-500 mr-2"
                                                    />
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Enable maintenance mode
                                                    </span>
                                                </div>
                                                {formData.maintenanceMode && (
                                                    <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                                        <div className="flex items-center">
                                                            <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 mr-2" />
                                                            <span className="text-sm text-orange-700">
                                                                Website akan dalam mode maintenance
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Enable Logging
                                                </label>
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.enableLogging}
                                                        onChange={(e) => handleInputChange('enableLogging', e.target.checked)}
                                                        className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-teal-600 focus:ring-teal-500 mr-2"
                                                    />
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Enable system logging
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Cleanup Schedule
                                                </label>
                                                <select
                                                    value={formData.cleanupSchedule}
                                                    onChange={(e) => handleInputChange('cleanupSchedule', e.target.value)}
                                                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                                >
                                                    <option value="daily">Daily</option>
                                                    <option value="weekly">Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="never">Never</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Backup Enabled
                                                </label>
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.backupEnabled}
                                                        onChange={(e) => handleInputChange('backupEnabled', e.target.checked)}
                                                        className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-teal-600 focus:ring-teal-500 mr-2"
                                                    />
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Enable automatic backup
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'compression' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                                <DocumentIcon className="w-6 h-6 text-cyan-600 mr-2" />
                                                Compression Settings
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Max File Size (MB)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.maxFileSize}
                                                    onChange={(e) => handleInputChange('maxFileSize', Number(e.target.value))}
                                                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Compression Level
                                                </label>
                                                <select
                                                    value={formData.compressionLevel}
                                                    onChange={(e) => handleInputChange('compressionLevel', Number(e.target.value))}
                                                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                                >
                                                    <option value={1}>Level 1 (Fastest)</option>
                                                    <option value={6}>Level 6 (Default)</option>
                                                    <option value={9}>Level 9 (Best Compression)</option>
                                                </select>
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Allowed Formats
                                                </label>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {['txt', 'json', 'zip', 'bin'].map(format => (
                                                        <label key={format} className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.allowedFormats.includes(format)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        handleInputChange('allowedFormats', [...formData.allowedFormats, format]);
                                                                    } else {
                                                                        handleInputChange('allowedFormats', formData.allowedFormats.filter(f => f !== format));
                                                                    }
                                                                }}
                                                                className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-teal-600 focus:ring-teal-500 mr-2"
                                                            />
                                                            <span className="text-sm text-gray-700 dark:text-gray-300 uppercase">{format}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'storage' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                                <ServerStackIcon className="w-6 h-6 text-blue-600 mr-2" />
                                                Storage Settings
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Max Storage Size (GB)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.maxStorageSize}
                                                    onChange={(e) => handleInputChange('maxStorageSize', Number(e.target.value))}
                                                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                                                        <ChartBarIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                                                        Storage Usage
                                                    </h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">Used:</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{diskSpace.used}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">Available:</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{diskSpace.available}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">Total:</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{diskSpace.total}</span>
                                                        </div>
                                                        <div className="mt-3">
                                                            <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                                                <div className="bg-gradient-to-r from-teal-500 to-cyan-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                                                            </div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">45% used</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                                <ShieldCheckIcon className="w-6 h-6 text-purple-600 mr-2" />
                                                Security Settings
                                            </h3>
                                        </div>

                                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                            <div className="flex items-center mb-2">
                                                <ShieldCheckIcon className="w-5 h-5 text-purple-600 mr-2" />
                                                <span className="text-sm font-medium text-purple-900">Security Features</span>
                                            </div>
                                            <ul className="text-sm text-purple-800 space-y-1">
                                                <li>• File type validation aktif</li>
                                                <li>• CSRF protection enabled</li>
                                                <li>• Rate limiting configured</li>
                                                <li>• Secure file storage</li>
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* Save Button */}
                                <div className="flex justify-end pt-6 border-t border-gray-200">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-8 py-3 rounded-lg font-medium hover:from-teal-600 hover:to-cyan-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {saving ? (
                                            <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        ) : (
                                            <CogIcon className="w-5 h-5" />
                                        )}
                                        {saving ? 'Saving...' : 'Save Settings'}
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminSettings;