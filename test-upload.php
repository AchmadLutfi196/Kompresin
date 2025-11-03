#!/usr/bin/env php
<?php

// Create a simple test image
$image = imagecreatetruecolor(50, 50);
$white = imagecolorallocate($image, 255, 255, 255);
imagefill($image, 0, 0, $white);
$tempFile = sys_get_temp_dir() . '/test_upload.png';
imagepng($image, $tempFile);
imagedestroy($image);

echo "Test image created: $tempFile\n";
echo "File size: " . filesize($tempFile) . " bytes\n\n";

// Prepare curl request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8000/compress');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'X-Requested-With: XMLHttpRequest',
]);

$postData = [
    'image' => new CURLFile($tempFile, 'image/png', 'test.png')
];

curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);

echo "Sending request to http://127.0.0.1:8000/compress...\n\n";

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response:\n";
echo $response . "\n";

// Cleanup
unlink($tempFile);
