<?php
/**
 * Asset Handler
 * 
 * Serves JavaScript and CSS assets dynamically with token validation.
 * Only requests with valid session tokens can access assets.
 * 
 * @package gps-track-viewer
 */

declare(strict_types=1);

namespace App\Assets;

use App\Config;
use App\Security\Session;

class AssetHandler
{
    private Session $session;
    private Obfuscator $obfuscator;
    
    public function __construct(Session $session)
    {
        $this->session = $session;
        $this->obfuscator = new Obfuscator();
    }
    
    /**
     * Serve an asset file
     * 
     * @param string $filename Requested filename
     * @param string $token Token from query string
     */
    public function serve(string $filename, string $token): void
    {
        // Validate token first!
        if (!$this->session->validateToken($token)) {
            $this->denyAccess('Invalid or expired token');
            return;
        }
        
        // Sanitize filename - prevent directory traversal
        $filename = basename($filename);
        
        // Determine content type and base path
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        
        switch ($extension) {
            case 'js':
                $this->serveJavaScript($filename);
                break;
            case 'css':
                $this->serveStylesheet($filename);
                break;
            default:
                $this->denyAccess('Invalid asset type');
        }
    }
    
    /**
     * Serve JavaScript file with obfuscation
     */
    private function serveJavaScript(string $filename): void
    {
        $path = Config::getPath(Config::PATH_ASSETS) . '/js/' . $filename;
        
        if (!file_exists($path) || !is_readable($path)) {
            http_response_code(404);
            exit('Asset not found');
        }
        
        $content = file_get_contents($path);
        $seed = $this->session->getObfuscationSeed();
        
        // Apply obfuscation
        if (Config::ENABLE_OBFUSCATION) {
            $content = $this->obfuscator->obfuscateJS($content, $seed);
        }
        
        // Set headers
        $this->setNoCacheHeaders();
        header('Content-Type: application/javascript; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
        
        echo $content;
    }
    
    /**
     * Serve CSS file with minimal processing
     */
    private function serveStylesheet(string $filename): void
    {
        $path = Config::getPath(Config::PATH_ASSETS) . '/css/' . $filename;
        
        if (!file_exists($path) || !is_readable($path)) {
            http_response_code(404);
            exit('Asset not found');
        }
        
        $content = file_get_contents($path);
        
        // Apply CSS minification
        if (Config::ENABLE_OBFUSCATION) {
            $content = $this->obfuscator->obfuscateCSS($content);
        }
        
        $this->setNoCacheHeaders();
        header('Content-Type: text/css; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
        
        echo $content;
    }
    
    /**
     * Set headers to prevent caching
     */
    private function setNoCacheHeaders(): void
    {
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Cache-Control: post-check=0, pre-check=0', false);
        header('Pragma: no-cache');
        header('Expires: Thu, 01 Jan 1970 00:00:00 GMT');
    }
    
    /**
     * Deny access with 403 response
     */
    private function denyAccess(string $reason): void
    {
        http_response_code(403);
        
        // Don't reveal details to potential attackers
        exit('Access Denied');
    }
}

