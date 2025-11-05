<?php

namespace Database\Seeders;

use App\Models\CompressionHistory;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CompressionHistorySeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@kompresin.com')->first();
        
        if (!$admin) {
            $this->command->error('Admin user not found. Please run AdminUserSeeder first.');
            return;
        }

        $compressions = [
            [
                'original_filename' => 'document1.txt',
                'compressed_filename' => 'document1_compressed.zip',
                'original_size' => 1024000,
                'compressed_size' => 358400,
                'compression_ratio' => 65,
                'format' => 'zip',
                'compression_time' => 1.2,
            ],
            [
                'original_filename' => 'image_data.jpg',
                'compressed_filename' => 'image_data_compressed.bin',
                'original_size' => 2048000,
                'compressed_size' => 716800,
                'compression_ratio' => 65,
                'format' => 'bin',
                'compression_time' => 2.1,
            ],
            [
                'original_filename' => 'config.json',
                'compressed_filename' => 'config_compressed.txt',
                'original_size' => 512000,
                'compressed_size' => 153600,
                'compression_ratio' => 70,
                'format' => 'txt',
                'compression_time' => 0.8,
            ],
            [
                'original_filename' => 'data_export.csv',
                'compressed_filename' => 'data_export_compressed.json',
                'original_size' => 3072000,
                'compressed_size' => 1228800,
                'compression_ratio' => 60,
                'format' => 'json',
                'compression_time' => 3.5,
            ],
            [
                'original_filename' => 'report.pdf',
                'compressed_filename' => 'report_compressed.zip',
                'original_size' => 4096000,
                'compressed_size' => 1433600,
                'compression_ratio' => 65,
                'format' => 'zip',
                'compression_time' => 4.2,
            ],
        ];

        foreach ($compressions as $compression) {
            CompressionHistory::create([
                'type' => 'compression',
                'filename' => $compression['original_filename'],
                'original_path' => 'originals/' . $compression['original_filename'],
                'compressed_path' => 'compressed/' . $compression['compressed_filename'],
                'original_size' => $compression['original_size'],
                'compressed_size' => $compression['compressed_size'],
                'compression_ratio' => $compression['compression_ratio'],
                'image_width' => rand(800, 1920),
                'image_height' => rand(600, 1080),
                'created_at' => now()->subDays(rand(0, 30)),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('Sample compression history data created successfully!');
    }
}
