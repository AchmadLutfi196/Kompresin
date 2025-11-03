<?php
// Create a colorful test image to verify RGB preservation
$image = imagecreatetruecolor(100, 100);

// Create distinct color sections
$colors = [
    imagecolorallocate($image, 255, 0, 0),    // Pure Red
    imagecolorallocate($image, 0, 255, 0),    // Pure Green  
    imagecolorallocate($image, 0, 0, 255),    // Pure Blue
    imagecolorallocate($image, 255, 255, 0),  // Yellow
    imagecolorallocate($image, 255, 0, 255),  // Magenta
    imagecolorallocate($image, 0, 255, 255),  // Cyan
    imagecolorallocate($image, 255, 128, 0),  // Orange
    imagecolorallocate($image, 128, 0, 255),  // Purple
    imagecolorallocate($image, 255, 255, 255), // White
];

// Create colorful blocks pattern
for ($y = 0; $y < 100; $y++) {
    for ($x = 0; $x < 100; $x++) {
        $blockX = intval($x / 33);
        $blockY = intval($y / 33);
        $colorIndex = ($blockX + $blockY * 3) % count($colors);
        imagesetpixel($image, $x, $y, $colors[$colorIndex]);
    }
}

$filename = 'public/colorful-test-image.png';
imagepng($image, $filename);
imagedestroy($image);

echo "Colorful test image created: $filename\n";
echo "Size: " . filesize($filename) . " bytes\n";
echo "This image has distinct RGB colors to test color preservation!\n";
?>