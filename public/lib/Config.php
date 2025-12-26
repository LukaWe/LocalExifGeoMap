<?php
/**
 * Application Configuration (Shared Hosting Version)
 * 
 * All paths are relative to the public directory since this is
 * designed for shared hosting with open_basedir restrictions.
 * 
 * @package gps-track-viewer
 */

declare(strict_types=1);

namespace App;

final class Config
{
    // Application
    public const APP_NAME = 'GPS Track Viewer';
    public const APP_VERSION = '2.0.0';
    public const APP_DOMAIN = 'localhost';
    
    // Paths (relative to BASE_PATH which is the public directory)
    public const PATH_ASSETS = '/assets';
    public const PATH_TEMPLATES = '/templates';
    
    // Security
    public const TOKEN_LIFETIME = 3600;        // 1 hour
    public const RATE_LIMIT_REQUESTS = 100;    // Max requests
    public const RATE_LIMIT_WINDOW = 60;       // Per minute
    
    // Obfuscation
    public const ENABLE_OBFUSCATION = true;
    public const ENABLE_DEBUGGER_TRAP = false;   // Disabled - was blocking DevTools
    public const ENABLE_ANTI_COPY = false;       // Disabled - was blocking right-click/keyboard
    
    // Development mode - now environment-based
    // Set APP_ENV=development in your environment for dev mode
    // Default is production (DEV_MODE = false)
    public const DEV_MODE = false; // Legacy constant, use isDevMode() instead
    
    // IP-based rate limiting (optional, for high-traffic scenarios)
    public const ENABLE_IP_RATE_LIMITING = true;
    public const IP_RATE_LIMIT_REQUESTS = 200;   // Max requests per IP
    public const IP_RATE_LIMIT_WINDOW = 60;      // Per minute
    
    /**
     * Check if running in development mode
     * Uses APP_ENV environment variable, falls back to DEV_MODE constant
     */
    public static function isDevMode(): bool
    {
        $env = getenv('APP_ENV') ?: ($_ENV['APP_ENV'] ?? '');
        if ($env !== '') {
            return strtolower($env) === 'development' || strtolower($env) === 'dev';
        }
        return self::DEV_MODE;
    }
    
    /**
     * Get absolute path to a project directory
     * BASE_PATH is defined in index.php and points to /public
     */
    public static function getPath(string $relativePath): string
    {
        return (defined('BASE_PATH') ? BASE_PATH : __DIR__) . $relativePath;
    }
}
