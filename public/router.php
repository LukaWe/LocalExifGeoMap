<?php
/**
 * Router for PHP Built-in Development Server
 * This router ensures that all requests
 * are correctly forwarded to index.php.
 */

$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);

// Serve static files from /vendor/ directly
if (preg_match('#^/vendor/.+#', $path)) {
    $file = __DIR__ . $path;
    if (file_exists($file) && is_file($file)) {
        // Let PHP built-in server handle static vendor files
        return false;
    }
}

// IMPORTANT: All /assets/ requests MUST go through index.php
// because they require token validation!
// We must NOT return false here!

// Forward all other requests (incl. /assets/) to index.php
require __DIR__ . '/index.php';

