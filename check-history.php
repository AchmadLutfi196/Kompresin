<?php
// Check latest compression history from database

require_once __DIR__ . '/vendor/autoload.php';

// Load Laravel env
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Connect to SQLite
$dbPath = __DIR__ . '/database/database.sqlite';
$pdo = new PDO("sqlite:$dbPath");

echo "=== LATEST COMPRESSION HISTORY ===\n\n";

$stmt = $pdo->query("SELECT id, filename, compressed_path, compressed_size FROM compression_histories ORDER BY id DESC LIMIT 5");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($rows as $row) {
    echo "ID: {$row['id']}\n";
    echo "Filename: {$row['filename']}\n";
    echo "Compressed Path: {$row['compressed_path']}\n";
    echo "Compressed Size: " . number_format($row['compressed_size']) . " bytes\n";
    
    // Check if file exists
    $fullPath = __DIR__ . '/storage/app/public/' . str_replace('public/', '', $row['compressed_path']);
    echo "Full Path: $fullPath\n";
    echo "Exists: " . (file_exists($fullPath) ? '✅ YES' : '❌ NO') . "\n\n";
}
