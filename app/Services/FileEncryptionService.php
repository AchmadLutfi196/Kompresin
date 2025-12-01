<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class FileEncryptionService
{
    /**
     * Generate encryption key based on user ID and secret
     */
    private function generateUserKey(int $userId): string
    {
        $secret = config('app.key') . '_file_encryption';
        return hash('sha256', $secret . '_user_' . $userId);
    }

    /**
     * Encrypt file content for a specific user
     * Now handles binary files correctly
     */
    public function encryptFile(string $filePath, int $userId): array
    {
        // Skip encryption for compressed files to prevent corruption
        $fileExtension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $isCompressedFile = str_contains($filePath, 'compressed/');
        
        if (in_array($fileExtension, ['bin', 'jpg', 'jpeg', 'png']) || $isCompressedFile) {
            Log::info('Skipping encryption for compressed/image file: ' . $filePath);
            return [
                'encrypted_path' => $filePath, // Return original path
                'original_path' => $filePath,
                'size' => Storage::disk($this->getDiskForPath($filePath))->size($this->getActualPathForDisk($filePath, $this->getDiskForPath($filePath)))
            ];
        }
        
        // Determine which disk to use based on the file path
        $disk = $this->getDiskForPath($filePath);
        $actualPath = $this->getActualPathForDisk($filePath, $disk);
        
        if (!Storage::disk($disk)->exists($actualPath)) {
            throw new \Exception('File not found: ' . $filePath);
        }

        $content = Storage::disk($disk)->get($actualPath);
        $key = $this->generateUserKey($userId);
        
        // Generate a random IV for each encryption
        $iv = random_bytes(16);
        
        // Encrypt the content using OPENSSL_RAW_DATA to handle binary properly
        $encryptedContent = openssl_encrypt($content, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);
        
        if ($encryptedContent === false) {
            throw new \Exception('Encryption failed');
        }

        // Combine IV and encrypted content - all binary data
        $finalContent = $iv . $encryptedContent;
        
        // Save encrypted file with .enc extension as binary
        $encryptedPath = $actualPath . '.enc';
        Storage::disk($disk)->put($encryptedPath, $finalContent);

        return [
            'encrypted_path' => $filePath . '.enc',
            'original_path' => $filePath,
            'size' => strlen($finalContent)
        ];
    }

    /**
     * Decrypt file content for a specific user
     * Now handles binary files correctly
     */
    public function decryptFile(string $encryptedPath, int $userId): array
    {
        // Check if this is a file that wasn't encrypted
        $originalPath = str_replace('.enc', '', $encryptedPath);
        $fileExtension = strtolower(pathinfo($originalPath, PATHINFO_EXTENSION));
        $isCompressedFile = str_contains($originalPath, 'compressed/');
        
        // Skip decryption for files that were never encrypted
        if (in_array($fileExtension, ['bin', 'jpg', 'jpeg', 'png']) || $isCompressedFile) {
            // Check which path exists - with or without .enc
            $disk = $this->getDiskForPath($originalPath);
            $actualPath = $this->getActualPathForDisk($originalPath, $disk);
            
            if (!Storage::disk($disk)->exists($actualPath)) {
                // Maybe it was stored with .enc suffix but not actually encrypted
                $actualPath = $this->getActualPathForDisk($encryptedPath, $disk);
                if (!Storage::disk($disk)->exists($actualPath)) {
                    throw new \Exception('File not found: ' . $originalPath);
                }
                $originalPath = $encryptedPath;
            }
            
            return [
                'temp_path' => $originalPath,
                'content' => null,
                'size' => Storage::disk($disk)->size($actualPath)
            ];
        }
        
        // Determine which disk to use based on the file path
        $disk = $this->getDiskForPath($encryptedPath);
        $actualPath = $this->getActualPathForDisk($encryptedPath, $disk);
        
        if (!Storage::disk($disk)->exists($actualPath)) {
            throw new \Exception('Encrypted file not found: ' . $encryptedPath);
        }

        $encryptedData = Storage::disk($disk)->get($actualPath);
        $key = $this->generateUserKey($userId);
        
        // For new binary format, data is already binary
        $data = $encryptedData;
        
        // Try new binary format first
        if (strlen($data) >= 16) {
            // Extract IV and encrypted content
            $iv = substr($data, 0, 16);
            $encryptedContent = substr($data, 16);
            
            // Decrypt the content using OPENSSL_RAW_DATA
            $decryptedContent = openssl_decrypt($encryptedContent, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);
            
            if ($decryptedContent !== false) {
                // Success with binary format
                $tempPath = 'temp/decrypted_' . time() . '_' . Str::random(10);
                Storage::put($tempPath, $decryptedContent);
                
                return [
                    'temp_path' => $tempPath,
                    'content' => $decryptedContent,
                    'size' => strlen($decryptedContent)
                ];
            }
        }
        
        // Fallback to old base64 format for backward compatibility
        $data = base64_decode($encryptedData);
        
        if ($data === false) {
            throw new \Exception('Invalid encrypted data');
        }

        // Extract IV and encrypted content
        $iv = substr($data, 0, 16);
        $encryptedContent = substr($data, 16);
        
        // Decrypt the content
        $decryptedContent = openssl_decrypt($encryptedContent, 'AES-256-CBC', $key, 0, $iv);
        
        if ($decryptedContent === false) {
            throw new \Exception('Decryption failed - user may not have access to this file');
        }

        // Create temporary decrypted file for download (use default disk for temp files)
        $tempPath = 'temp/decrypted_' . time() . '_' . Str::random(10);
        Storage::put($tempPath, $decryptedContent);

        return [
            'temp_path' => $tempPath,
            'content' => $decryptedContent,
            'size' => strlen($decryptedContent)
        ];
    }

    /**
     * Decrypt file and return temporary file path for serving
     */
    public function decryptFileForServing(string $encryptedPath, int $userId): ?string
    {
        try {
            $result = $this->decryptFile($encryptedPath, $userId);
            
            // Get the correct full path
            $tempPath = $result['temp_path'];
            $disk = $this->getDiskForPath($tempPath);
            $actualPath = $this->getActualPathForDisk($tempPath, $disk);
            
            return Storage::disk($disk)->path($actualPath);
        } catch (\Exception $e) {
            Log::error('File decryption failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Check if file is encrypted
     */
    public function isEncrypted(string $filePath): bool
    {
        return Str::endsWith($filePath, '.enc');
    }

    /**
     * Get file content for admin (metadata only, no actual content)
     */
    public function getFileInfoForAdmin(string $filePath): array
    {
        $disk = $this->getDiskForPath($filePath);
        $actualPath = $this->getActualPathForDisk($filePath, $disk);
        
        if (!Storage::disk($disk)->exists($actualPath)) {
            throw new \Exception('File not found: ' . $filePath);
        }

        $size = Storage::disk($disk)->size($actualPath);
        $lastModified = Storage::disk($disk)->lastModified($actualPath);

        return [
            'path' => $filePath,
            'size' => $size,
            'last_modified' => date('Y-m-d H:i:s', $lastModified),
            'is_encrypted' => $this->isEncrypted($filePath),
            'content_access' => 'restricted' // Admin cannot access actual content
        ];
    }

    /**
     * Clean up temporary files
     */
    public function cleanupTempFiles(): int
    {
        $tempFiles = Storage::files('temp');
        $cleaned = 0;
        $cutoff = time() - (60 * 60); // 1 hour ago

        foreach ($tempFiles as $file) {
            if (Storage::lastModified($file) < $cutoff) {
                Storage::delete($file);
                $cleaned++;
            }
        }

        return $cleaned;
    }

    /**
     * Migrate existing file to encrypted version
     */
    public function migrateToEncrypted(string $originalPath, int $userId): array
    {
        $disk = $this->getDiskForPath($originalPath);
        $actualPath = $this->getActualPathForDisk($originalPath, $disk);
        
        if (!Storage::disk($disk)->exists($actualPath)) {
            throw new \Exception('Original file not found: ' . $originalPath);
        }

        // Encrypt the file
        $result = $this->encryptFile($originalPath, $userId);
        
        // Delete original file after successful encryption
        Storage::disk($disk)->delete($actualPath);
        
        return $result;
    }

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
}