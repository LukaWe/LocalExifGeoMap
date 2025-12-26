<?php
/**
 * Rate Limiter
 * 
 * Protects against automated scraping and abuse.
 * Supports both session-based and IP-based tracking.
 * 
 * @package gps-track-viewer
 */

declare(strict_types=1);

namespace App\Security;

use App\Config;

class RateLimiter
{
    private const SESSION_KEY = 'rate_limit_requests';
    private const IP_CACHE_DIR = '/tmp/gtv_rate_limit';
    
    /**
     * Check if request is allowed (combines session and IP limiting)
     * 
     * @return bool True if allowed, false if rate limited
     */
    public function check(): bool
    {
        // Check session-based limit first
        if (!$this->checkSessionLimit()) {
            return false;
        }
        
        // Check IP-based limit if enabled
        if (Config::ENABLE_IP_RATE_LIMITING && !$this->checkIpLimit()) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Session-based rate limiting (original implementation)
     */
    private function checkSessionLimit(): bool
    {
        $now = time();
        $window = Config::RATE_LIMIT_WINDOW;
        $maxRequests = Config::RATE_LIMIT_REQUESTS;
        
        // Initialize request history
        if (!isset($_SESSION[self::SESSION_KEY])) {
            $_SESSION[self::SESSION_KEY] = [];
        }
        
        // Remove expired entries
        $_SESSION[self::SESSION_KEY] = array_filter(
            $_SESSION[self::SESSION_KEY],
            fn(int $timestamp): bool => $timestamp > ($now - $window)
        );
        
        // Check limit
        if (count($_SESSION[self::SESSION_KEY]) >= $maxRequests) {
            return false;
        }
        
        // Record this request
        $_SESSION[self::SESSION_KEY][] = $now;
        
        return true;
    }
    
    /**
     * IP-based rate limiting (for high-traffic scenarios)
     * Uses file-based storage to track requests per IP
     */
    private function checkIpLimit(): bool
    {
        $ip = $this->getClientIp();
        if (empty($ip)) {
            return true; // Allow if IP cannot be determined
        }
        
        $now = time();
        $window = Config::IP_RATE_LIMIT_WINDOW;
        $maxRequests = Config::IP_RATE_LIMIT_REQUESTS;
        
        // Get cache file path
        $cacheFile = $this->getIpCacheFile($ip);
        
        // Read existing requests
        $requests = $this->readIpCache($cacheFile);
        
        // Remove expired entries
        $requests = array_filter(
            $requests,
            fn(int $timestamp): bool => $timestamp > ($now - $window)
        );
        
        // Check limit
        if (count($requests) >= $maxRequests) {
            return false;
        }
        
        // Record this request
        $requests[] = $now;
        $this->writeIpCache($cacheFile, $requests);
        
        return true;
    }
    
    /**
     * Get client IP address (REMOTE_ADDR only - no spoofable headers)
     */
    private function getClientIp(): string
    {
        return $_SERVER['REMOTE_ADDR'] ?? '';
    }
    
    /**
     * Get cache file path for IP
     */
    private function getIpCacheFile(string $ip): string
    {
        // Create cache directory if needed
        if (!is_dir(self::IP_CACHE_DIR)) {
            @mkdir(self::IP_CACHE_DIR, 0755, true);
        }
        
        // Hash IP for privacy and filesystem safety
        return self::IP_CACHE_DIR . '/' . md5($ip) . '.json';
    }
    
    /**
     * Read IP cache file
     */
    private function readIpCache(string $file): array
    {
        if (!file_exists($file)) {
            return [];
        }
        
        $content = @file_get_contents($file);
        if ($content === false) {
            return [];
        }
        
        $data = json_decode($content, true);
        return is_array($data) ? $data : [];
    }
    
    /**
     * Write IP cache file
     */
    private function writeIpCache(string $file, array $requests): void
    {
        @file_put_contents($file, json_encode($requests), LOCK_EX);
    }
    
    /**
     * Get remaining requests in current window (session-based)
     */
    public function getRemainingRequests(): int
    {
        $count = count($_SESSION[self::SESSION_KEY] ?? []);
        return max(0, Config::RATE_LIMIT_REQUESTS - $count);
    }
}

