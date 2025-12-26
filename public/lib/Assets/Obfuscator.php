<?php
/**
 * JavaScript Obfuscator
 * 
 * Applies various obfuscation techniques to make code harder to steal:
 * - Comment removal
 * - Whitespace minimization  
 * - Self-executing function wrapper
 * - Debugger trap injection
 * - Anti-copy event handlers
 * 
 * @package gps-track-viewer
 */

declare(strict_types=1);

namespace App\Assets;

use App\Config;

class Obfuscator
{
    /**
     * Obfuscate JavaScript code
     * 
     * @param string $code Original JavaScript code
     * @param string $seed Session-specific seed for variation
     * @return string Obfuscated code
     */
    public function obfuscateJS(string $code, string $seed): string
    {
        // Skip obfuscation in dev mode
        if (Config::DEV_MODE) {
            return $code;
        }
        
        // 1. Remove comments
        $code = $this->removeComments($code);
        
        // 2. Minimize whitespace
        $code = $this->minimizeWhitespace($code);
        
        // 3. Wrap in self-executing function (IIFE)
        $code = $this->wrapInIIFE($code);
        
        // Build final output
        $output = '';
        
        // 4. Add anti-copy measures
        if (Config::ENABLE_ANTI_COPY) {
            $output .= $this->getAntiCopyCode();
        }
        
        // 5. Add debugger trap
        if (Config::ENABLE_DEBUGGER_TRAP) {
            $output .= $this->getDebuggerTrap($seed);
        }
        
        $output .= $code;
        
        return $output;
    }
    
    /**
     * Remove JavaScript comments
     */
    private function removeComments(string $code): string
    {
        // Remove multi-line comments
        $code = preg_replace('#/\*[\s\S]*?\*/#', '', $code);
        
        // Remove single-line comments (careful with URLs!)
        $code = preg_replace('#(?<!:)//[^\n]*#', '', $code);
        
        return $code;
    }
    
    /**
     * Minimize whitespace while preserving string literals
     */
    private function minimizeWhitespace(string $code): string
    {
        // Process code while preserving string literals
        $result = '';
        $inString = false;
        $stringChar = '';
        $escaped = false;
        $length = strlen($code);
        $i = 0;
        
        while ($i < $length) {
            $char = $code[$i];
            
            if ($escaped) {
                $result .= $char;
                $escaped = false;
                $i++;
                continue;
            }
            
            if ($char === '\\' && $inString) {
                $result .= $char;
                $escaped = true;
                $i++;
                continue;
            }
            
            if (!$inString && ($char === '"' || $char === "'" || $char === '`')) {
                $inString = true;
                $stringChar = $char;
                $result .= $char;
                $i++;
                continue;
            }
            
            if ($inString && $char === $stringChar) {
                $inString = false;
                $stringChar = '';
                $result .= $char;
                $i++;
                continue;
            }
            
            // If inside string, preserve everything
            if ($inString) {
                $result .= $char;
                $i++;
                continue;
            }
            
            // Outside strings: minimize whitespace
            if (ctype_space($char)) {
                // Collapse multiple whitespace to single space
                while ($i + 1 < $length && ctype_space($code[$i + 1])) {
                    $i++;
                }
                // Only keep space if needed (not around punctuation)
                $prev = $result !== '' ? $result[strlen($result) - 1] : '';
                $next = $i + 1 < $length ? $code[$i + 1] : '';
                $punctuation = '{};,:()[]';
                
                if ($prev !== '' && $next !== '' && 
                    strpos($punctuation, $prev) === false && 
                    strpos($punctuation, $next) === false) {
                    $result .= ' ';
                }
                $i++;
                continue;
            }
            
            $result .= $char;
            $i++;
        }
        
        return trim($result);
    }
    
    /**
     * Wrap code in Immediately Invoked Function Expression
     */
    private function wrapInIIFE(string $code): string
    {
        return "(function(){" . $code . "})();";
    }
    
    /**
     * Generate anti-copy code that blocks common actions
     */
    private function getAntiCopyCode(): string
    {
        return <<<'JS'
(function(){
'use strict';
var d=document;
d.addEventListener('contextmenu',function(e){e.preventDefault();return false;});
d.addEventListener('keydown',function(e){
var k=e.key.toLowerCase();
if((e.ctrlKey||e.metaKey)&&['u','s','i','j','c'].indexOf(k)>-1){e.preventDefault();return false;}
if(e.key==='F12'){e.preventDefault();return false;}
});
d.addEventListener('selectstart',function(e){if(e.target.tagName!=='INPUT'&&e.target.tagName!=='TEXTAREA'){e.preventDefault();}});
})();
JS;
    }
    
    /**
     * Generate debugger trap that triggers when DevTools is opened
     */
    private function getDebuggerTrap(string $seed): string
    {
        // Use seed to vary the interval timing
        $interval = 50 + (hexdec(substr($seed, 0, 2)) % 100);
        
        return <<<JS
(function(){
var _0x{$seed}=setInterval(function(){
var t=performance.now();
debugger;
if(performance.now()-t>100){
document.body.innerHTML='<h1 style="text-align:center;margin-top:20%">DevTools detected. Please close developer tools.</h1>';
clearInterval(_0x{$seed});
}
},{$interval});
})();
JS;
    }
    
    /**
     * Obfuscate CSS (minimal - just remove comments and whitespace)
     */
    public function obfuscateCSS(string $code): string
    {
        if (Config::DEV_MODE) {
            return $code;
        }
        
        // Remove comments
        $code = preg_replace('#/\*[\s\S]*?\*/#', '', $code);
        
        // Minimize whitespace
        $code = preg_replace('/\s+/', ' ', $code);
        $code = preg_replace('/\s*([{};:,])\s*/', '$1', $code);
        
        return trim($code);
    }
}
