<?php
/**
 * Session Management with Secure Token Generation
 * 
 * Handles session lifecycle and generates tokens for asset protection.
 * 
 * @package gps-track-viewer
 */

declare(strict_types=1);

namespace App\Security;

use App\Config;

class Session
{
    private bool $started = false;
    
    /**
     * Constructor - auto-starts session
     */
    public function __construct()
    {
        $this->start();
    }
    
    /**
     * Start a secure session
     */
    public function start(): void
    {
        if ($this->started || session_status() === PHP_SESSION_ACTIVE) {
            $this->started = true;
            return;
        }
        
        // Secure session configuration
        session_set_cookie_params([
            'lifetime' => 0,                    // Session cookie
            'path' => '/',
            'domain' => '',                     // Current domain only
            'secure' => !Config::DEV_MODE,      // HTTPS only in production
            'httponly' => true,                 // No JavaScript access
            'samesite' => 'Strict',             // Strict same-site policy
        ]);
        
        session_name('GTVS');  // GPS Track Viewer Session
        
        if (!session_start([
            'use_strict_mode' => true,
            'use_only_cookies' => true,
            'cookie_httponly' => true,
        ])) {
            throw new \RuntimeException('Failed to start session');
        }
        
        $this->started = true;
        
        // Initialize or refresh token
        if (!$this->hasValidToken()) {
            $this->regenerateToken();
        }
        
        // Regenerate session ID periodically for security
        $this->regenerateSessionIdIfNeeded();
    }
    
    /**
     * Check if current token is valid
     */
    private function hasValidToken(): bool
    {
        return isset($_SESSION['asset_token'], $_SESSION['token_expires']) 
            && $_SESSION['token_expires'] > time();
    }
    
    /**
     * Generate new asset token and obfuscation seed
     */
    public function regenerateToken(): void
    {
        $_SESSION['asset_token'] = bin2hex(random_bytes(32));
        $_SESSION['token_expires'] = time() + Config::TOKEN_LIFETIME;
        $_SESSION['obfuscation_seed'] = bin2hex(random_bytes(16));
        $_SESSION['created_at'] = $_SESSION['created_at'] ?? time();
    }
    
    /**
     * Regenerate session ID periodically
     */
    private function regenerateSessionIdIfNeeded(): void
    {
        $regenerateAfter = 1800; // 30 minutes
        
        if (!isset($_SESSION['last_regeneration'])) {
            $_SESSION['last_regeneration'] = time();
        }
        
        if (time() - $_SESSION['last_regeneration'] > $regenerateAfter) {
            session_regenerate_id(true);
            $_SESSION['last_regeneration'] = time();
        }
    }
    
    /**
     * Get current asset token
     */
    public function getAssetToken(): string
    {
        return $_SESSION['asset_token'] ?? '';
    }
    
    /**
     * Validate provided token against session token
     */
    public function validateToken(string $token): bool
    {
        if (empty($token) || empty($_SESSION['asset_token'])) {
            return false;
        }
        
        // Timing-safe comparison
        return hash_equals($_SESSION['asset_token'], $token);
    }
    
    /**
     * Get obfuscation seed for JS scrambling
     */
    public function getObfuscationSeed(): string
    {
        return $_SESSION['obfuscation_seed'] ?? '';
    }
    
    /**
     * Get session ID for logging
     */
    public function getSessionId(): string
    {
        return session_id() ?: '';
    }
}
