import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/theme-toggle';
import {
    HomeIcon,
    ClockIcon,
    FolderIcon,
    Cog6ToothIcon,
    ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

interface AdminHeaderProps {
    currentPage?: 'dashboard' | 'history' | 'files' | 'settings';
    user?: {
        name: string;
        email: string;
        role: string;
    };
}

export default function AdminHeader({ currentPage = 'dashboard', user }: AdminHeaderProps) {
    const adminNavigationItems = [
        {
            name: 'Dashboard',
            href: '/admin',
            icon: HomeIcon,
            key: 'dashboard',
        },
        {
            name: 'Riwayat Kompresi',
            href: '/admin/history',
            icon: ClockIcon,
            key: 'history',
        },
        {
            name: 'Kelola File',
            href: '/admin/files',
            icon: FolderIcon,
            key: 'files',
        },
        {
            name: 'Pengaturan',
            href: '/admin/settings',
            icon: Cog6ToothIcon,
            key: 'settings',
        },
    ];

    return (
        <header className="bg-white dark:bg-gray-900 shadow-lg border-b border-teal-100 dark:border-teal-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left side - Logo */}
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/admin"
                            className="flex items-center space-x-3 group"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-200">
                                A
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                                Admin Panel
                            </h1>
                        </Link>
                    </div>

                    {/* Center - Navigation (hidden on mobile) */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {adminNavigationItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentPage === item.key;
                            
                            return (
                                <Link
                                    key={item.key}
                                    href={item.href}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700 shadow-sm'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-teal-600 dark:hover:text-teal-400'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right side - User menu and theme toggle */}
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />

                        {/* User Menu */}
                        <div className="relative">
                            <div className="flex items-center space-x-3">
                                <div className="text-right hidden md:block">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'Admin'}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{user?.role || 'Administrator'}</div>
                                </div>
                                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-sm font-medium text-white">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <Link
                            href="/admin/logout"
                            method="post"
                            as="button"
                            className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                        >
                            <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </Link>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <nav className="flex flex-wrap gap-2">
                        {adminNavigationItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentPage === item.key;

                            return (
                                <Link
                                    key={item.key}
                                    href={item.href}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700 shadow-sm'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-teal-600 dark:hover:text-teal-400'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </header>
    );
}