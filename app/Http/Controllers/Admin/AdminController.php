<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CompressionHistory;
use App\Models\User;
use App\Services\FileEncryptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AdminController extends Controller
{
    protected $encryptionService;

    public function __construct(FileEncryptionService $encryptionService)
    {
        $this->encryptionService = $encryptionService;
    }
    /**
     * Show admin dashboard
     */
    public function dashboard()
    {
        $stats = $this->getSystemStats();
        
        return Inertia::render('Admin/AdminDashboard', [
            'stats' => $stats,
            'user' => Auth::user()
        ]);
    }

    /**
     * Show compression history management
     */
    public function compressionHistory()
    {
        $history = CompressionHistory::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/AdminHistory', [
            'history' => $history,
            'user' => Auth::user()
        ]);
    }

    /**
     * Show file management
     */
    public function fileManagement()
    {
        $files = $this->getStorageFiles();
        
        return Inertia::render('Admin/AdminFiles', [
            'files' => $files['files'],
            'storageUsed' => $files['storageUsed'],
            'totalFiles' => $files['totalFiles'],
            'user' => Auth::user()
        ]);
    }

    /**
     * Show system settings
     */
    public function settings()
    {
        $settings = $this->getSystemSettings();
        
        return Inertia::render('Admin/AdminSettings', [
            'settings' => $settings['settings'],
            'phpVersion' => $settings['phpVersion'],
            'laravelVersion' => $settings['laravelVersion'],
            'diskSpace' => $settings['diskSpace'],
            'user' => Auth::user()
        ]);
    }

    /**
     * Delete compression history entry
     */
    public function deleteHistory(Request $request, $id)
    {
        $history = CompressionHistory::findOrFail($id);
        
        // Delete associated files
        if ($history->compressed_path && Storage::exists($history->compressed_path)) {
            Storage::delete($history->compressed_path);
        }
        if ($history->decompressed_path && Storage::exists($history->decompressed_path)) {
            Storage::delete($history->decompressed_path);
        }
        
        $history->delete();
        
        return back()->with('message', 'History entry deleted successfully');
    }

    /**
     * Clean up old files
     */
    public function cleanupFiles(Request $request)
    {
        $days = $request->input('days', 7);
        
        // Delete files older than specified days
        $cutoff = now()->subDays($days);
        
        $oldHistory = CompressionHistory::where('created_at', '<', $cutoff)->get();
        
        Log::info("Cleanup started: Found {$oldHistory->count()} records older than {$days} days");
        
        $deletedFiles = 0;
        $freedSpaceBytes = 0;
        
        foreach ($oldHistory as $history) {
            if ($history->compressed_path && Storage::disk('public')->exists($history->compressed_path)) {
                $freedSpaceBytes += Storage::disk('public')->size($history->compressed_path);
                Storage::disk('public')->delete($history->compressed_path);
                $deletedFiles++;
            }
            if ($history->decompressed_path && Storage::disk('public')->exists($history->decompressed_path)) {
                $freedSpaceBytes += Storage::disk('public')->size($history->decompressed_path);
                Storage::disk('public')->delete($history->decompressed_path);
                $deletedFiles++;
            }
            $history->delete();
        }

        // Format freed space
        $freedSpace = $this->formatBytes($freedSpaceBytes);

        Log::info("Cleanup completed: {$deletedFiles} files deleted, {$freedSpace} freed");

        // Get updated file data
        $files = $this->getStorageFiles();
        $totalSize = collect($files)->sum('size');
        $storageUsed = $this->formatBytes($totalSize);

        return Inertia::render('AdminFiles', [
            'files' => $files,
            'storageUsed' => $storageUsed,
            'totalFiles' => count($files),
            'deletedFiles' => $deletedFiles,
            'freedSpace' => $freedSpace,
            'message' => "Cleanup berhasil! {$deletedFiles} file dihapus, {$freedSpace} ruang dibebaskan"
        ]);
    }



    /**
     * Get system statistics
     */
    private function getSystemStats()
    {
        $totalCompressions = CompressionHistory::count();
        $totalUsers = User::count();
        
        // Storage usage
        $compressedSize = 0;
        $decompressedSize = 0;
        
        $files = Storage::disk('public')->allFiles();
        foreach ($files as $file) {
            $size = Storage::disk('public')->size($file);
            if (str_contains($file, 'compressed/')) {
                $compressedSize += $size;
            } elseif (str_contains($file, 'decompressed/')) {
                $decompressedSize += $size;
            }
        }

        // Recent activity
        $recentCompressions = CompressionHistory::orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Average compression ratio
        $avgCompressionRatio = CompressionHistory::where('compression_ratio', '>', 0)
            ->avg('compression_ratio');

        // Calculate today's compressions
        $compressionToday = CompressionHistory::whereDate('created_at', today())->count();
        
        // Calculate active users (users who compressed something in last 7 days)
        $activeUsers = CompressionHistory::where('created_at', '>=', now()->subDays(7))
            ->distinct('user_id')
            ->count('user_id');

        // Format total storage used
        $totalStorageUsed = $this->formatBytes($compressedSize + $decompressedSize);

        return [
            'totalCompressions' => $totalCompressions,
            'totalUsers' => $totalUsers,
            'totalStorageUsed' => $totalStorageUsed,
            'averageCompressionRatio' => round($avgCompressionRatio ?? 0, 2),
            'recentActivity' => $recentCompressions->count(),
            'activeUsers' => $activeUsers,
            'compressionToday' => $compressionToday,
            'systemUptime' => '24 days, 3 hours'
        ];
    }

    /**
     * Get storage files information
     */
    private function getStorageFiles()
    {
        $files = [];
        $totalSize = 0;
        
        $directories = ['compressed', 'decompressed', 'originals'];
        
        foreach ($directories as $dir) {
            if (Storage::disk('public')->exists($dir)) {
                $dirFiles = Storage::disk('public')->files($dir);
                foreach ($dirFiles as $file) {
                    $size = Storage::disk('public')->size($file);
                    $totalSize += $size;
                    
                    // Check if file is encrypted and get admin-appropriate info
                    $fileInfo = [
                        'name' => basename($file),
                        'path' => $file,
                        'size' => $size,
                        'modified' => date('Y-m-d H:i:s', Storage::disk('public')->lastModified($file)),
                        'type' => 'file',
                    ];
                    
                    // Add encryption status and privacy info for admin
                    if ($this->encryptionService->isEncrypted('public/' . $file)) {
                        $fileInfo['encrypted'] = true;
                        $fileInfo['privacy_protected'] = true;
                        $fileInfo['admin_note'] = 'Content encrypted for user privacy';
                        
                        // Try to get admin metadata if available
                        try {
                            $adminInfo = $this->encryptionService->getFileInfoForAdmin('public/' . $file);
                            $fileInfo['admin_metadata'] = $adminInfo;
                        } catch (\Exception $e) {
                            // File info not available
                            $fileInfo['admin_metadata'] = ['error' => 'Metadata not accessible'];
                        }
                    } else {
                        $fileInfo['encrypted'] = false;
                        $fileInfo['privacy_protected'] = false;
                        $fileInfo['admin_note'] = 'Legacy unencrypted file';
                    }
                    
                    $files[] = $fileInfo;
                }
            }
        }

        $storageUsed = $this->formatBytes($totalSize);
        
        return [
            'files' => collect($files)->sortByDesc('modified')->values()->all(),
            'storageUsed' => $storageUsed,
            'totalFiles' => count($files),
        ];
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes($size, $precision = 2)
    {
        $base = log($size, 1024);
        $suffixes = array('B', 'KB', 'MB', 'GB', 'TB');   

        return round(pow(1024, $base - floor($base)), $precision) . ' ' . $suffixes[floor($base)];
    }

    /**
     * Get system settings
     */
    private function getSystemSettings()
    {
        $settings = [
            'maxFileSize' => 10, // MB
            'allowedFormats' => ['txt', 'json', 'zip', 'bin'],
            'compressionLevel' => 6,
            'cleanupSchedule' => 'weekly',
            'enableLogging' => true,
            'maintenanceMode' => false,
            'maxStorageSize' => 1024, // MB
            'backupEnabled' => false,
        ];

        $phpVersion = phpversion();
        $laravelVersion = app()->version();
        
        // Get disk space info
        $diskSpace = [
            'used' => '2.5 GB',
            'available' => '47.5 GB',
            'total' => '50 GB'
        ];

        return [
            'settings' => $settings,
            'phpVersion' => $phpVersion,
            'laravelVersion' => $laravelVersion,
            'diskSpace' => $diskSpace,
        ];
    }
}
