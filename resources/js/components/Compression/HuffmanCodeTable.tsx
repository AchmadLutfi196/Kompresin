interface HuffmanCodeTableProps {
    codes: Array<{
        symbol: number;
        frequency: number;
        code: string;
        bits: number;
    }>;
}

export default function HuffmanCodeTable({ codes }: HuffmanCodeTableProps) {
    if (!codes || codes.length === 0) {
        return (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                    Tidak ada tabel kode Huffman
                </p>
            </div>
        );
    }

    // Show only top 20 most frequent symbols
    const displayCodes = codes.slice(0, 20);
    const hasMore = codes.length > 20;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Tabel Kode Huffman
            </h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Simbol
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                ASCII
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Frekuensi
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Kode Biner
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Panjang
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {displayCodes.map((item, index) => {
                            const displaySymbol = item.symbol < 32 || item.symbol > 126 
                                ? `[${item.symbol}]` 
                                : String.fromCharCode(item.symbol);
                            
                            return (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                                        {displaySymbol}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        {item.symbol}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        {item.frequency.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-mono text-blue-600 dark:text-blue-400">
                                        {item.code}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                        {item.bits} bit{item.bits !== 1 ? 's' : ''}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {hasMore && (
                <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Menampilkan 20 simbol teratas dari {codes.length} simbol total
                </div>
            )}
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Catatan:</strong> Simbol dengan frekuensi tinggi mendapat kode lebih pendek, 
                    menghasilkan kompresi yang lebih efisien.
                </p>
            </div>
        </div>
    );
}
