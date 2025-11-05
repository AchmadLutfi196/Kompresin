import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminHeader from '../../components/AdminHeader';
import { motion } from 'framer-motion';
import {
    TrashIcon,
    ShieldCheckIcon,
    FolderIcon,
    DocumentIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    ServerStackIcon
} from '@heroicons/react/24/outline';
import { SweetAlert } from '../../utils/sweetAlert';

interface FileItem {
    name: string;
    size: number;
    modified: string;
    type: 'file' | 'directory';
    path: string;
}

interface AdminFilesProps {
    files: FileItem[];
    storageUsed: string;
    totalFiles: number;
    deletedFiles?: number;
    freedSpace?: string;
    message?: string;
    user?: {
        name: string;
        email: string;
        role: string;
    };
}

const AdminFiles: React.FC<AdminFilesProps> = ({ files, storageUsed, totalFiles, deletedFiles, freedSpace, message, user }) => {
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [cleanupDays, setCleanupDays] = useState(30);

    // ReactBits-style animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.1,
                staggerChildren: 0.05
            }
        }
    };

    const cardVariants = {
        hidden: { 
            opacity: 0, 
            y: 20,
            scale: 0.95
        },
        visible: { 
            opacity: 1, 
            y: 0,
            scale: 1
        }
    };

    // Show success message if cleanup was just completed
    useEffect(() => {
        if (message && deletedFiles !== undefined) {
            SweetAlert.success(
                'Cleanup Berhasil!',
                `${deletedFiles} file berhasil dihapus. Ruang yang dibebaskan: ${freedSpace || '0 KB'}`
            );
        }
    }, [message, deletedFiles, freedSpace]);

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

    const getFileIcon = (fileName: string, type: string) => {
        if (type === 'directory') return FolderIcon;
        return DocumentIcon;
    };

    const handleFileSelect = (filePath: string) => {
        setSelectedFiles(prev => 
            prev.includes(filePath) 
                ? prev.filter(f => f !== filePath)
                : [...prev, filePath]
        );
    };

    const handleSelectAll = () => {
        if (selectedFiles.length === files.length) {
            setSelectedFiles([]);
        } else {
            setSelectedFiles(files.map(f => f.path));
        }
    };

    const showPrivacyInfo = (filename: string) => {
        // Privacy protection indicator - no action needed
    };

    const handleCleanup = async () => {
        const result = await SweetAlert.confirm(
            'Jalankan Cleanup File?',
            `File yang lebih dari ${cleanupDays} hari akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`,
            'Ya, Jalankan Cleanup',
            'Batal'
        );

        if (!result.isConfirmed) return;
        
        setLoading(true);
        SweetAlert.loading('Menjalankan Cleanup', `Sedang menghapus file yang lebih dari ${cleanupDays} hari...`);
        
        try {
            router.post('/admin/cleanup',
                { days: cleanupDays },
                {
                    onSuccess: (page) => {
                        SweetAlert.close();

                        // Check if response has cleanup results
                        const props = page.props as any;
                        const deletedCount = props.deletedFiles || 0;
                        const freedSpaceResult = props.freedSpace || '0 KB';

                        SweetAlert.success(
                            'Cleanup Berhasil!',
                            `${deletedCount} file berhasil dihapus. Ruang yang dibebaskan: ${freedSpaceResult}`
                        );
                        
                        // Inertia will update the page props; no explicit reload required
                    },
                    onError: (errors) => {
                        SweetAlert.close();
                        console.error('Cleanup errors:', errors);
                        SweetAlert.error(
                            'Cleanup Gagal',
                            'Terjadi kesalahan saat menjalankan cleanup. Silakan coba lagi.'
                        );
                    },
                    onFinish: () => {
                        setLoading(false);
                    }
                }
            );
        } catch (error) {
            console.error('Cleanup error:', error);
            SweetAlert.close();
            SweetAlert.error(
                'Kesalahan Sistem',
                'Terjadi kesalahan tidak terduga saat cleanup'
            );
            setLoading(false);
        }

    };

    const getFileAge = (dateString: string): number => {
        const fileDate = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - fileDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
            <Head title="Admin File Management" />
            <AdminHeader currentPage="files" user={user} />

            <motion.div 
                className="p-6 pt-24"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="mb-8">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                    >
                        Kelola File
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600 dark:text-gray-400"
                    >
                        Kelola file storage dan lakukan cleanup otomatis
                    </motion.p>
                </div>

                {/* Storage Stats */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                >
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
                        <div className="flex items-center">
                            <ServerStackIcon className="w-8 h-8 text-teal-600 dark:text-teal-400 mr-4" />
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Storage Terpakai</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{storageUsed}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
                        <div className="flex items-center">
                            <DocumentIcon className="w-8 h-8 text-cyan-600 dark:text-cyan-400 mr-4" />
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total File</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalFiles}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
                        <div className="flex items-center">
                            <FolderIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-4" />
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">File Terpilih</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedFiles.length}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Cleanup Tool */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8"
                >
                    <div className="flex items-center mb-4">
                        <ExclamationTriangleIcon className="w-6 h-6 text-orange-500 dark:text-orange-400 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Cleanup Otomatis</h2>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <ClockIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Hapus file lebih dari:
                            </label>
                            <select
                                value={cleanupDays}
                                onChange={(e) => setCleanupDays(Number(e.target.value))}
                                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            >
                                <option value={7}>7 hari</option>
                                <option value={30}>30 hari</option>
                                <option value={60}>60 hari</option>
                                <option value={90}>90 hari</option>
                            </select>
                        </div>
                        
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleCleanup}
                            disabled={loading}
                            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            ) : (
                                <TrashIcon className="w-5 h-5" />
                            )}
                            {loading ? 'Processing...' : 'Jalankan Cleanup'}
                        </motion.button>
                    </div>
                </motion.div>

                {/* File List */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
                >
                    <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-700/50">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">File Storage</h3>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedFiles.length === files.length && files.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300 dark:border-gray-600 text-teal-600 focus:ring-teal-500 bg-white dark:bg-gray-700"
                                    />
                                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Pilih Semua</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <input type="checkbox" className="opacity-0" />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama File</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Modified</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Age</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {files.length > 0 ? (
                                    files.map((file, index) => {
                                        const FileIcon = getFileIcon(file.name, file.type);
                                        const age = getFileAge(file.modified);
                                        const isOld = age > cleanupDays;
                                        
                                        return (
                                            <motion.tr
                                                key={file.path}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 * index }}
                                                className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${isOld ? 'bg-orange-50 dark:bg-orange-900/20' : ''}`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedFiles.includes(file.path)}
                                                        onChange={() => handleFileSelect(file.path)}
                                                        className="rounded border-gray-300 dark:border-gray-600 text-teal-600 focus:ring-teal-500 bg-white dark:bg-gray-700"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <FileIcon className={`w-5 h-5 mr-3 ${file.type === 'directory' ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {file.type === 'file' ? formatFileSize(file.size) : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {formatDate(file.modified)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        isOld 
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {age} hari
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {file.type === 'file' && (
                                                        <div className="flex space-x-2">
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => showPrivacyInfo(file.name)}
                                                                className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300 p-1 rounded-full hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors duration-150"
                                                                title="File diproteksi untuk privasi pengguna"
                                                            >
                                                                <ShieldCheckIcon className="w-5 h-5" />
                                                            </motion.button>
                                                        </div>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500 text-lg">Tidak ada file ditemukan</p>
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

export default AdminFiles;