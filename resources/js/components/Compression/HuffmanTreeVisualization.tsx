import { useEffect, useRef } from 'react';

interface HuffmanTreeNode {
    symbol: number | null;
    frequency: number;
    left?: HuffmanTreeNode;
    right?: HuffmanTreeNode;
}

interface HuffmanTreeVisualizationProps {
    tree: HuffmanTreeNode;
}

export default function HuffmanTreeVisualization({ tree }: HuffmanTreeVisualizationProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !tree) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = 500;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Check for dark mode
        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#e5e7eb' : '#1f2937';
        const lineColor = isDark ? '#4b5563' : '#9ca3af';
        const nodeColor = isDark ? '#374151' : '#f3f4f6';
        const leafColor = isDark ? '#1e40af' : '#3b82f6';

        // Calculate tree depth
        const getDepth = (node: HuffmanTreeNode | undefined): number => {
            if (!node) return 0;
            return 1 + Math.max(getDepth(node.left), getDepth(node.right));
        };

        const depth = getDepth(tree);
        const levelHeight = canvas.height / (depth + 1);

        // Draw tree recursively
        const drawNode = (
            node: HuffmanTreeNode,
            x: number,
            y: number,
            level: number,
            horizontalSpacing: number
        ) => {
            const nodeRadius = 25;

            // Draw lines to children first (so they appear behind nodes)
            if (node.left) {
                const childX = x - horizontalSpacing;
                const childY = y + levelHeight;
                
                ctx.strokeStyle = lineColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x, y + nodeRadius);
                ctx.lineTo(childX, childY - nodeRadius);
                ctx.stroke();

                // Draw "0" label
                ctx.fillStyle = textColor;
                ctx.font = '12px sans-serif';
                ctx.fillText('0', (x + childX) / 2 - 5, (y + childY) / 2);

                drawNode(node.left, childX, childY, level + 1, horizontalSpacing / 2);
            }

            if (node.right) {
                const childX = x + horizontalSpacing;
                const childY = y + levelHeight;
                
                ctx.strokeStyle = lineColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x, y + nodeRadius);
                ctx.lineTo(childX, childY - nodeRadius);
                ctx.stroke();

                // Draw "1" label
                ctx.fillStyle = textColor;
                ctx.font = '12px sans-serif';
                ctx.fillText('1', (x + childX) / 2 + 5, (y + childY) / 2);

                drawNode(node.right, childX, childY, level + 1, horizontalSpacing / 2);
            }

            // Draw node circle
            const isLeaf = !node.left && !node.right;
            ctx.fillStyle = isLeaf ? leafColor : nodeColor;
            ctx.beginPath();
            ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw node text
            ctx.fillStyle = isLeaf ? '#ffffff' : textColor;
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            if (isLeaf && node.symbol !== null) {
                // Show symbol (character or ASCII value)
                const symbol = node.symbol < 32 || node.symbol > 126 
                    ? node.symbol.toString() 
                    : String.fromCharCode(node.symbol);
                ctx.fillText(symbol, x, y - 5);
                ctx.font = '10px sans-serif';
                ctx.fillText(`(${node.frequency})`, x, y + 8);
            } else {
                ctx.fillText(node.frequency.toString(), x, y);
            }
        };

        // Start drawing from root
        const initialSpacing = canvas.width / 4;
        drawNode(tree, canvas.width / 2, 40, 0, initialSpacing);

    }, [tree]);

    if (!tree) {
        return (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                    Tidak ada pohon Huffman untuk divisualisasikan
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Pohon Huffman
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="w-full"
                    style={{ height: '500px' }}
                />
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-2">
                    <strong>Cara membaca:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Node biru adalah node daun (mewakili simbol)</li>
                    <li>Angka dalam node menunjukkan frekuensi</li>
                    <li>Jalur ke kiri diberi label "0", ke kanan "1"</li>
                    <li>Gabungan label dari root ke leaf membentuk kode Huffman</li>
                </ul>
            </div>
        </div>
    );
}
