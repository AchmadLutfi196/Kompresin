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
     */
    public function encryptFile(string $filePath, int $userId): array
    {
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
        
        // Encrypt the content
        $encryptedContent = openssl_encrypt($content, 'AES-256-CBC', $key, 0, $iv);
        
        if ($encryptedContent === false) {
            throw new \Exception('Encryption failed');
        }

        // Combine IV and encrypted content
        $finalContent = base64_encode($iv . $encryptedContent);
        
        // Save encrypted file with .enc extension
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
     */
    public function decryptFile(string $encryptedPath, int $userId): array
    {
        // Determine which disk to use based on the file path
        $disk = $this->getDiskForPath($encryptedPath);
        $actualPath = $this->getActualPathForDisk($encryptedPath, $disk);
        
        if (!Storage::disk($disk)->exists($actualPath)) {
            throw new \Exception('Encrypted file not found: ' . $encryptedPath);
        }

        $encryptedData = Storage::disk($disk)->get($actualPath);
        $key = $this->generateUserKey($userId);
        
        // Decode the base64 content
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
            return Storage::path($result['temp_path']);
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