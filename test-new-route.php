<?php
/**
 * Test file untuk menguji route download publik baru
 * /download/compressed/{id}
 */

echo "=== TEST ROUTE DOWNLOAD BARU ===\n\n";

// Test route tanpa auth
$url = 'http://localhost/download/compressed/116';
echo "URL: $url\n\n";

// Init curl
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_HEADER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$header = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);

curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response Size: " . strlen($body) . " bytes\n\n";

// Check content type
if (preg_match('/Content-Type: ([^\r\n]+)/', $header, $matches)) {
    echo "Content-Type: " . $matches[1] . "\n";
}

// Check content disposition
if (preg_match('/Content-Disposition: ([^\r\n]+)/', $header, $matches)) {
    echo "Content-Disposition: " . $matches[1] . "\n";
}

// Check first bytes
$firstBytes = bin2hex(substr($body, 0, 10));
echo "\nFirst 10 bytes (hex): $firstBytes\n";

// Check if JPEG
if (substr($body, 0, 2) === "\xFF\xD8") {
    echo "✅ File adalah JPEG yang valid!\n";
    
    // Save to verify
    $testPath = __DIR__ . '/storage/app/test-new-route.jpg';
    file_put_contents($testPath, $body);
    echo "✅ File disimpan ke: $testPath\n";
    echo "✅ Ukuran file: " . filesize($testPath) . " bytes\n";
} else {
    echo "❌ Bukan JPEG! Content:\n";
    echo substr($body, 0, 500) . "\n";
    
    // Check if redirect to login
    if (strpos($body, 'login') !== false || strpos($body, 'Login') !== false) {
        echo "\n❌ Masih redirect ke halaman login!\n";
    }
}

echo "\n=== TEST SELESAI ===\n";
