<?php
/**
 * Test Laravel route resolution directly
 */

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// Boot the application
$app->boot();

echo "=== TEST ROUTE RESOLUTION ===\n\n";

// Check if route exists
$router = app('router');

try {
    $route = $router->getRoutes()->getByName('download.compressed');
    if ($route) {
        echo "✅ Route 'download.compressed' exists!\n";
        echo "   URI: " . $route->uri() . "\n";
        echo "   Methods: " . implode(', ', $route->methods()) . "\n";
        echo "   Controller: " . $route->getActionName() . "\n";
        echo "   Middleware: " . json_encode($route->gatherMiddleware()) . "\n";
    } else {
        echo "❌ Route 'download.compressed' NOT FOUND!\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n--- Comparing with secure route ---\n";

try {
    $secureRoute = $router->getRoutes()->getByName('secure.compressed');
    if ($secureRoute) {
        echo "Route 'secure.compressed':\n";
        echo "   URI: " . $secureRoute->uri() . "\n";
        echo "   Middleware: " . json_encode($secureRoute->gatherMiddleware()) . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

// Now test actual download
echo "\n=== TEST FILE DOWNLOAD ===\n";

// Get a compression history
$history = App\Models\CompressionHistory::latest()->first();

if ($history) {
    echo "\nHistory ID: {$history->id}\n";
    echo "Compressed Path: {$history->compressed_path}\n";
    
    // Generate URL
    $url = route('download.compressed', $history->id);
    echo "Download URL: $url\n";
    
    // Check if file exists
    $controller = new App\Http\Controllers\CompressionController();
    
    // Use reflection to call private method
    $reflection = new ReflectionClass($controller);
    $method = $reflection->getMethod('getFullPathOnCorrectDisk');
    $method->setAccessible(true);
    $fullPath = $method->invoke($controller, $history->compressed_path);
    
    echo "Full Path: $fullPath\n";
    echo "File Exists: " . (file_exists($fullPath) ? 'YES' : 'NO') . "\n";
    
    if (file_exists($fullPath)) {
        echo "File Size: " . number_format(filesize($fullPath)) . " bytes\n";
        
        // Check JPEG header
        $handle = fopen($fullPath, 'rb');
        $header = fread($handle, 4);
        fclose($handle);
        
        $hex = bin2hex($header);
        echo "First 4 bytes: $hex\n";
        
        if (substr($header, 0, 2) === "\xFF\xD8") {
            echo "✅ Valid JPEG file!\n";
        } else {
            echo "❌ Not a valid JPEG\n";
        }
    }
} else {
    echo "No compression history found!\n";
}

echo "\n=== TEST COMPLETE ===\n";
