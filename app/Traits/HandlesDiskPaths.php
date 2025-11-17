<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;

trait HandlesDiskPaths
{
    /**
     * Determine which disk to use based on file path
     */
    private function getDiskForPath(string $filePath): string
    {
        // If path starts with 'public/', use the public disk
        if (str_starts_with($filePath, 'public/')) {
            return 'public';
        }
        
        // Otherwise use the default disk
        return config('filesystems.default', 'local');
    }

    /**
     * Get the actual path for the specified disk
     */
    private function getActualPathForDisk(string $filePath, string $disk): string
    {
        // If using public disk and path starts with 'public/', remove the prefix
        if ($disk === 'public' && str_starts_with($filePath, 'public/')) {
            return substr($filePath, 7); // Remove 'public/' prefix
        }
        
        return $filePath;
    }

    /**
     * Check if file exists using correct disk
     */
    private function fileExistsOnCorrectDisk(string $filePath): bool
    {
        $disk = $this->getDiskForPath($filePath);
        $actualPath = $this->getActualPathForDisk($filePath, $disk);
        return Storage::disk($disk)->exists($actualPath);
    }

    /**
     * Delete file using correct disk
     */
    private function deleteFileOnCorrectDisk(string $filePath): bool
    {
        $disk = $this->getDiskForPath($filePath);
        $actualPath = $this->getActualPathForDisk($filePath, $disk);
        return Storage::disk($disk)->delete($actualPath);
    }

    /**
     * Get file size using correct disk
     */
    private function getFileSizeOnCorrectDisk(string $filePath): int
    {
        $disk = $this->getDiskForPath($filePath);
        $actualPath = $this->getActualPathForDisk($filePath, $disk);
        return Storage::disk($disk)->size($actualPath);
    }

    /**
     * Get file content using correct disk
     */
    private function getFileContentOnCorrectDisk(string $filePath): string
    {
        $disk = $this->getDiskForPath($filePath);
        $actualPath = $this->getActualPathForDisk($filePath, $disk);
        return Storage::disk($disk)->get($actualPath);
    }

    /**
     * Get full filesystem path using correct disk
     */
    private function getFullPathOnCorrectDisk(string $filePath): string
    {
        $disk = $this->getDiskForPath($filePath);
        $actualPath = $this->getActualPathForDisk($filePath, $disk);
        return Storage::disk($disk)->path($actualPath);
    }
}