<?php
/**
 * GPS Track Viewer - Main Entry Point
 * 
 * This version is designed for shared hosting with open_basedir restrictions.
 * All files are contained within the public directory.
 * 
 * @package gps-track-viewer
 */

declare(strict_types=1);

// Error handling in production
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '0');  // No server-side logging - app is browser-only

// Force UTF-8 encoding
ini_set('default_charset', 'UTF-8');
if (function_exists('mb_internal_encoding')) {
    mb_internal_encoding('UTF-8');
}

// Base path is this directory for shared hosting
define('BASE_PATH', __DIR__);

// Include autoloader from same directory
$autoloadPath = BASE_PATH . '/vendor/autoload.php';
if (!file_exists($autoloadPath)) {
    // Fallback: Manual class loading if composer not available
    spl_autoload_register(function ($class) {
        $prefix = 'App\\';
        $baseDir = BASE_PATH . '/lib/';
        
        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) !== 0) {
            return;
        }
        
        $relativeClass = substr($class, $len);
        $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';
        
        if (file_exists($file)) {
            require $file;
        }
    });
} else {
    require_once $autoloadPath;
}

use App\Config;
use App\Security\Session;
use App\Security\RateLimiter;
use App\Assets\AssetHandler;
use App\View\Renderer;

// Start session
$session = new Session();

// Rate limiting
$limiter = new RateLimiter($session);
if (!$limiter->check()) {
    http_response_code(429);
    exit('Too Many Requests');
}

// Get request URI
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Route: Vendor files (/vendor/*) - static library files, no token needed
if (preg_match('#^/vendor/(.+)$#', $uri, $matches)) {
    $filename = $matches[1];
    // Sanitize - prevent directory traversal
    $filename = str_replace(['..', "\0"], '', $filename);
    $filepath = BASE_PATH . '/vendor/' . $filename;
    
    if (file_exists($filepath) && is_file($filepath)) {
        // Additional validation: ensure resolved path is within vendor directory
        $realPath = realpath($filepath);
        $vendorDir = realpath(BASE_PATH . '/vendor');
        if ($realPath === false || strpos($realPath, $vendorDir) !== 0) {
            http_response_code(404);
            exit('Vendor file not found');
        }
        
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        $mimeTypes = [
            'js' => 'application/javascript',
            'css' => 'text/css',
            'woff2' => 'font/woff2',
            'woff' => 'font/woff',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml',
        ];
        $contentType = $mimeTypes[$ext] ?? 'application/octet-stream';
        
        header('Content-Type: ' . $contentType . '; charset=utf-8');
        header('Cache-Control: public, max-age=31536000'); // 1 year cache
        readfile($filepath);
        exit;
    }
    
    http_response_code(404);
    exit('Vendor file not found');
}

// Route: Asset requests (/assets/*)
if (preg_match('#^/assets/(.+)$#', $uri, $matches)) {
    $handler = new AssetHandler($session);
    $handler->serve($matches[1], $_GET['t'] ?? '');
    exit;
}

// Route: Main application
$renderer = new Renderer($session);
echo $renderer->render();
