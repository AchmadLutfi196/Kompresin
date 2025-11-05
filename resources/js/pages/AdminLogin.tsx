import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    EyeIcon,
    EyeSlashIcon,
    ShieldCheckIcon,
    UserIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';
import { SweetAlert } from '@/utils/sweetAlert';

export default function AdminLogin() {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!data.email || !data.password) {
            SweetAlert.warning('Data Belum Lengkap', 'Silakan isi email dan password');
            return;
        }

        SweetAlert.loading('Memverifikasi Admin', 'Sedang memeriksa kredensial...');
        
        post('/admin/login', {
            onSuccess: () => {
                SweetAlert.close();
                SweetAlert.toast.success('Login berhasil! Selamat datang di panel admin');
            },
            onError: (errors) => {
                SweetAlert.close();
                if (errors.email || errors.password) {
                    SweetAlert.error('Login Gagal', 'Email atau password tidak valid');
                } else {
                    SweetAlert.error('Login Gagal', 'Terjadi kesalahan saat login');
                }
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
            <Head title="Admin Login" />
            
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 w-full max-w-md shadow-2xl"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg"
                    >
                        <ShieldCheckIcon className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold text-white mb-2"
                    >
                        Admin Panel
                    </motion.h1>
                    
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-blue-200"
                    >
                        Masuk untuk mengakses dashboard admin
                    </motion.p>
                </div>

                {/* Login Form */}
                <form onSubmit={submit} className="space-y-6">
                    {/* Email Field */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <label className="block text-sm font-medium text-blue-200 mb-2">
                            Email Admin
                        </label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="admin@kompresin.com"
                                className={`w-full pl-10 pr-4 py-3 bg-white/10 border ${
                                    errors.email ? 'border-red-400' : 'border-white/30'
                                } rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all duration-200`}
                                required
                            />
                        </div>
                        {errors.email && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 text-sm mt-1"
                            >
                                {errors.email}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Password Field */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <label className="block text-sm font-medium text-blue-200 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Masukkan password admin"
                                className={`w-full pl-10 pr-12 py-3 bg-white/10 border ${
                                    errors.password ? 'border-red-400' : 'border-white/30'
                                } rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all duration-200`}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors duration-200"
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="w-5 h-5" />
                                ) : (
                                    <EyeIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 text-sm mt-1"
                            >
                                {errors.password}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={processing}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {processing ? (
                            <>
                                <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                <span>Masuk...</span>
                            </>
                        ) : (
                            <>
                                <ShieldCheckIcon className="w-5 h-5" />
                                <span>Masuk ke Admin Panel</span>
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center mt-8"
                >
                    <p className="text-blue-300 text-sm">
                        Hanya admin yang dapat mengakses halaman ini
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="text-blue-400 hover:text-white text-sm mt-2 transition-colors duration-200"
                    >
                        ← Kembali ke Beranda
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
}