<?php
/**
 * Rate Limiter
 * 
 * Protects against automated scraping and abuse.
 * Uses session-based tracking for simplicity.
 * 
 * @package gps-track-viewer
 */

declare(strict_types=1);

namespace App\Security;

use App\Config;

class RateLimiter
{
    private const SESSION_KEY = 'rate_limit_requests';
    
    /**
     * Check if request is allowed
     * 
     * @return bool True if allowed, false if rate limited
     */
    public function check(): bool
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
     * Get remaining requests in current window
     */
    public function getRemainingRequests(): int
    {
        $count = count($_SESSION[self::SESSION_KEY] ?? []);
        return max(0, Config::RATE_LIMIT_REQUESTS - $count);
    }
}

