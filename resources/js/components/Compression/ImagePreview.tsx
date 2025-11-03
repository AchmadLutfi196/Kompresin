interface ImagePreviewProps {
    src: string;
    alt: string;
    title?: string;
    subtitle?: string;
}

export default function ImagePreview({ src, alt, title, subtitle }: ImagePreviewProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            {title && (
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {title}
                </h3>
            )}
            {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {subtitle}
                </p>
            )}
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center p-4">
                <img
                    src={src}
                    alt={alt}
                    className="max-w-full h-auto max-h-96 object-contain"
                />
            </div>
        </div>
    );
}
