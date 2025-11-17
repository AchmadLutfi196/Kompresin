<?php

namespace App\Http\Controllers;

use App\Models\CompressionHistory;
use App\Services\HuffmanCompressionService;
use App\Services\FileEncryptionService;
use App\Traits\HandlesDiskPaths;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CompressionController extends Controller
{
    use HandlesDiskPaths;
    
    protected $huffmanService;
    protected $encryptionService;

    public function __construct(HuffmanCompressionService $huffmanService, FileEncryptionService $encryptionService)
    {
        $this->huffmanService = $huffmanService;
        $this->encryptionService = $encryptionService;
    }

    /**
     * Show compression page
     */
    public function index()
    {
        return Inertia::render('Compression/Index');
    }

    /**
     * Show decompression page
     */
    public function decompressPage()
    {
        return Inertia::render('Decompression/Index');
    }

    /**
     * Show history page
     */
    public function history()
    {
        $query = CompressionHistory::query();
        
        // If user is not admin, only show their own histories
        if (!Auth::user() || Auth::user()->role !== 'admin') {
            $query->where('user_id', Auth::id());
        }
        
        $histories = $query->with('user')->latest()->paginate(20);
        
        return Inertia::render('History/Index', [
            'histories' => $histories,
        ]);
    }

    /**
     * Compress image
     */
    public function compress(Request $request)
    {
        // Debug log
        Log::info('Compression request received', [
            'format' => $request->input('format'),
            'has_image' => $request->hasFile('image'),
            'image_size' => $request->hasFile('image') ? $request->file('image')->getSize() : 'no file'
        ]);

        $request->validate([
            'image' => 'required|image|mimes:jpeg,jpg,png,bmp|max:20480', // max 20MB
            'format' => 'nullable|string|in:json,zip,bin,jpg', // format pilihan user (txt removed, jpg added)
        ]);

        try {
            // Store uploaded image
            $image = $request->file('image');
            $originalFilename = $image->getClientOriginalName();
            
            // Check image dimensions before processing
            list($width, $height) = getimagesize($image->getPathname());
            $totalPixels = $width * $height;
            
            if ($totalPixels > 100000000) { // 100 megapixels
                return response()->json([
                    'success' => false,
                    'message' => "Gambar terlalu besar! Maksimum 100 megapixels. Gambar Anda: {$width}x{$height} = " . number_format($totalPixels) . " pixels. Coba resize gambar terlebih dahulu.",
                ], 422);
            }
            
            // Create directory if not exists (use public disk explicitly)
            Storage::disk('public')->makeDirectory('originals');
            
            $originalPath = $image->storeAs('originals', time() . '_' . $originalFilename, 'public');
            // Add public/ prefix to path for consistency with other file paths
            $originalPath = 'public/' . $originalPath;
            
            // Verify file exists using correct disk
            if (!$this->fileExistsOnCorrectDisk($originalPath)) {
                throw new \Exception('Failed to store uploaded file: ' . $originalPath);
            }
            
            // Get full path using correct disk
            $fullPath = $this->getFullPathOnCorrectDisk($originalPath);
            
            // Verify physical file exists
            if (!file_exists($fullPath)) {
                throw new \Exception('File stored but not found at: ' . $fullPath);
            }
            
            // Encrypt the uploaded file for user privacy (only for authenticated users)
            if (Auth::id()) {
                $this->encryptionService->encryptFile($originalPath, Auth::id());
            }

            // Get ACTUAL file size of uploaded JPG/PNG
            $originalFileSize = filesize($fullPath);

            // Compress image
            try {
                $compressionResult = $this->huffmanService->compress($fullPath);
            } catch (\Exception $e) {
                Log::error('Compression service error', [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString(),
                ]);
                throw $e;
            }

            // Save compressed file
            $format = $request->input('format', 'bin'); // Default to bin (most efficient)
            $compressedFile = $this->huffmanService->saveCompressedFile(
                $compressionResult['encoded_data'],
                [
                    'huffman_tree' => $compressionResult['huffman_tree'] ?? null,
                    'huffman_codes' => $compressionResult['huffman_codes'] ?? [],
                    'width' => $compressionResult['width'],
                    'height' => $compressionResult['height'],
                    'type' => $compressionResult['type'],
                    'algorithm' => $compressionResult['algorithm'] ?? 'DEFLATE',
                    'original_image_path' => $fullPath, // Add original image path for JPG format
                ],
                $format // Pass format parameter
            );
            
            // Encrypt the compressed file for user privacy (only for authenticated users)
            if (Auth::id()) {
                $this->encryptionService->encryptFile($compressedFile['path'], Auth::id());
            }

            // Get Huffman codes for visualization
            $huffmanCodesVisualization = $this->huffmanService->getHuffmanCodesForVisualization();

            // Calculate compression metrics
            // Compare with actual file size (JPG/PNG original file)
            $pixelDataSize = $compressionResult['original_size']; // Grayscale pixel data
            $binaryFileSize = $compressedFile['size']; // .bin file with header
            
            // Compression ratio based on pixel data (theoretical)
            $pixelCompressionRatio = (1 - ($binaryFileSize / $pixelDataSize)) * 100;
            
            // Real file comparison (JPG/PNG → .bin)
            $fileCompressionRatio = (1 - ($binaryFileSize / $originalFileSize)) * 100;

            // Save to history
            $history = CompressionHistory::create([
                'user_id' => Auth::id(), // null for guest users
                'type' => 'compress',
                'filename' => $originalFilename,
                'original_path' => $originalPath,
                'compressed_path' => $compressedFile['path'],
                'original_size' => $pixelDataSize, // Pixel data size for algorithm analysis
                'compressed_size' => $binaryFileSize,
                'compression_ratio' => $pixelCompressionRatio, // Theoretical compression
                'bits_per_pixel' => $compressionResult['bits_per_pixel'],
                'entropy' => $compressionResult['entropy'],
                'huffman_table' => $compressionResult['huffman_codes'],
                'image_width' => $compressionResult['width'],
                'image_height' => $compressionResult['height'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Image compressed successfully',
                'data' => [
                    'original_size' => $pixelDataSize,
                    'compressed_size' => $binaryFileSize,
                    'compression_ratio' => round($pixelCompressionRatio, 2),
                    'original_file_size' => $originalFileSize, // Actual JPG/PNG file size
                    'file_compression_ratio' => round($fileCompressionRatio, 2), // Real file comparison
                    'bits_per_pixel' => round($compressionResult['bits_per_pixel'], 4),
                    'entropy' => round($compressionResult['entropy'], 4),
                    'width' => $compressionResult['width'],
                    'height' => $compressionResult['height'],
                    'compressed_file_url' => route('secure.compressed', $history->id),
                    'compressed_filename' => $compressedFile['filename'],
                    'algorithm' => $compressionResult['algorithm'] ?? 'DEFLATE (LZ77 + Huffman)',
                    'compression_time' => round($compressionResult['compression_time'] ?? 0, 3),
                    'original_image_url' => route('secure.original', $history->id),
                    'huffman_tree' => $compressionResult['huffman_tree'],
                    'huffman_codes' => $huffmanCodesVisualization,
                    'history_id' => $history->id,
                ],
            ]);

        } catch (\Exception $e) {
            // Log error for debugging
            Log::error('Compression error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Compression failed: ' . $e->getMessage(),
                'error' => config('app.debug') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ] : null,
            ], 500);
        }
    }

    /**
     * Decompress image
     */
    public function decompress(Request $request)
    {
        $request->validate([
            'compressed_file' => 'required|file|max:10240',
        ]);

        try {
            // Store uploaded compressed file
            $file = $request->file('compressed_file');
            $filename = $file->getClientOriginalName();
            $path = $file->storeAs('public/compressed', time() . '_' . $filename);

            // Encrypt the uploaded compressed file for user privacy (only for authenticated users)
            if (Auth::id()) {
                $this->encryptionService->encryptFile($path, Auth::id());
            }

            // Load compressed data (decrypt if needed)
            $compressedData = $this->loadCompressedFileSecurely($path, Auth::id() ?? 0);

            if (!isset($compressedData['metadata']) || !isset($compressedData['encoded_data'])) {
                throw new \Exception('Invalid compressed file format');
            }

            $metadata = $compressedData['metadata'];
            $encodedData = $compressedData['encoded_data'];

            // Decompress
            $decompressedImage = $this->huffmanService->decompress(
                $encodedData,
                $metadata['huffman_tree'],
                $metadata['width'],
                $metadata['height'],
                $metadata['type'],
                $metadata['algorithm'] ?? 'DEFLATE'
            );
            
            // Encrypt the decompressed image for user privacy (only for authenticated users)
            if (Auth::id()) {
                $this->encryptionService->encryptFile($decompressedImage['path'], Auth::id());
            }

            // Calculate file sizes
            // For compressed file, try public disk first
            if (Storage::disk('public')->exists($path)) {
                $compressedSize = Storage::disk('public')->size($path);
            } else {
                $compressedSize = Storage::size($path);
            }
            
            // For decompressed file, extract path from the return value
            $decompressedPath = str_replace('public/', '', $decompressedImage['path']);
            $decompressedSize = Storage::disk('public')->size($decompressedPath);

            // Save to history
            $history = CompressionHistory::create([
                'user_id' => Auth::id(), // null for guest users
                'type' => 'decompress',
                'filename' => $filename,
                'compressed_path' => $path,
                'decompressed_path' => $decompressedImage['path'],
                'original_size' => $decompressedSize,
                'compressed_size' => $compressedSize,
                'compression_ratio' => (1 - ($compressedSize / $decompressedSize)) * 100,
                'image_width' => $metadata['width'],
                'image_height' => $metadata['height'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Image decompressed successfully',
                'data' => [
                    'decompressed_image_url' => route('secure.decompressed', $history->id),
                    'decompressed_filename' => $decompressedImage['filename'],
                    'decompression_time' => round($decompressedImage['decompression_time'] ?? 0, 3),
                    'width' => $metadata['width'],
                    'height' => $metadata['height'],
                    'compressed_size' => $compressedSize,
                    'decompressed_size' => $decompressedSize,
                    'history_id' => $history->id,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Decompression failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete history record
     */
    public function deleteHistory($id)
    {
        try {
            $query = CompressionHistory::where('id', $id);
            
            // If user is not admin, only allow deleting their own history
            if (!Auth::user() || Auth::user()->role !== 'admin') {
                $query->where('user_id', Auth::id());
            }
            
            $history = $query->firstOrFail();

            // Delete associated files using correct disk logic
            if ($history->original_path && $this->fileExistsOnCorrectDisk($history->original_path)) {
                $this->deleteFileOnCorrectDisk($history->original_path);
            }
            if ($history->compressed_path && $this->fileExistsOnCorrectDisk($history->compressed_path)) {
                $this->deleteFileOnCorrectDisk($history->compressed_path);
            }
            if ($history->decompressed_path && $this->fileExistsOnCorrectDisk($history->decompressed_path)) {
                $this->deleteFileOnCorrectDisk($history->decompressed_path);
            }

            $history->delete();

            return response()->json([
                'success' => true,
                'message' => 'History deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete history: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get comparison with standard compression
     */
    public function getComparison(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,jpg,png|max:10240',
        ]);

        try {
            $image = $request->file('image');
            $originalSize = $image->getSize();

            // Save as JPEG
            $jpegPath = $image->storeAs('public/temp', 'temp_jpeg_' . time() . '.jpg');
            $jpegSize = Storage::size($jpegPath);
            $jpegRatio = (1 - ($jpegSize / $originalSize)) * 100;

            // Save as PNG
            $pngPath = $image->storeAs('public/temp', 'temp_png_' . time() . '.png');
            $pngSize = Storage::size($pngPath);
            $pngRatio = (1 - ($pngSize / $originalSize)) * 100;

            // Clean up temp files
            Storage::delete([$jpegPath, $pngPath]);

            return response()->json([
                'success' => true,
                'data' => [
                    'jpeg' => [
                        'size' => $jpegSize,
                        'ratio' => round($jpegRatio, 2),
                    ],
                    'png' => [
                        'size' => $pngSize,
                        'ratio' => round($pngRatio, 2),
                    ],
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Comparison failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Serve original file securely (encrypted)
     */
    public function serveOriginalFile($id)
    {
        $history = CompressionHistory::findOrFail($id);
        
        // Check authorization - user can only access their own files
        if (Auth::id() !== $history->user_id && (!Auth::user() || Auth::user()->role !== 'admin')) {
            abort(403, 'Unauthorized access');
        }
        
        // Admin can only see metadata, not content
        if (Auth::user() && Auth::user()->role === 'admin' && Auth::id() !== $history->user_id) {
            return $this->encryptionService->getFileInfoForAdmin($history->original_path);
        }
        
        // User can access their own files - decrypt and serve
        $tempFile = $this->encryptionService->decryptFileForServing($history->original_path, $history->user_id);
        
        if (!$tempFile) {
            abort(404, 'File not found or decryption failed');
        }
        
        return response()->file($tempFile, [
            'Content-Disposition' => 'inline; filename="' . $history->filename . '"'
        ])->deleteFileAfterSend(true);
    }

    /**
     * Serve compressed file securely
     */
    public function serveCompressedFile($id)
    {
        $history = CompressionHistory::findOrFail($id);
        
        // Check authorization
        if (Auth::id() !== $history->user_id && (!Auth::user() || Auth::user()->role !== 'admin')) {
            abort(403, 'Unauthorized access');
        }
        
        // Admin can only see metadata for user files
        if (Auth::user() && Auth::user()->role === 'admin' && Auth::id() !== $history->user_id) {
            return $this->encryptionService->getFileInfoForAdmin($history->compressed_path);
        }
        
        // Check if file is encrypted
        if ($this->encryptionService->isEncrypted($history->compressed_path)) {
            $tempFile = $this->encryptionService->decryptFileForServing($history->compressed_path, $history->user_id);
            
            if (!$tempFile) {
                abort(404, 'File not found or decryption failed');
            }
            
            $filename = pathinfo($history->compressed_path, PATHINFO_BASENAME);
            return response()->file($tempFile, [
                'Content-Disposition' => 'attachment; filename="' . $filename . '"'
            ])->deleteFileAfterSend(true);
        }
        
        // Legacy: serve unencrypted file directly
        $fullPath = $this->getFullPathOnCorrectDisk($history->compressed_path);
        if (!file_exists($fullPath)) {
            abort(404, 'File not found');
        }
        
        return response()->file($fullPath);
    }

    /**
     * Serve decompressed file securely
     */
    public function serveDecompressedFile($id)
    {
        $history = CompressionHistory::findOrFail($id);
        
        // Check authorization
        if (Auth::id() !== $history->user_id && (!Auth::user() || Auth::user()->role !== 'admin')) {
            abort(403, 'Unauthorized access');
        }
        
        // Admin can only see metadata
        if (Auth::user() && Auth::user()->role === 'admin' && Auth::id() !== $history->user_id) {
            return response()->json([
                'type' => 'decompressed_file',
                'filename' => 'decompressed_' . $history->filename,
                'access' => 'restricted_admin',
                'message' => 'Content access restricted for privacy'
            ]);
        }
        
        // Check if we have a decompressed path stored
        if (!$history->decompressed_path) {
            abort(404, 'Decompressed file not found');
        }
        
        // User can access their own files - decrypt and serve
        $tempFile = $this->encryptionService->decryptFileForServing($history->decompressed_path, $history->user_id);
        
        if (!$tempFile) {
            abort(404, 'File not found or decryption failed');
        }
        
        $filename = 'decompressed_' . pathinfo($history->filename, PATHINFO_FILENAME) . '.png';
        return response()->file($tempFile, [
            'Content-Disposition' => 'inline; filename="' . $filename . '"'
        ])->deleteFileAfterSend(true);
    }

    /**
     * Load compressed file data securely (handle encrypted files)
     */
    private function loadCompressedFileSecurely($path, $userId)
    {
        // Check if file is encrypted
        if ($this->encryptionService->isEncrypted($path)) {
            // Decrypt file temporarily
            $decryptedData = $this->encryptionService->decryptFile($path, $userId);
            
            // Create temporary file for HuffmanService to read
            $tempPath = 'temp/compressed_' . time() . '_' . \Illuminate\Support\Str::random(10);
            Storage::put($tempPath, $decryptedData['content']);
            
            // Load using HuffmanService
            $compressedData = $this->huffmanService->loadCompressedFile($tempPath);
            
            // Clean up temp file
            Storage::delete($tempPath);
            
            return $compressedData;
        } else {
            // Legacy: load unencrypted file directly
            return $this->huffmanService->loadCompressedFile($path);
        }
    }
}
