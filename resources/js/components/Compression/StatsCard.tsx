interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal' | 'cyan';
}

export default function StatsCard({ title, value, subtitle, icon, color = 'blue' }: StatsCardProps) {
    const colorClasses = {
        blue: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-300 dark:border-blue-700 shadow-lg shadow-blue-100/50 dark:shadow-blue-900/20',
        green: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-300 dark:border-green-700 shadow-lg shadow-green-100/50 dark:shadow-green-900/20',
        purple: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-300 dark:border-purple-700 shadow-lg shadow-purple-100/50 dark:shadow-purple-900/20',
        orange: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-300 dark:border-orange-700 shadow-lg shadow-orange-100/50 dark:shadow-orange-900/20',
        red: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-300 dark:border-red-700 shadow-lg shadow-red-100/50 dark:shadow-red-900/20',
        teal: 'bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-800/20 border-teal-300 dark:border-teal-700 shadow-lg shadow-teal-100/50 dark:shadow-teal-900/20',
        cyan: 'bg-gradient-to-br from-cyan-50 to-teal-100 dark:from-cyan-900/20 dark:to-teal-800/20 border-cyan-300 dark:border-cyan-700 shadow-lg shadow-cyan-100/50 dark:shadow-cyan-900/20',
    };

    const textColorClasses = {
        blue: 'text-blue-700 dark:text-blue-300',
        green: 'text-green-700 dark:text-green-300',
        purple: 'text-purple-700 dark:text-purple-300',
        orange: 'text-orange-700 dark:text-orange-300',
        red: 'text-red-700 dark:text-red-300',
        teal: 'text-teal-700 dark:text-teal-300',
        cyan: 'text-cyan-700 dark:text-cyan-300',
    };

    const iconBgClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
        orange: 'bg-orange-500',
        red: 'bg-red-500',
        teal: 'bg-gradient-to-br from-teal-500 to-cyan-600',
        cyan: 'bg-gradient-to-br from-cyan-500 to-teal-600',
    };

    return (
        <div className={`${colorClasses[color]} border-2 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                        {title}
                    </p>
                    <p className={`text-4xl font-extrabold ${textColorClasses[color]} mb-1`}>
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium">
                            {subtitle}
                        </p>
                    )}
                </div>
                {icon && (
                    <div className={`${iconBgClasses[color]} p-3 rounded-xl shadow-md text-white text-2xl`}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
