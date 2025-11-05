import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
    HomeIcon, 
    DocumentArrowDownIcon, 
    DocumentArrowUpIcon, 
    ClockIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface AppHeaderProps {
    currentPage?: 'home' | 'compress' | 'decompress' | 'history' | 'admin';
    showBackButton?: boolean;
    user?: {
        name: string;
        email: string;
        role: string;
    };
}

export default function AppHeader({ currentPage = 'home', showBackButton = false, user }: AppHeaderProps) {
    const navigationItems = [
        {
            name: 'Beranda',
            href: '/',
            icon: HomeIcon,
            key: 'home',
        },
        {
            name: 'Kompresi',
            href: '/compress',
            icon: DocumentArrowDownIcon,
            key: 'compress',
        },
        {
            name: 'Dekompresi',
            href: '/decompress',
            icon: DocumentArrowUpIcon,
            key: 'decompress',
        },
        {
            name: 'Riwayat',
            href: '/history',
            icon: ClockIcon,
            key: 'history',
        },
        {
            name: 'Admin',
            href: '/admin',
            icon: CpuChipIcon,
            key: 'admin',
        },
    ];

    return (
        <header className="bg-white dark:bg-gray-900 shadow-lg border-b border-teal-100 dark:border-teal-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left side - Logo/Back button */}
                    <div className="flex items-center space-x-4">
                        {showBackButton ? (
                            <Link 
                                href="/" 
                                className="flex items-center text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors duration-200"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Kembali
                            </Link>
                        ) : (
                            <Link 
                                href="/" 
                                className="flex items-center space-x-3 group"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-200">
                                    K
                                </div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                                    Kompresin
                                </h1>
                            </Link>
                        )}
                    </div>

                    {/* Center - Navigation (hidden on mobile) */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navigationItems.filter(item => {
                            // Hide admin menu for non-admin users
                            if (item.key === 'admin' && (!user || user.role !== 'admin')) {
                                return false;
                            }
                            return true;
                        }).map((item) => {
                            const Icon = item.icon;
                            const isActive = currentPage === item.key;
                            
                            return (
                                <Link
                                    key={item.key}
                                    href={item.href}
                                    className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/30'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.name}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-lg border border-teal-200 dark:border-teal-800"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right side - Theme toggle and mobile menu */}
                    <div className="flex items-center space-x-2">
                        <ThemeToggle />
                        
                        {/* Mobile navigation button */}
                        <div className="md:hidden">
                            <select 
                                onChange={(e) => window.location.href = e.target.value}
                                value={navigationItems.find(item => item.key === currentPage)?.href || '/'}
                                className="text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            >
                                {navigationItems.map((item) => (
                                    <option key={item.key} value={item.href}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}