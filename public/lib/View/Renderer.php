<?php
/**
 * Template Renderer
 * 
 * Renders the main application template with dynamic asset URLs
 * and security nonces.
 * 
 * @package gps-track-viewer
 */

declare(strict_types=1);

namespace App\View;

use App\Config;
use App\Security\Session;

class Renderer
{
    private Session $session;
    private string $nonce;
    
    public function __construct(Session $session)
    {
        $this->session = $session;
        $this->nonce = base64_encode(random_bytes(16));
    }
    
    /**
     * Render the main application template
     */
    public function render(): string
    {
        // Set content type with explicit UTF-8 charset
        header('Content-Type: text/html; charset=utf-8');
        
        // Set security headers
        $this->setSecurityHeaders();
        
        // Prepare template variables
        $token = $this->session->getAssetToken();
        $nonce = $this->nonce;
        
        // Asset URL helper
        $assetUrl = function(string $file) use ($token): string {
            return "/assets/{$file}?t={$token}";
        };
        
        // Start output buffering
        ob_start();
        
        // Include the template
        $templatePath = Config::getPath(Config::PATH_TEMPLATES) . '/app.php';
        
        if (!file_exists($templatePath)) {
            throw new \RuntimeException('Template not found: ' . $templatePath);
        }
        
        include $templatePath;
        
        return ob_get_clean();
    }
    
    /**
     * Set security headers including CSP
     */
    private function setSecurityHeaders(): void
    {
        // Content Security Policy
        $csp = [
            "default-src 'self'",
            "script-src 'self' 'nonce-{$this->nonce}' https://unpkg.com https://cdn.jsdelivr.net 'sha256-ZswfTY7H35rbv8WC7NXBoiC7WNu86vSzCDChNWwZZDM='",
            "style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://server.arcgisonline.com https://*.tile.thunderforest.com https://*.tile.opentopomap.org https://*.tile.openstreetmap.fr https://tileserver.memomaps.de https://*.tiles.openrailwaymap.org https://*.tile-cyclosm.openstreetmap.fr",
            "connect-src 'self' https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://server.arcgisonline.com https://unpkg.com https://cdn.jsdelivr.net https://*.tile.opentopomap.org https://*.tile.openstreetmap.fr https://tileserver.memomaps.de https://*.tiles.openrailwaymap.org https://*.tile-cyclosm.openstreetmap.fr https://overpass-api.de",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ];
        
        header('Content-Security-Policy: ' . implode('; ', $csp));
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
    }
    
    /**
     * Get nonce for inline scripts
     */
    public function getNonce(): string
    {
        return $this->nonce;
    }
}
