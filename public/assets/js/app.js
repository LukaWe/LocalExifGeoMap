
// Heatmap Color Schemes - v19 Enhanced (5 schemes)
const heatmapSchemes = {
    default: {
        0.0: '#0000ff',
        0.25: '#0080ff',
        0.5: '#00ff00',
        0.75: '#ffff00',
        1.0: '#ff0000'
    },
    cool: {
        0.0: '#000080',
        0.25: '#0000ff',
        0.5: '#00ffff',
        0.75: '#00ff80',
        1.0: '#00ff00'
    },
    earth: {
        0.0: '#8B4513',
        0.25: '#CD853F',
        0.5: '#FFD700',
        0.75: '#FFA500',
        1.0: '#FF6347'
    },
    marine: {
        0.0: '#00008B',
        0.25: '#0000CD',
        0.5: '#1E90FF',
        0.75: '#00CED1',
        1.0: '#00FFFF'
    },
    twilight: {
        0.0: '#4B0082',
        0.25: '#9370DB',
        0.5: '#FF69B4',
        0.75: '#FFA500',
        1.0: '#FF6347'
    }
};


// Tile Providers - Extended with free map styles (no API key required)
const tileProviders = [
    {
        name: "OpenStreetMap Standard",
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: "&copy; OpenStreetMap contributors"
    },
    {
        name: "OpenStreetMap Cycle",
        url: "https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",
        attribution: "&copy; OpenStreetMap contributors, CyclOSM"
    },
    {
        name: "OpenTopoMap",
        url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        attribution: "&copy; OpenTopoMap contributors"
    },
    {
        name: "Esri WorldImagery",
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: "&copy; Esri"
    },
    {
        name: "Esri WorldStreetMap",
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        attribution: "&copy; Esri"
    },
    {
        name: "Esri WorldTopoMap",
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        attribution: "&copy; Esri"
    },
    {
        name: "CartoDB Positron",
        url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        attribution: "&copy; OpenStreetMap, &copy; CartoDB"
    },
    {
        name: "CartoDB Dark Matter",
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        attribution: "&copy; OpenStreetMap, &copy; CartoDB"
    },
    {
        name: "CartoDB Voyager",
        url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        attribution: "&copy; OpenStreetMap, &copy; CartoDB"
    },
    {
        name: "Humanitarian OSM",
        url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
        attribution: "&copy; OpenStreetMap contributors, Humanitarian OSM Team"
    },
    {
        name: "OPNVKarte (Transport)",
        url: "https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png",
        attribution: "&copy; OpenStreetMap, MeMoMaps"
    },
    {
        name: "OpenRailwayMap",
        url: "https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png",
        attribution: "&copy; OpenStreetMap, OpenRailwayMap"
    }
];

/**
 * Security: Sanitize URL to prevent XSS
 * Only allow https:// and http:// URLs from trusted domains
 */
function sanitizeURL(url) {
    try {
        if (!url || typeof url !== 'string') return '#';

        const parsed = new URL(url);

        // Only allow https and http
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
            console.warn('Invalid URL protocol:', parsed.protocol);
            return '#';
        }

        // Allow trusted domains
        const trustedDomains = [
            'github.com',
            'leafletjs.com',
            'chartjs.org',
            'openstreetmap.org',
            'carto.com',
            'cdnjs.com',
            'wikipedia.org',
            'bayerischer-wald.org'
        ];

        const isAllowed = trustedDomains.some(domain => parsed.hostname.includes(domain));

        if (!isAllowed) {
            console.warn('URL not from trusted domain:', parsed.hostname);
            return '#';
        }

        return url;
    } catch (e) {
        console.error('Error sanitizing URL:', e);
        return '#';
    }
}

/**
 * Security: Sanitize text to prevent XSS
 */
function sanitizeText(text) {
    if (!text) return '';

    return text
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

/**
 * Helper: Format Wikipedia URL
 * Handles "lang:Article" format or defaults to current language
 */
function getWikipediaUrl(tag) {
    if (!tag) return '#';
    let lang = currentLang || 'en';
    let article = tag;

    // Check for language prefix (e.g., "de:Article")
    const parts = tag.toString().split(':');
    if (parts.length === 2 && parts[0].length === 2) {
        lang = parts[0];
        article = parts[1];
    }

    // Fallback: If no prefix and value looks German, maybe default to de?
    // But using currentLang is safer behavior for the UI.
    // Ensure article is URL safe
    const safeArticle = encodeURIComponent(article.trim().replace(/ /g, '_'));
    return `https://${lang}.wikipedia.org/wiki/${safeArticle}`;
}

// Locale mappings for date formatting
const locales = {
    de: 'de-DE',
    en: 'en-US',
    it: 'it-IT',
    hr: 'hr-HR',
    pl: 'pl-PL',
    es: 'es-ES',
    uk: 'uk-UA',
    nl: 'nl-NL',
    sv: 'sv-SE',
    no: 'no-NO'
};

// ===== GPS TRACK VIEWER v21 - PRODUCTION =====
// High-volume support: 50,000 images
// Batch limit: 10,000 images per upload (fixed from 500)
// Languages: 11 including Bavarian/Oberpälzisch
// Default language: English (always)
// Enhanced security and memory management

/**
 * FILE UPLOAD CONFIGURATION v21
 * Fixed batch limit to 10,000 (was 500)
 * Supports massive track analysis with security
 */
const FILE_UPLOAD_CONFIG = {
    // Individual file constraints
    MAX_FILE_SIZE: 100 * 1024 * 1024,  // 100MB per file
    MIN_FILE_SIZE: 1024,                // 1KB minimum

    // Batch constraints
    MAX_FILES_BATCH: 10000,             // 10,000 files per upload
    MAX_TOTAL_FILES: 50000,             // 50,000 total files

    // Memory constraints
    MAX_MEMORY_MB: 500,                 // Monitor ~500MB memory

    // Allowed MIME types
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],

    // Track file types (GPX, KML, GeoJSON)
    ALLOWED_TRACK_EXTENSIONS: ['.gpx', '.kml', '.json', '.geojson']
};

// Application State - ALWAYS ENGLISH DEFAULT
let currentLang = 'en';
let map = null;
let currentTileLayer = null;
let gpsPoints = [];
let trackLayer = null;
let pointsLayer = null;
let markersLayer = null;
let heatmapLayer = null;
let arrowsLayer = null;
let animationMarker = null;
let animationInterval = null;
let currentAnimationIndex = 0;
let isAnimating = false;
let elevationChart = null;
let imageFiles = [];
// Track Parser Instance
const trackParser = new TrackParser();
let orphanedPhotos = []; // Photos with timestamp but no GPS
let customPOIs = []; // Array of {lat, lng, name, type, desc, id}
let isPOIEditMode = false;
let poiLayer = null; // LayerGroup for POIs
let osmLayers = {}; // Dictionary of LayerGroups for OSM Data (Category -> Layer)
let trailLayer = null;
let activePointLabel = null;
let pointMarkers = [];
let permanentTimestampLabels = [];
let trackPoints = [];

// Initialize Map
function initMap() {
    try {
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            throw new Error('Map element not found!');
        }

        if (typeof L === 'undefined') {
            throw new Error('Leaflet library not loaded!');
        }

        if (typeof tileProviders === 'undefined' || !tileProviders || !tileProviders.length) {
            throw new Error('Tile Providers configuration missing!');
        }

        // Check if map is already initialized
        if (map !== null) {
            console.warn('Map already initialized, destroying existing instance...');
            map.remove();
            map = null;
        } else {
            // Safety check for Leaflet's internal ID on the container
            // This handles cases where 'map' var is lost but DOM is still bound
            if (mapElement._leaflet_id) {
                console.warn('Map container has incomplete state, forcing cleanup...');
                mapElement._leaflet_id = null;
                mapElement.innerHTML = '';
            }
        }

        map = L.map('map').setView([50.5, 10.5], 6);

        // Add default tile layer
        currentTileLayer = L.tileLayer(tileProviders[0].url, {
            attribution: tileProviders[0].attribution,
            maxZoom: 19
        }).addTo(map);

        // Click on map to hide timestamp label
        map.on('click', function () {
            if (activePointLabel) {
                map.removeLayer(activePointLabel);
                activePointLabel = null;
            }
        });

        console.log('Map initialized successfully');
        return true;
    } catch (error) {
        console.error('FATAL: Map initialization failed:', error);
        alert('Map error: ' + error.message);
        return false;
    }
}

// Update Language
function updateLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;

    // Update all translatable elements
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    // Update title
    document.getElementById('app-title').textContent = translations[lang].title;
    document.title = translations[lang].title;

    // v20: Update heatmap scheme labels
    updateHeatmapSchemeLabels();
}

/**
 * UPDATE HEATMAP SCHEME LABELS v20
 * Make heatmap descriptions multilingual
 */
function updateHeatmapSchemeLabels() {
    try {
        const schemeSelect = document.getElementById('heatmap-scheme');
        if (!schemeSelect) return;

        const lang = currentLang || 'en';
        const schemeLabels = heatmapSchemeTranslations[lang] || heatmapSchemeTranslations.en;

        // Update each option
        const options = schemeSelect.querySelectorAll('option');
        options.forEach(option => {
            const scheme = option.value === 'default' ? 'fire' : option.value;
            if (schemeLabels[scheme]) {
                option.textContent = schemeLabels[scheme];
            }
        });

        console.log('Heatmap scheme labels updated for:', lang);
    } catch (e) {
        console.error('Error updating scheme labels:', e);
    }
}

// Show Notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

/**
 * Show Welcome Toast on First Visit
 * Uses localStorage to track if user has seen the welcome message
 */
function showWelcomeToast() {
    try {
        const welcomeKey = 'gps_track_viewer_welcomed';

        // Check if user has already seen the welcome message
        if (localStorage.getItem(welcomeKey)) {
            console.log('Welcome toast already shown');
            return;
        }

        // Get welcome content for current language
        const lang = currentLang || 'en';
        const content = welcomeToastContent[lang] || welcomeToastContent.en;

        // Create welcome toast element
        const welcomeToast = document.createElement('div');
        welcomeToast.id = 'welcome-toast';
        welcomeToast.innerHTML = `
            <div class="welcome-toast-content">
                <button id="welcome-close" class="welcome-close">&times;</button>
                <h3>${content.title}</h3>
                <p>${content.description}</p>
                <button id="welcome-got-it" class="welcome-got-it">Got it!</button>
            </div>
        `;

        // Style the welcome toast
        welcomeToast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10000;
            background: var(--bg-secondary, #2d2d2d);
            border-radius: 16px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            animation: welcomeFadeIn 0.4s ease-out;
            border: 1px solid var(--border-color, #444);
        `;

        // Add animation and additional styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes welcomeFadeIn {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
            #welcome-toast h3 {
                margin: 0 0 15px 0;
                font-size: 24px;
                color: var(--text-primary, #fff);
            }
            #welcome-toast p {
                margin: 0 0 25px 0;
                font-size: 15px;
                line-height: 1.6;
                color: var(--text-secondary, #aaa);
            }
            #welcome-toast .welcome-close {
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                color: var(--text-secondary, #aaa);
                font-size: 28px;
                cursor: pointer;
                line-height: 1;
                padding: 0;
            }
            #welcome-toast .welcome-close:hover {
                color: var(--text-primary, #fff);
            }
            #welcome-toast .welcome-got-it {
                background: linear-gradient(135deg, #007bff, #0056b3);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            #welcome-toast .welcome-got-it:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 20px rgba(0,123,255,0.4);
            }
            .welcome-toast-content {
                position: relative;
            }
            #welcome-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.6);
                z-index: 9999;
            }
        `;
        document.head.appendChild(style);

        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.id = 'welcome-backdrop';
        document.body.appendChild(backdrop);
        document.body.appendChild(welcomeToast);

        // Close function
        function closeWelcome() {
            localStorage.setItem(welcomeKey, 'true');
            welcomeToast.remove();
            backdrop.remove();
            console.log('Welcome toast closed');
        }

        // Event listeners
        document.getElementById('welcome-close').addEventListener('click', closeWelcome);
        document.getElementById('welcome-got-it').addEventListener('click', closeWelcome);
        backdrop.addEventListener('click', closeWelcome);

        console.log('Welcome toast displayed');
    } catch (e) {
        console.error('Error showing welcome toast:', e);
    }
}

// Show/Hide Loading
function setLoading(isLoading) {
    const overlay = document.getElementById('loading-overlay');
    const loadingProgress = document.getElementById('loading-progress');
    const loadingProgressBar = document.getElementById('loading-progress-bar');
    const loadingCounter = document.getElementById('loading-counter');

    if (isLoading) {
        overlay.classList.add('active');
        // Reset progress bar
        if (loadingProgress) loadingProgress.style.display = 'none';
        if (loadingProgressBar) loadingProgressBar.style.width = '0%';
        if (loadingCounter) loadingCounter.textContent = '0 / 0';
    } else {
        overlay.classList.remove('active');
        // Hide progress bar
        if (loadingProgress) loadingProgress.style.display = 'none';
    }
}



// Convert DMS to Decimal Degrees
function dmsToDecimal(dms, ref) {
    if (typeof dms === 'number') return ref === 'S' || ref === 'W' ? -dms : dms;

    let decimal = dms[0] + dms[1] / 60 + dms[2] / 3600;
    if (ref === 'S' || ref === 'W') decimal = -decimal;
    return decimal;
}

// Haversine Distance Formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Calculate bearing between two points
function calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
        Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

/**
 * SECURITY v19: Sanitize numeric parameters
 */
function sanitizeNumber(value, min, max, defaultVal) {
    try {
        const num = parseFloat(value);

        if (isNaN(num) || !isFinite(num)) {
            console.warn('Invalid number:', value);
            return defaultVal;
        }

        if (num < min) return min;
        if (num > max) return max;

        return num;
    } catch (e) {
        console.error('Error sanitizing number:', e);
        return defaultVal;
    }
}

/**
 * SECURITY v19: Sanitize integer parameters
 */
function sanitizeInteger(value, min, max, defaultVal) {
    try {
        const num = parseInt(value, 10);

        if (isNaN(num) || !isFinite(num)) {
            console.warn('Invalid integer:', value);
            return defaultVal;
        }

        if (num < min) return min;
        if (num > max) return max;

        return num;
    } catch (e) {
        console.error('Error sanitizing integer:', e);
        return defaultVal;
    }
}

/**
 * SECURITY v19: Validate heatmap parameters
 */
function validateHeatmapParams(intensity, radius, blur, opacity) {
    try {
        if (!isFinite(intensity) || intensity < 0.1 || intensity > 2.0) return false;
        if (!isFinite(radius) || radius < 10 || radius > 100) return false;
        if (!isFinite(blur) || blur < 10 || blur > 100) return false;
        if (!isFinite(opacity) || opacity < 0 || opacity > 1) return false;
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * SECURITY v21: Strict language validation
 */
function isValidLanguage(lang) {
    try {
        if (!lang || typeof lang !== 'string') return false;

        const validLanguages = ['en', 'de', 'it', 'hr', 'pl', 'es', 'uk', 'nl', 'sv', 'no', 'by'];
        return validLanguages.includes(lang.toLowerCase());
    } catch (e) {
        console.error('Error validating language:', e);
        return false;
    }
}

/**
 * SECURITY v21: Safe language setting with fallback
 */
function setLanguageSafe(lang) {
    try {
        if (!isValidLanguage(lang)) {
            console.warn('Invalid language:', lang, '- Using English');
            currentLang = 'en';
            return false;
        }

        currentLang = lang;
        return true;
    } catch (e) {
        console.error('Error setting language:', e);
        currentLang = 'en';
        return false;
    }
}

/**
 * SECURITY v21: Sanitize file batch before processing
 */
function sanitizeBatch(files) {
    try {
        if (!files || !Array.isArray(files)) {
            console.warn('Invalid batch');
            return [];
        }

        const sanitized = [];

        for (let i = 0; i < Math.min(files.length, FILE_UPLOAD_CONFIG.MAX_FILES_BATCH); i++) {
            const file = files[i];

            // Skip non-File objects
            if (!(file instanceof File)) {
                console.warn('Skipping non-File at index', i);
                continue;
            }

            // Validate file
            if (validateImageFile(file)) {
                sanitized.push(file);
            }
        }

        return sanitized;
    } catch (e) {
        console.error('Error sanitizing batch:', e);
        return [];
    }
}

/**
 * SECURITY v21: Safe chunk processing with memory checks
 */
async function processChunkSafely(chunk) {
    try {
        // Check memory before processing
        if (!checkMemoryUsage()) {
            console.warn('Memory limit approached');
            return [];
        }

        const results = { valid: [], orphaned: [] };

        for (const file of chunk) {
            try {
                const exifData = await exifr.parse(file, {
                    gps: true,
                    tiff: true,
                    pick: ['GPSLatitude', 'GPSLongitude', 'GPSLatitudeRef', 'GPSLongitudeRef', 'GPSAltitude', 'GPSAltitudeRef', 'DateTimeOriginal']
                });

                if (exifData) {
                    const timestamp = exifData.DateTimeOriginal || null;
                    const safeName = file.name.replace(/[<>\"\'/\\\\]/g, '');

                    if (exifData.latitude && exifData.longitude && validateCoordinates(exifData.latitude, exifData.longitude)) {
                        const altitude = exifData.GPSAltitude || null;
                        if (validateAltitude(altitude)) {
                            results.valid.push({
                                lat: parseFloat(exifData.latitude),
                                lng: parseFloat(exifData.longitude),
                                altitude: altitude,
                                timestamp: timestamp,
                                file: file,
                                fileName: safeName
                            });
                        }
                    } else if (timestamp) {
                        // valid timestamp but no GPS -> Orphaned
                        results.orphaned.push({
                            timestamp: timestamp,
                            file: file,
                            fileName: safeName
                        });
                    }
                }
            } catch (e) {
                console.warn('Error processing file:', file.name);
                continue;
            }
        }

        return results; // { valid: [], orphaned: [] }
    } catch (e) {
        console.error('Error processing chunk:', e);
        return { valid: [], orphaned: [] };
    }
}

/**
 * Sync orphaned photos to track
 */
function syncPhotosToTrack() {
    try {
        if (orphanedPhotos.length === 0 || gpsPoints.length === 0) return;

        console.log(`Syncing ${orphanedPhotos.length} photos to track...`);

        // Filter only track points that have timestamps
        const trackPoints = gpsPoints.filter(p => p.isTrackPoint && p.timestamp);

        if (trackPoints.length === 0) return;

        // Sort track points by time
        trackPoints.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const newlySynced = [];
        const remainingOrphans = [];

        orphanedPhotos.forEach(photo => {
            const photoTime = new Date(photo.timestamp).getTime();

            // Find surrounding points
            let before = null;
            let after = null;

            // Simple linear search (optimize to binary search for massive datasets)
            for (let i = 0; i < trackPoints.length; i++) {
                const ptTime = new Date(trackPoints[i].timestamp).getTime();
                if (ptTime <= photoTime) {
                    before = trackPoints[i];
                } else {
                    after = trackPoints[i];
                    break;
                }
            }

            if (before && after) {
                // Interpolate
                const t1 = new Date(before.timestamp).getTime();
                const t2 = new Date(after.timestamp).getTime();
                const factor = (photoTime - t1) / (t2 - t1);

                const lat = before.lat + (after.lat - before.lat) * factor;
                const lng = before.lng + (after.lng - before.lng) * factor;
                const ele = (before.altitude && after.altitude)
                    ? before.altitude + (after.altitude - before.altitude) * factor
                    : (before.altitude || null);

                // Add to synced
                newlySynced.push({
                    lat: lat,
                    lng: lng,
                    altitude: ele,
                    timestamp: photo.timestamp,
                    file: photo.file,
                    fileName: photo.fileName,
                    interpolated: true
                });
            } else if (before && (photoTime - new Date(before.timestamp).getTime() < 300000)) {
                // Within 5 mins of end of track
                newlySynced.push({
                    lat: before.lat,
                    lng: before.lng,
                    altitude: before.altitude,
                    timestamp: photo.timestamp,
                    file: photo.file,
                    fileName: photo.fileName,
                    interpolated: true
                });
            } else if (after && (new Date(after.timestamp).getTime() - photoTime < 300000)) {
                // Within 5 mins of start of track
                newlySynced.push({
                    lat: after.lat,
                    lng: after.lng,
                    altitude: after.altitude,
                    timestamp: photo.timestamp,
                    file: photo.file,
                    fileName: photo.fileName,
                    interpolated: true
                });
            } else {
                remainingOrphans.push(photo);
            }
        });

        if (newlySynced.length > 0) {
            console.log(`Synced ${newlySynced.length} photos.`);

            // Update state
            gpsPoints = gpsPoints.concat(newlySynced);
            orphanedPhotos = remainingOrphans; // Remove synced

            // Sort
            gpsPoints.sort((a, b) => {
                return new Date(a.timestamp) - new Date(b.timestamp);
            });

            // Recalculate distance
            let totalDistance = 0;
            for (let i = 0; i < gpsPoints.length; i++) {
                if (i === 0) {
                    gpsPoints[i].distance = 0;
                } else {
                    const dist = calculateDistance(
                        gpsPoints[i - 1].lat, gpsPoints[i - 1].lng,
                        gpsPoints[i].lat, gpsPoints[i].lng
                    );
                    totalDistance += dist;
                    gpsPoints[i].distance = totalDistance;
                }
            }

            // Update UI
            updateVisualization();
            updateStatistics();
            generateTimeline();

            // Update counters
            const gpsImagesEl = document.getElementById('gps-images');
            if (gpsImagesEl) gpsImagesEl.textContent = gpsPoints.length;

            showNotification(`Synced ${newlySynced.length} photos to track`, 'success');
        }

    } catch (e) {
        console.error('Error syncing photos:', e);
    }
}

/**
 * SECURITY v21: Comprehensive batch data validation
 */
function validateBatchData(data) {
    try {
        if (!Array.isArray(data)) return false;

        for (const item of data) {
            if (!validateCoordinates(item.lat, item.lng)) {
                console.warn('Invalid coordinates in batch');
                return false;
            }
            if (!validateAltitude(item.altitude)) {
                console.warn('Invalid altitude in batch');
                return false;
            }
        }

        return true;
    } catch (e) {
        console.error('Error validating batch data:', e);
        return false;
    }
}

/**
 * SECURITY v21: Safe error reporting
 */
function reportError(context, error) {
    try {
        console.error(`Error in ${context}:`, error?.message);
        // Never log full error object or stack trace
    } catch (e) {
        // Silent catch
    }
}

/**
 * SECURITY v21: User-friendly error messages
 */
function getUserFriendlyError(error) {
    try {
        const msg = error?.message || 'Unknown error';

        if (msg.includes('memory')) {
            return 'Too many images loaded. Please clear some and try again.';
        }
        if (msg.includes('file')) {
            return 'Invalid file. Please check file format and size.';
        }
        if (msg.includes('gps')) {
            return 'This image does not contain GPS data.';
        }

        return 'An error occurred. Please try again.';
    } catch (e) {
        return 'An error occurred.';
    }
}

/**
 * SECURITY v21: Validate individual file
 */
function validateImageFile(file) {
    try {
        // Validate file object
        if (!file || !(file instanceof File)) {
            console.warn('Invalid file object');
            return false;
        }

        // Validate file size
        if (file.size < FILE_UPLOAD_CONFIG.MIN_FILE_SIZE) {
            console.warn('File too small:', file.name);
            return false;
        }

        if (file.size > FILE_UPLOAD_CONFIG.MAX_FILE_SIZE) {
            console.warn('File too large:', file.name, 'Max:', FILE_UPLOAD_CONFIG.MAX_FILE_SIZE);
            return false;
        }

        // Validate MIME type
        if (!FILE_UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type.toLowerCase())) {
            console.warn('Invalid MIME type:', file.type);
            return false;
        }

        // Validate file extension
        const fileName = file.name.toLowerCase();
        const hasValidExtension = FILE_UPLOAD_CONFIG.ALLOWED_EXTENSIONS.some(ext =>
            fileName.endsWith(ext)
        );

        if (!hasValidExtension) {
            console.warn('Invalid file extension:', file.name);
            return false;
        }

        return true;
    } catch (e) {
        console.error('Error validating file:', e.message);
        return false;
    }
}

/**
 * SECURITY v21: Validate batch of files (FIXED LIMIT)
 */
function validateFileBatch(files) {
    try {
        if (!files || !Array.isArray(files)) {
            console.warn('Invalid files array');
            return false;
        }

        // Check total count
        const totalCount = (gpsPoints?.length || 0) + files.length;
        if (totalCount > FILE_UPLOAD_CONFIG.MAX_TOTAL_FILES) {
            console.warn('Total files exceed limit:', totalCount, 'Max:', FILE_UPLOAD_CONFIG.MAX_TOTAL_FILES);
            alert(`Maximum ${FILE_UPLOAD_CONFIG.MAX_TOTAL_FILES} images allowed. Current: ${totalCount}`);
            return false;
        }

        // Check batch size - FIXED to 10,000
        if (files.length > FILE_UPLOAD_CONFIG.MAX_FILES_BATCH) {
            console.warn('Batch too large:', files.length, 'Max per batch:', FILE_UPLOAD_CONFIG.MAX_FILES_BATCH);
            alert(`Maximum ${FILE_UPLOAD_CONFIG.MAX_FILES_BATCH} images per upload. You selected ${files.length}`);
            return false;
        }

        // Validate each file
        const invalidFiles = [];
        for (let i = 0; i < files.length; i++) {
            if (!validateImageFile(files[i])) {
                invalidFiles.push(files[i].name);
            }
        }

        if (invalidFiles.length > 0) {
            console.warn('Invalid files:', invalidFiles);
            alert(`${invalidFiles.length} invalid files:\n${invalidFiles.slice(0, 5).join(', ')}${invalidFiles.length > 5 ? '...' : ''}`);
            return false;
        }

        return true;
    } catch (e) {
        console.error('Error validating batch:', e.message);
        return false;
    }
}

/**
 * MEMORY MONITORING v21
 */
function checkMemoryUsage() {
    try {
        if (performance.memory) {
            const usedMemory = performance.memory.usedJSHeapSize / (1024 * 1024);
            const maxMemory = performance.memory.jsHeapSizeLimit / (1024 * 1024);

            console.log(`Memory: ${usedMemory.toFixed(1)}MB / ${maxMemory.toFixed(1)}MB`);

            if (usedMemory > FILE_UPLOAD_CONFIG.MAX_MEMORY_MB) {
                console.warn('Memory usage high:', usedMemory.toFixed(1) + 'MB');
                return false;
            }

            return true;
        }
    } catch (e) {
        console.error('Error checking memory:', e);
        return true;
    }
}

/**
 * PROGRESS UI v21 - Updates BOTH loading overlay AND sidebar progress
 */
function updateProgressUI(progress, current, total) {
    try {
        // 1. Update Loading Overlay Progress Bar
        const loadingProgress = document.getElementById('loading-progress');
        const loadingProgressBar = document.getElementById('loading-progress-bar');
        const loadingCounter = document.getElementById('loading-counter');

        if (loadingProgress && loadingProgressBar && loadingCounter) {
            loadingProgress.style.display = 'block';
            loadingProgressBar.style.width = progress + '%';
            loadingCounter.textContent = `${current} / ${total}`;
        }

        // 2. Update Sidebar Progress Bar
        let progressBar = document.getElementById('upload-progress');

        if (!progressBar) {
            const statsElement = document.querySelector('.stats');
            if (statsElement) {
                progressBar = document.createElement('div');
                progressBar.id = 'upload-progress';
                progressBar.innerHTML = `
                            <div style="margin-top: 10px; padding: 10px; background-color: var(--bg-color); border-radius: 4px;">
                                <div style="font-size: 12px; margin-bottom: 5px;">
                                    <span id="progress-text">Processing...</span>
                                </div>
                                <div style="width: 100%; height: 6px; background-color: var(--border-color); border-radius: 3px; overflow: hidden;">
                                    <div id="progress-bar-fill" style="height: 100%; background-color: var(--button-blue); transition: width 0.3s ease; width: 0%;"></div>
                                </div>
                            </div>
                        `;
                statsElement.parentNode.insertBefore(progressBar, statsElement.nextSibling);
            }
        }

        const progressBarFill = document.getElementById('progress-bar-fill');
        const progressText = document.getElementById('progress-text');

        if (progressBarFill && progressText) {
            progressBarFill.style.width = progress + '%';
            progressText.textContent = `Processing: ${current} / ${total} images (${progress}%)`;
        }

        // 3. Hide progress bars when complete
        if (progress >= 100) {
            setTimeout(() => {
                if (progressBar) {
                    progressBar.style.display = 'none';
                }
                if (loadingProgress) {
                    loadingProgress.style.display = 'none';
                }
            }, 1000);
        } else {
            if (progressBar) {
                progressBar.style.display = 'block';
            }
        }
    } catch (e) {
        console.error('Error updating progress:', e.message);
    }
}

// Security: Validate coordinates
function validateCoordinates(lat, lng) {
    return typeof lat === 'number' && typeof lng === 'number' &&
        isFinite(lat) && isFinite(lng) &&
        lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

// Security: Validate altitude
function validateAltitude(alt) {
    if (alt === null || alt === undefined) return true;
    return typeof alt === 'number' && isFinite(alt) && alt >= -500 && alt <= 9000;
}

// Security: Validate timestamp
function validateTimestamp(timestamp) {
    if (!timestamp) return true;
    try {
        const date = new Date(timestamp);
        const now = new Date();
        const minDate = new Date('1990-01-01');
        return !isNaN(date.getTime()) && date >= minDate && date <= now;
    } catch (e) {
        return false;
    }
}

/**
 * Process a chunk of images safely
 * Returns { valid: [], orphaned: [] }
 */
async function processChunkSafely(files) {
    const results = {
        valid: [],
        orphaned: []
    };

    const promises = files.map(async (file) => {
        try {
            const exifData = await exifr.parse(file, {
                gps: true,
                tiff: true,
                exif: true
            });

            if (exifData) {
                // Check for valid GPS
                if (exifData.latitude && exifData.longitude &&
                    validateCoordinates(exifData.latitude, exifData.longitude)) {

                    // Robust Altitude Parsing
                    let cleanAltitude = null;
                    const rawAltitude = exifData.altitude !== undefined ? exifData.altitude : exifData.GPSAltitude;

                    // DEBUG: Log altitude candidate
                    if (Math.random() < 0.01) {
                        console.log('DEBUG [EXIF]: Altitude Check', {
                            file: file.name,
                            altitude: exifData.altitude,
                            GPSAltitude: exifData.GPSAltitude,
                            rawAltitude
                        });
                    }

                    if (rawAltitude !== null && rawAltitude !== undefined) {
                        const parsedAlt = parseFloat(rawAltitude);
                        if (!isNaN(parsedAlt) && isFinite(parsedAlt) && parsedAlt >= -500 && parsedAlt <= 9000) {
                            cleanAltitude = parsedAlt;
                        }
                    }

                    results.valid.push({
                        lat: exifData.latitude,
                        lng: exifData.longitude,
                        altitude: cleanAltitude,
                        timestamp: validateTimestamp(exifData.DateTimeOriginal) ? new Date(exifData.DateTimeOriginal).toISOString() : null,
                        file: file,
                        fileName: file.name
                    });
                }
                // Check for Orphaned (Timestamp but no GPS)
                else if (exifData.DateTimeOriginal && validateTimestamp(exifData.DateTimeOriginal)) {
                    results.orphaned.push({
                        timestamp: new Date(exifData.DateTimeOriginal).toISOString(),
                        file: file,
                        fileName: file.name
                    });
                }
            }
        } catch (e) {
            console.warn(`Error processing file ${file.name}:`, e.message);
        }
    });

    await Promise.all(promises);
    return results;
}

/**
 * CHUNKED PROCESSING v21
 * Process images in chunks for better performance
 * Supports up to 10,000 images per batch
 */
async function processImagesInChunks(files, chunkSize = 50) {
    try {
        const chunks = [];
        for (let i = 0; i < files.length; i += chunkSize) {
            chunks.push(files.slice(i, i + chunkSize));
        }

        let processedCount = 0;
        let validPoints = [];
        let orphanedPoints = [];

        for (const chunk of chunks) {
            const chunkResults = await processChunkSafely(chunk);

            // processChunkSafely now returns { valid: [], orphaned: [] }
            // But we need to handle legacy/fallback return if something fails
            if (chunkResults.valid) {
                validPoints = validPoints.concat(chunkResults.valid);
                orphanedPoints = orphanedPoints.concat(chunkResults.orphaned);
            } else if (Array.isArray(chunkResults)) {
                // Fallback for old behaviour (should only happen if processChunkSafely wasn't updated correctly, but safety first)
                validPoints = validPoints.concat(chunkResults);
            }

            processedCount += chunk.length; // Approximate
            const progress = Math.round((processedCount / files.length) * 100);
            updateProgressUI(progress, processedCount, files.length);

            // Allow browser to breathe
            await new Promise(resolve => setTimeout(resolve, 100));

            // Check memory
            checkMemoryUsage();
        }

        return { validPoints, orphanedPoints };
    } catch (e) {
        console.error('Error processing chunks:', e.message);
        return { validPoints: [], orphanedPoints: [] };
    }
}

/**
 * FILE UPLOAD ORCHESTRATOR v21
 * Handles both images and track files
 */
async function handleFileUpload(files) {
    try {
        if (!files || files.length === 0) return;

        const filesArray = Array.from(files);
        const imageFilesList = [];
        const trackFilesList = [];

        for (const file of filesArray) {
            // Check if it's a track file based on extension
            const ext = '.' + file.name.split('.').pop().toLowerCase();
            if (FILE_UPLOAD_CONFIG.ALLOWED_TRACK_EXTENSIONS.includes(ext)) {
                trackFilesList.push(file);
            } else {
                // Assume it's an image (validation happens later)
                imageFilesList.push(file);
            }
        }

        // Process images
        if (imageFilesList.length > 0) {
            await extractGPSFromImages(imageFilesList);
        }

        // Process tracks
        if (trackFilesList.length > 0) {
            await processTrackFiles(trackFilesList);
        }

    } catch (e) {
        console.error('Error handling file upload:', e);
        showNotification('Error uploading files: ' + e.message, 'error');
    }
}

/**
 * Process Track Files (GPX, KML, JSON)
 */
async function processTrackFiles(files) {
    try {
        setLoading(true);
        console.log(`Processing ${files.length} track files...`);

        const validPoints = await trackParser.parseFiles(files);

        // Mark points as coming from a track
        const labeledPoints = validPoints.map(p => ({ ...p, isTrackPoint: true }));

        if (labeledPoints && labeledPoints.length > 0) {
            // Append new points
            gpsPoints = gpsPoints.concat(labeledPoints);

            // Sort by timestamp if available
            gpsPoints.sort((a, b) => {
                if (a.timestamp && b.timestamp) {
                    return new Date(a.timestamp) - new Date(b.timestamp);
                }
                return 0;
            });

            // Attempt to sync any orphaned photos
            setTimeout(syncPhotosToTrack, 500);

            // Recalculate cumulative distances for ALL points
            let totalDistance = 0;
            for (let i = 0; i < gpsPoints.length; i++) {
                if (i === 0) {
                    gpsPoints[i].distance = 0;
                } else {
                    const dist = calculateDistance(
                        gpsPoints[i - 1].lat, gpsPoints[i - 1].lng,
                        gpsPoints[i].lat, gpsPoints[i].lng
                    );
                    totalDistance += dist;
                    gpsPoints[i].distance = totalDistance;
                }
            }

            // Update UI
            updateVisualization();
            updateStatistics();
            generateTimeline();

            // Update stats counters
            const gpsImagesEl = document.getElementById('gps-images');
            if (gpsImagesEl) {
                gpsImagesEl.textContent = gpsPoints.length;
            }

            setTimeout(() => {
                updateElevationProfile();
            }, 300);

            showNotification(`Imported ${validPoints.length} points from tracks`, 'success');
        } else {
            showNotification('No valid track points found', 'warning');
        }

        setLoading(false);
    } catch (e) {
        console.error('Error processing tracks:', e);
        setLoading(false);
        showNotification(e.message, 'error');
    }
}

// Extract GPS from Images v21 (with chunked processing, 10k batch support)
async function extractGPSFromImages(files) {
    try {
        if (!files || files.length === 0) {
            showNotification('No files selected', 'warning');
            return;
        }

        // Convert FileList to Array
        const filesArray = Array.from(files);

        // SECURITY v20: Validate batch
        if (!validateFileBatch(filesArray)) {
            return;
        }

        imageFiles = files;
        setLoading(true);

        console.log(`=== Processing ${filesArray.length} images ===`);

        // Process in chunks
        const results = await processImagesInChunks(filesArray);
        const validPoints = results.validPoints || [];
        const newOrphaned = results.orphanedPoints || [];

        // Add to existing points
        gpsPoints = gpsPoints.concat(validPoints);
        orphanedPhotos = orphanedPhotos.concat(newOrphaned);

        let totalImages = filesArray.length;
        let imagesWithGPS = validPoints.length;

        // Update stats - FIXED
        const totalImagesEl = document.getElementById('total-images');
        const gpsImagesEl = document.getElementById('gps-images');

        if (totalImagesEl) {
            const currentTotal = parseInt(totalImagesEl.textContent) || 0;
            totalImagesEl.textContent = currentTotal + totalImages;
        }

        if (gpsImagesEl) {
            gpsImagesEl.textContent = gpsPoints.length;
        }

        setLoading(false);

        if (imagesWithGPS === 0 && newOrphaned.length === 0) {
            showNotification(translations[currentLang].no_gps_warning, 'warning');
        } else if (newOrphaned.length > 0) {
            showNotification(`Processed ${imagesWithGPS} GPS images. Found ${newOrphaned.length} images to sync.`, 'info');
            // Try auto-sync
            setTimeout(syncPhotosToTrack, 500);
        } else if (imagesWithGPS < totalImages) {
            showNotification(translations[currentLang].no_gps_warning, 'warning');
        }

        if (gpsPoints.length > 0) {

            // Sort by timestamp if available
            gpsPoints.sort((a, b) => {
                if (a.timestamp && b.timestamp) {
                    return new Date(a.timestamp) - new Date(b.timestamp);
                }
                return 0;
            });

            // Calculate cumulative distances
            let totalDistance = 0;
            for (let i = 0; i < gpsPoints.length; i++) {
                if (i === 0) {
                    gpsPoints[i].distance = 0;
                } else {
                    const dist = calculateDistance(
                        gpsPoints[i - 1].lat, gpsPoints[i - 1].lng,
                        gpsPoints[i].lat, gpsPoints[i].lng
                    );
                    totalDistance += dist;
                    gpsPoints[i].distance = totalDistance;
                }
            }

            updateVisualization();
            updateStatistics();
            generateTimeline();

            // Generate elevation profile LAST (after DOM updates)
            setTimeout(() => {
                updateElevationProfile();
            }, 300);

            console.log(`=== Successfully processed ${imagesWithGPS} images with GPS data ===`);
            showNotification(`Processed ${imagesWithGPS} images successfully`, 'success');
        }
    } catch (error) {
        console.error('Error extracting GPS from images:', error);
        setLoading(false);
        showNotification('Error processing images: ' + error.message, 'error');
    }
}

// Update Statistics
function updateStatistics() {
    try {
        if (!gpsPoints || gpsPoints.length === 0) return;

        // Total distance
        const totalDistance = gpsPoints[gpsPoints.length - 1].distance || 0;
        document.getElementById('stat-distance').textContent = totalDistance.toFixed(2) + ' km';

        // Total points
        document.getElementById('stat-points').textContent = gpsPoints.length;

        // Duration and speed
        const firstTimestamp = gpsPoints[0].timestamp;
        const lastTimestamp = gpsPoints[gpsPoints.length - 1].timestamp;

        if (firstTimestamp && lastTimestamp) {
            const duration = new Date(lastTimestamp) - new Date(firstTimestamp);
            const hours = Math.floor(duration / 3600000);
            const minutes = Math.floor((duration % 3600000) / 60000);
            document.getElementById('stat-duration').textContent = `${hours}h ${minutes}m`;

            if (duration > 0) {
                const avgSpeed = (totalDistance / (duration / 3600000)).toFixed(1);
                document.getElementById('stat-speed').textContent = avgSpeed + ' km/h';
            }
        }

        // Elevation gain/loss
        let elevationGain = 0;
        let elevationLoss = 0;
        for (let i = 1; i < gpsPoints.length; i++) {
            if (gpsPoints[i].altitude && gpsPoints[i - 1].altitude) {
                const diff = gpsPoints[i].altitude - gpsPoints[i - 1].altitude;
                if (diff > 0) elevationGain += diff;
                else elevationLoss += Math.abs(diff);
            }
        }

        if (elevationGain > 0 || elevationLoss > 0) {
            document.getElementById('stat-elevation-gain').textContent = elevationGain.toFixed(0) + ' m';
            document.getElementById('stat-elevation-loss').textContent = elevationLoss.toFixed(0) + ' m';
        }

        console.log('Statistics updated successfully');
    } catch (error) {
        console.error('Error updating statistics:', error);
    }
}

// Global elevation data for click handling
let elevationData = null;

/**
 * Generate Elevation Profile - COMPLETE REWRITE
 * Fixed: No jumping, clickable, smooth display
 */
window.updateElevationProfile = generateElevationProfile; // Alias for backward compatibility
function generateElevationProfile() {
    try {
        console.log('Generating elevation profile...');

        // Validate track data
        if (!gpsPoints || !Array.isArray(gpsPoints) || gpsPoints.length < 2) {
            console.log('Not enough track points for elevation profile');
            // Show NO DATA state, do NOT hide the section
            document.getElementById('elevation-details').style.display = 'block';
            document.getElementById('elevation-no-data').style.display = 'block';
            document.getElementById('elevation-chart-wrapper').style.display = 'none';
            document.querySelector('.elevation-stats').style.display = 'none';
            return false;
        }

        // Filter points with altitude data
        const pointsWithAltitude = gpsPoints.filter(p =>
            p.altitude !== undefined &&
            p.altitude !== null &&
            !isNaN(p.altitude)
        );

        // DEBUG: Check why points are failing
        if (gpsPoints.length > 0 && pointsWithAltitude.length === 0) {
            console.log('DEBUG [Elevation]: Points rejected. Sample of first 3 points:', gpsPoints.slice(0, 3));
            console.log('DEBUG [Elevation]: Check logic:', {
                p0_alt: gpsPoints[0].altitude,
                isDef: gpsPoints[0].altitude !== undefined,
                isNotNull: gpsPoints[0].altitude !== null,
                isNotNaN: !isNaN(gpsPoints[0].altitude)
            });
        }

        if (pointsWithAltitude.length < 2) {
            console.log('Not enough altitude data');
            document.getElementById('elevation-details').style.display = 'block';
            document.getElementById('elevation-no-data').style.display = 'block';
            document.getElementById('elevation-chart-wrapper').style.display = 'none';
            document.querySelector('.elevation-stats').style.display = 'none';
            return false;
        }

        // Calculate cumulative distances
        const distances = [0];
        for (let i = 1; i < gpsPoints.length; i++) {
            const dist = distances[i - 1] + calculateDistance(
                gpsPoints[i - 1].lat,
                gpsPoints[i - 1].lng,
                gpsPoints[i].lat,
                gpsPoints[i].lng
            );
            distances.push(dist);
        }

        // Calculate elevation statistics
        const elevations = gpsPoints.map(p => p.altitude || 0);
        const minElev = Math.min(...elevations);
        const maxElev = Math.max(...elevations);

        let totalGain = 0;
        let totalLoss = 0;
        for (let i = 1; i < elevations.length; i++) {
            const diff = elevations[i] - elevations[i - 1];
            if (diff > 0) totalGain += diff;
            else if (diff < 0) totalLoss += Math.abs(diff);
        }

        // Store elevation data for click handling
        elevationData = {
            distances: distances,
            elevations: elevations,
            trackPoints: gpsPoints
        };

        // Update statistics
        document.getElementById('elevation-gain').textContent = totalGain.toFixed(0) + ' m';
        document.getElementById('elevation-loss').textContent = totalLoss.toFixed(0) + ' m';
        document.getElementById('min-elevation').textContent = minElev.toFixed(1) + ' m';
        document.getElementById('max-elevation').textContent = maxElev.toFixed(1) + ' m';

        // Show/Hide Elevation UI elements
        const noDataEl = document.getElementById('elevation-no-data');
        const chartWrapper = document.getElementById('elevation-chart-wrapper');
        const statsEl = document.querySelector('.elevation-stats');

        if (noDataEl) noDataEl.style.display = 'none';
        if (chartWrapper) chartWrapper.style.display = 'block';
        if (statsEl) statsEl.style.display = 'flex'; // It was flex in CSS

        // Ensure parent is visible (just in case)
        const parentDetails = document.getElementById('elevation-details');
        if (parentDetails) parentDetails.style.display = 'block';

        // Create chart after element is visible
        setTimeout(() => {
            createElevationChart(distances, elevations);
        }, 100);

        console.log('Elevation profile generated successfully');
        return true;
    } catch (e) {
        console.error('Error generating elevation profile:', e);
        return false;
    }
}

/**
 * Create Chart.js elevation profile with click navigation
 */

/**
 * Initialize Chart.js - verify library loaded
 */
function initChart() {
    try {
        if (typeof Chart === 'undefined') {
            console.error('Chart.js library not loaded');
            return false;
        }
        console.log('Chart.js initialized successfully');
        return true;
    } catch (e) {
        console.error('Error initializing Chart.js:', e);
        return false;
    }
}

/**
 * Get chart colors based on current theme
 */
function getChartColors() {
    const isDark = document.body.classList.contains('dark-mode');
    return {
        grid: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
        text: isDark ? '#e0e0e0' : '#666666',
        title: isDark ? '#ffffff' : '#333333'
    };
}

/**
 * Update chart theme when dark mode toggles
 */
function updateChartTheme() {
    if (!elevationChart) return;

    const colors = getChartColors();
    const options = elevationChart.options;

    // Update Scales
    if (options.scales.x) {
        options.scales.x.grid.color = colors.grid;
        options.scales.x.ticks.color = colors.text;
        options.scales.x.title.color = colors.text;
    }

    if (options.scales.y) {
        options.scales.y.grid.color = colors.grid;
        options.scales.y.ticks.color = colors.text;
        options.scales.y.title.color = colors.text;
    }

    // Update Legend
    if (options.plugins.legend) {
        options.plugins.legend.labels.color = colors.text;
    }

    elevationChart.update();
}

function createElevationChart(distances, elevations) {
    try {
        console.log('createElevationChart called', {
            distancesLength: distances ? distances.length : 'null',
            elevationsLength: elevations ? elevations.length : 'null',
            elevationSample: elevations ? elevations.slice(0, 5) : 'null'
        });

        const ctx = document.getElementById('elevation-canvas');

        if (!ctx) {
            console.error('Elevation canvas not found');
            return false;
        }

        // Destroy existing chart
        if (elevationChart) {
            console.log('Destroying existing chart');
            elevationChart.destroy();
            elevationChart = null;
        }

        if (!distances || !elevations || distances.length === 0) {
            console.error('Data invalid for chart creation');
            return false;
        }

        // Prepare chart data
        const chartData = {
            labels: distances.map((d, i) => {
                if (i % Math.max(1, Math.floor(distances.length / 10)) === 0) {
                    return d.toFixed(1) + 'km';
                }
                return '';
            }),
            datasets: [{
                label: translations[currentLang]?.elevation_profile || 'Elevation (m)',
                data: elevations,
                borderColor: '#ff7e22',
                backgroundColor: 'rgba(255, 126, 34, 0.15)',
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: '#ff7e22',
                pointBorderColor: '#fff',
                pointBorderWidth: 1
            }]
        };

        // Get colors based on current theme
        const colors = getChartColors();

        // Create chart with click handler
        elevationChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 500
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: colors.text,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            title: (context) => {
                                const index = context[0].dataIndex;
                                return `Point ${index + 1}`;
                            },
                            label: (context) => {
                                return `Elevation: ${context.parsed.y.toFixed(1)} m`;
                            },
                            afterLabel: (context) => {
                                const index = context.dataIndex;
                                if (distances && distances[index]) {
                                    return `Distance: ${distances[index].toFixed(2)} km`;
                                }
                                return '';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Elevation (m)',
                            color: colors.text
                        },
                        grid: {
                            color: colors.grid,
                            drawBorder: true
                        },
                        ticks: {
                            color: colors.text,
                            font: {
                                size: 11
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Distance (km)',
                            color: colors.text
                        },
                        grid: {
                            display: false,
                            color: colors.grid
                        },
                        ticks: {
                            color: colors.text,
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest',
                    axis: 'x'
                },
                onClick: (event, elements) => {
                    try {
                        if (elements && elements.length > 0) {
                            const index = elements[0].index;
                            console.log('Chart clicked, navigating to index:', index);
                            if (gpsPoints && gpsPoints[index]) {
                                navigateToTrackPoint(index);
                            }
                        }
                    } catch (e) {
                        console.error('Error in chart click handler:', e);
                    }
                }
            }
        });

        console.log('Elevation chart created successfully');
        return true;
    } catch (e) {
        console.error('Error creating elevation chart:', e);
        return false;
    }
}

/**
 * Navigate to track point when clicking on chart
 */
function navigateToTrackPoint(index) {
    try {
        if (!gpsPoints || index < 0 || index >= gpsPoints.length) {
            console.warn('Invalid track point index:', index);
            return false;
        }

        const point = gpsPoints[index];

        // Zoom map to point
        if (map) {
            map.setView([point.lat, point.lng], Math.max(map.getZoom(), 15));
        }

        // Highlight marker with orange circle
        const highlightMarker = L.circleMarker([point.lat, point.lng], {
            radius: 15,
            fillColor: '#ff7e22',
            color: '#fff',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.7
        }).addTo(map);

        // Show popup if marker exists
        if (markersLayer) {
            markersLayer.eachLayer(function (layer) {
                if (layer.getLatLng().lat === point.lat && layer.getLatLng().lng === point.lng) {
                    layer.openPopup();
                }
            });
        }

        // Remove highlight after 3 seconds
        setTimeout(() => {
            if (map.hasLayer(highlightMarker)) {
                map.removeLayer(highlightMarker);
            }
        }, 3000);

        console.log('Navigated to track point:', index);
        return true;
    } catch (e) {
        console.error('Error navigating to track point:', e);
        return false;
    }
}

/**
 * Update elevation profile when track data changes
 */
function updateElevationProfile() {
    try {
        if (!gpsPoints || gpsPoints.length < 2) {
            document.getElementById('elevation-details').style.display = 'none';
            return false;
        }

        return generateElevationProfile();
    } catch (e) {
        console.error('Error updating elevation profile:', e);
        return false;
    }
}

// Generate Timeline
function generateTimeline() {
    try {
        const timelineContent = document.getElementById('timeline-content');

        if (!gpsPoints || gpsPoints.length === 0) {
            timelineContent.innerHTML = `<p data-i18n="no_data" style="color: var(--text-secondary); text-align: center; padding: 20px;">${translations[currentLang].no_data}</p>`;
            return;
        }

        let timelineHTML = '<div class="timeline-container">';

        gpsPoints.forEach((point, index) => {
            const timestamp = point.timestamp;
            const dateOnly = timestamp ? new Date(timestamp).toLocaleDateString(locales[currentLang] || 'en-US') : '';
            const timeOnly = timestamp ? new Date(timestamp).toLocaleTimeString(locales[currentLang] || 'en-US') : '';

            timelineHTML += `
                    <div class="timeline-item" data-point-index="${index}">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <div class="timeline-header">
                                <span class="timeline-point-num">📍 ${translations[currentLang].point_number} ${index + 1}</span>
                                <span class="timeline-time">${timeOnly || 'N/A'}</span>
                            </div>
                            <div class="timeline-date">${dateOnly || 'No date'}</div>
                            <div class="timeline-coords">${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}</div>
                            <div class="timeline-altitude">↑ ${point.altitude ? point.altitude.toFixed(0) + ' m' : 'N/A'}</div>
                        </div>
                    </div>
                `;
        });

        timelineHTML += '</div>';
        timelineContent.innerHTML = timelineHTML;

        // Add click handlers
        document.querySelectorAll('.timeline-item').forEach(item => {
            item.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-point-index'));
                highlightPointOnMap(index);
            });
        });

        console.log('Timeline generated with', gpsPoints.length, 'points');
    } catch (error) {
        console.error('Error generating timeline:', error);
    }
}

// Highlight Point on Map
function highlightPointOnMap(index) {
    try {
        if (!gpsPoints || !gpsPoints[index]) {
            console.warn('Point at index', index, 'not found');
            return;
        }

        const point = gpsPoints[index];
        map.setView([point.lat, point.lng], Math.max(map.getZoom(), 15), { animate: true });

        // Create temporary highlight marker
        const highlightMarker = L.circleMarker([point.lat, point.lng], {
            radius: 20,
            fillColor: '#FF0000',
            color: '#FFFFFF',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.5,
            className: 'highlighted-marker'
        }).addTo(map);

        // Remove after 3 seconds
        setTimeout(() => {
            if (map.hasLayer(highlightMarker)) {
                map.removeLayer(highlightMarker);
            }
        }, 3000);

        console.log('Point', index, 'highlighted');
    } catch (error) {
        console.error('Error highlighting point:', error);
    }
}

// Update Visualization
function updateVisualization() {
    try {
        console.time('Update Visualization');

        // Validate data
        if (!gpsPoints || !Array.isArray(gpsPoints)) {
            console.warn('Invalid GPS points data');
            return;
        }

        // Remove existing layers
        if (trackLayer) map.removeLayer(trackLayer);
        if (pointsLayer) map.removeLayer(pointsLayer);
        if (markersLayer) map.removeLayer(markersLayer);
        if (arrowsLayer) map.removeLayer(arrowsLayer);

        if (gpsPoints.length === 0) {
            console.log('No GPS points to visualize');
            return;
        }

        const color = document.getElementById('track-color').value;
        const thickness = parseInt(document.getElementById('line-thickness').value);
        const lineOpacity = parseInt(document.getElementById('line-opacity').value) / 100;
        const lineStyle = document.getElementById('line-style').value;
        const showLine = document.getElementById('show-line').checked;
        const showPoints = document.getElementById('show-points').checked;
        const showMarkers = document.getElementById('show-markers').checked;
        const pointSize = parseInt(document.getElementById('point-size').value);
        const pointOpacity = parseInt(document.getElementById('point-opacity').value) / 100;
        const pointColor = document.getElementById('point-color').value;
        const pointBorderColor = document.getElementById('point-border-color').value;
        const pointBorderWidth = parseInt(document.getElementById('point-border-width').value);
        const markerFrequency = parseInt(document.getElementById('marker-frequency').value);
        const markerColor = document.getElementById('marker-color').value;
        const arrowSize = parseInt(document.getElementById('arrow-size').value);
        const arrowColor = document.getElementById('arrow-color').value;

        // Create coordinate array
        const coords = gpsPoints.map(p => [p.lat, p.lng]);

        // Show line
        if (showLine && coords.length > 1) {
            const lineOptions = {
                color: color,
                weight: thickness,
                opacity: lineOpacity
            };
            if (lineStyle) {
                lineOptions.dashArray = lineStyle;
            }
            trackLayer = L.polyline(coords, lineOptions).addTo(map);
        }

        // Remove old permanent timestamp labels
        if (permanentTimestampLabels.length > 0) {
            permanentTimestampLabels.forEach(label => {
                if (map.hasLayer(label)) {
                    map.removeLayer(label);
                }
            });
            permanentTimestampLabels = [];
        }

        // Show points with click handlers for timestamp
        if (showPoints) {
            pointsLayer = L.layerGroup();
            pointMarkers = [];
            const pointShape = document.getElementById('point-shape').value;

            coords.forEach((coord, idx) => {
                let marker;
                const point = gpsPoints[idx];

                if (pointShape === 'circle') {
                    marker = L.circleMarker(coord, {
                        radius: pointSize,
                        fillColor: pointColor,
                        color: pointBorderColor,
                        weight: pointBorderWidth,
                        opacity: 1,
                        fillOpacity: pointOpacity
                    });
                } else if (pointShape === 'square') {
                    marker = L.marker(coord, {
                        icon: L.divIcon({
                            className: 'square-marker',
                            html: `<div style="width: ${pointSize * 2}px; height: ${pointSize * 2}px; background: ${pointColor}; opacity: ${pointOpacity}; border: ${pointBorderWidth}px solid ${pointBorderColor}; transform: translate(-50%, -50%);"></div>`,
                            iconSize: [pointSize * 2, pointSize * 2],
                            iconAnchor: [pointSize, pointSize]
                        })
                    });
                }

                if (marker) {
                    // Add click handler for timestamp display
                    marker.on('click', function (e) {
                        L.DomEvent.stopPropagation(e);

                        // Remove previous label
                        if (activePointLabel) {
                            map.removeLayer(activePointLabel);
                            activePointLabel = null;
                        }

                        // Show timestamp label if available
                        if (point.timestamp) {
                            const date = new Date(point.timestamp);
                            const formattedDate = date.toLocaleString(locales[currentLang] || 'en-US', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                            });

                            activePointLabel = L.tooltip({
                                permanent: true,
                                direction: 'top',
                                offset: [0, -15],
                                opacity: 1,
                                className: 'point-timestamp-label'
                            })
                                .setContent(`<b>${formattedDate}</b>`)
                                .setLatLng(coord)
                                .addTo(map);

                            // Auto-hide after 5 seconds
                            setTimeout(() => {
                                if (activePointLabel) {
                                    map.removeLayer(activePointLabel);
                                    activePointLabel = null;
                                }
                            }, 5000);
                        }
                    });

                    marker.addTo(pointsLayer);
                    pointMarkers.push(marker);
                }
            });
            pointsLayer.addTo(map);

            // Apply permanent timestamps if toggle is ON
            updatePermanentTimestamps();
        }

        // Format date/time for language
        function formatDateForLanguage(timestamp, lang) {
            if (!timestamp) return '';

            const date = new Date(timestamp);
            const locales = {
                de: 'de-DE',
                en: 'en-US',
                es: 'es-ES',
                uk: 'uk-UA',
                nl: 'nl-NL',
                sv: 'sv-SE',
                no: 'no-NO'
            };

            try {
                return date.toLocaleString(locales[lang] || 'de-DE', {
                    dateStyle: 'short',
                    timeStyle: 'medium'
                });
            } catch (e) {
                return date.toLocaleString();
            }
        }

        // Show markers with popups (NO TOOLTIPS - CLICK ONLY)
        if (showMarkers) {
            markersLayer = L.layerGroup();
            coords.forEach((coord, index) => {
                // Only show every Nth marker based on frequency
                if (index % markerFrequency !== 0) return;

                const point = gpsPoints[index];
                const marker = L.marker(coord, {
                    icon: L.divIcon({
                        className: 'custom-marker',
                        html: `<div style="background-color: ${markerColor}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${index + 1}</div>`,
                        iconSize: [28, 28],
                        iconAnchor: [14, 14]
                    })
                });

                // Create popup content with DATE/TIME PROMINENT
                let popupContent = `<div style="min-width: 200px;">`;
                popupContent += `<h4 style="margin: 0 0 10px 0; padding-bottom: 8px; border-bottom: 1px solid #ccc;">`;
                popupContent += `${translations[currentLang].point_number} ${index + 1}</h4>`;

                // DATE/TIME - Most prominent if available
                if (point.timestamp) {
                    popupContent += `<p style="margin: 5px 0; font-size: 14px;"><b>${translations[currentLang].timestamp}:</b><br>`;
                    const formattedDate = formatDateForLanguage(point.timestamp, currentLang);
                    popupContent += `<span style="color: var(--primary-blue); font-weight: 600;">${formattedDate}</span></p>`;
                }

                // Coordinates
                popupContent += `<p style="margin: 5px 0; font-size: 13px;"><b>${translations[currentLang].coordinates}:</b><br>`;
                popupContent += `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}</p>`;

                // Altitude
                if (point.altitude !== undefined && point.altitude !== null) {
                    popupContent += `<p style="margin: 5px 0; font-size: 13px;"><b>${translations[currentLang].altitude}:</b><br>`;
                    popupContent += `${point.altitude.toFixed(1)} m</p>`;
                }

                // Distance
                if (point.distance !== undefined) {
                    popupContent += `<p style="margin: 5px 0; font-size: 13px;"><b>${translations[currentLang].distance_from_start}:</b><br>`;
                    popupContent += `${point.distance.toFixed(2)} km</p>`;
                }

                popupContent += `</div>`;

                marker.bindPopup(popupContent);
                marker.addTo(markersLayer);
            });
            markersLayer.addTo(map);
        }

        // Show directional arrows
        const showArrows = document.getElementById('show-arrows').checked;
        if (showArrows && coords.length > 1) {
            const arrowSpacing = parseInt(document.getElementById('arrow-spacing').value);
            arrowsLayer = L.polylineDecorator(coords, {
                patterns: [
                    {
                        offset: 25,
                        repeat: arrowSpacing,
                        symbol: L.Symbol.arrowHead({
                            pixelSize: arrowSize,
                            pathOptions: {
                                fillOpacity: 1,
                                weight: 0,
                                color: arrowColor
                            }
                        })
                    }
                ]
            }).addTo(map);
        }

        // Fit bounds
        if (coords.length > 0) {
            const bounds = L.latLngBounds(coords);
            map.fitBounds(bounds, { padding: [50, 50] });
        }

        // Update heatmap if enabled
        updateHeatmap();

        console.timeEnd('Update Visualization');
        console.log('Visualization updated successfully');
    } catch (error) {
        console.error('Error in updateVisualization:', error);
        showNotification('Visualization update failed', 'error');
    }
}

// Update Permanent Timestamps
function updatePermanentTimestamps() {
    try {
        // Remove existing permanent labels
        if (permanentTimestampLabels.length > 0) {
            permanentTimestampLabels.forEach(label => {
                if (map.hasLayer(label)) {
                    map.removeLayer(label);
                }
            });
            permanentTimestampLabels = [];
        }

        const showTimestampsCheckbox = document.getElementById('show-point-timestamps');
        const showAllTimestamps = showTimestampsCheckbox ? showTimestampsCheckbox.checked : false;
        const showPoints = document.getElementById('show-points').checked;

        if (showAllTimestamps && showPoints && gpsPoints.length > 0) {
            gpsPoints.forEach((point, index) => {
                if (point.timestamp) {
                    const date = new Date(point.timestamp);
                    const formatted = date.toLocaleString(locales[currentLang] || 'en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    const label = L.tooltip({
                        permanent: true,
                        direction: 'top',
                        offset: [0, -15],
                        opacity: 1,
                        className: 'permanent-timestamp'
                    })
                        .setContent(`<small>${formatted}</small>`)
                        .setLatLng([point.lat, point.lng])
                        .addTo(map);

                    permanentTimestampLabels.push(label);
                }
            });
            console.log('Permanent timestamps enabled:', permanentTimestampLabels.length);
        } else {
            console.log('Permanent timestamps disabled');
        }
    } catch (error) {
        console.error('Error updating permanent timestamps:', error);
    }
}

// Update Heatmap - v19 Enhanced with Security
function updateHeatmap() {
    try {
        if (heatmapLayer) {
            map.removeLayer(heatmapLayer);
            heatmapLayer = null;
        }

        const enableHeatmap = document.getElementById('enable-heatmap').checked;

        if (enableHeatmap && gpsPoints && gpsPoints.length > 0) {
            // Get and sanitize parameters
            const scheme = document.getElementById('heatmap-scheme')?.value || 'default';
            const intensity = sanitizeNumber(document.getElementById('heatmap-intensity')?.value, 0.1, 2.0, 1.0);
            const radius = sanitizeInteger(document.getElementById('heatmap-radius')?.value, 10, 100, 25);
            const blur = sanitizeInteger(document.getElementById('heatmap-blur')?.value, 10, 100, 25);
            const opacity = sanitizeInteger(document.getElementById('heatmap-opacity')?.value, 0, 100, 100) / 100;
            const minPoints = sanitizeInteger(document.getElementById('heatmap-min-points')?.value, 1, 100, 1);

            // Validate parameters
            if (!validateHeatmapParams(intensity, radius, blur, opacity)) {
                console.warn('Invalid heatmap parameters');
                return;
            }

            // Filter points by min threshold if needed
            const heatData = gpsPoints.map(p => [p.lat, p.lng, 1]);

            // Get gradient
            const gradient = heatmapSchemes[scheme] || heatmapSchemes.default;

            heatmapLayer = L.heatLayer(heatData, {
                radius: radius,
                blur: blur,
                max: intensity,
                gradient: gradient,
                minOpacity: 0.1,
                maxZoom: 17
            }).addTo(map);

            // Apply opacity to the canvas
            setTimeout(() => {
                const heatmapCanvas = document.querySelector('.leaflet-heatmap-layer');
                if (heatmapCanvas) {
                    heatmapCanvas.style.opacity = opacity;
                }
            }, 100);

            console.log('Heatmap updated (v19):', { scheme, intensity, radius, blur, opacity, minPoints });
        }
    } catch (error) {
        console.error('Error updating heatmap:', error);
    }
}

// Change Map Style
function changeMapStyle(index) {
    try {
        if (!tileProviders[index]) {
            console.error('Invalid tile provider index:', index);
            return;
        }

        if (currentTileLayer) {
            map.removeLayer(currentTileLayer);
        }

        const provider = tileProviders[index];
        console.log('Changing map style to:', provider.name);

        currentTileLayer = L.tileLayer(provider.url, {
            attribution: provider.attribution,
            maxZoom: 19
        }).addTo(map);

        console.log('Map style changed successfully');
    } catch (error) {
        console.error('Error changing map style:', error);
        showNotification('Failed to change map style', 'error');
    }
}

// Export Map as PNG
async function exportMap(format) {
    if (!map) {
        showNotification('Map not initialized', 'error');
        return;
    }

    const mapElement = document.getElementById('map');

    try {
        setLoading(true);
        console.log('Starting PNG export...');

        const blob = await domtoimage.toBlob(mapElement, {
            quality: 1.0,
            bgcolor: '#ffffff',
            width: mapElement.offsetWidth,
            height: mapElement.offsetHeight,
            style: {
                margin: '0',
                padding: '0'
            }
        });

        if (!blob) {
            throw new Error('Failed to generate image blob');
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `gps-track-${Date.now()}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setLoading(false);
        console.log('PNG export successful');
        showNotification('Map exported as PNG', 'success');
    } catch (error) {
        console.error('PNG export error:', error);
        setLoading(false);
        showNotification('PNG export failed. Please try again.', 'error');
    }
}

// Reset Application v20
function resetApp() {
    try {
        console.log('Resetting application...');

        gpsPoints = [];
        pointMarkers = [];
        permanentTimestampLabels = [];
        trackPoints = [];

        // Hide progress bar
        const progressBar = document.getElementById('upload-progress');
        if (progressBar) {
            progressBar.remove();
        }

        document.getElementById('file-input').value = '';
        document.getElementById('total-images').textContent = '0';
        document.getElementById('gps-images').textContent = '0';

        if (trackLayer) map.removeLayer(trackLayer);
        if (pointsLayer) map.removeLayer(pointsLayer);
        if (markersLayer) map.removeLayer(markersLayer);
        if (heatmapLayer) map.removeLayer(heatmapLayer);
        if (arrowsLayer) map.removeLayer(arrowsLayer);
        if (animationMarker) map.removeLayer(animationMarker);
        if (trailLayer) map.removeLayer(trailLayer);
        if (activePointLabel) map.removeLayer(activePointLabel);

        // Clear permanent timestamp labels
        if (permanentTimestampLabels.length > 0) {
            permanentTimestampLabels.forEach(label => {
                if (map.hasLayer(label)) {
                    map.removeLayer(label);
                }
            });
            permanentTimestampLabels = [];
        }

        trackLayer = null;
        pointsLayer = null;
        markersLayer = null;
        heatmapLayer = null;
        arrowsLayer = null;
        animationMarker = null;
        trailLayer = null;
        activePointLabel = null;

        if (elevationChart) {
            try {
                elevationChart.destroy();
            } catch (e) {
                console.warn('Error destroying elevation chart:', e);
            }
            elevationChart = null;
        }

        // Clear elevation data
        elevationData = null;

        // Hide elevation section
        const elevationSection = document.getElementById('elevation-details');
        if (elevationSection) {
            elevationSection.style.display = 'none';
        }

        resetAnimation();

        document.getElementById('stat-distance').textContent = '0 km';
        document.getElementById('stat-points').textContent = '0';
        document.getElementById('stat-duration').textContent = '-';
        document.getElementById('stat-speed').textContent = '-';
        document.getElementById('stat-elevation-gain').textContent = '-';
        document.getElementById('stat-elevation-loss').textContent = '-';

        // Clear timeline
        const timelineContent = document.getElementById('timeline-content');
        if (timelineContent) {
            timelineContent.innerHTML = `<p data-i18n="no_data" style="color: var(--text-secondary); text-align: center; padding: 20px;">${translations[currentLang].no_data}</p>`;
        }

        map.setView([50.5, 10.5], 6);

        // Reset timestamp toggle
        const timestampToggle = document.getElementById('show-all-timestamps');
        if (timestampToggle) {
            timestampToggle.checked = false;
        }

        console.log('Application reset complete');
    } catch (error) {
        console.error('Error resetting application:', error);
    }
}

// Dark Mode Functions (in-memory variable)
let isDarkMode = false;

function initDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (!darkModeToggle) {
        console.error('Dark mode toggle button not found!');
        return;
    }

    const body = document.body;

    // Initialize with DARK mode (default)
    isDarkMode = true;
    body.classList.add('dark-mode');
    darkModeToggle.textContent = 'On';
    darkModeToggle.style.backgroundColor = '#339af0';

    // Set default map style for Dark Mode (Index 7: CartoDB Dark Matter)
    setTimeout(() => {
        const mapSelect = document.getElementById('map-style-select');
        if (mapSelect) {
            mapSelect.value = "7";
            if (typeof changeMapStyle === 'function') changeMapStyle(7);
        }
    }, 100);

    // Toggle dark mode
    darkModeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        isDarkMode = !isDarkMode;

        if (isDarkMode) {
            body.classList.add('dark-mode');
            darkModeToggle.textContent = 'On';
            darkModeToggle.style.backgroundColor = '#339af0';
            console.log('Dark mode enabled');

            // Switch to Dark Map
            const mapSelect = document.getElementById('map-style-select');
            if (mapSelect) {
                mapSelect.value = "7";
                if (typeof changeMapStyle === 'function') changeMapStyle(7);
            }
        } else {
            body.classList.remove('dark-mode');
            darkModeToggle.textContent = 'Off';
            darkModeToggle.style.backgroundColor = '#007bff';
            console.log('Dark mode disabled');

            // Switch to Light Map (Index 0: OSM Standard)
            const mapSelect = document.getElementById('map-style-select');
            if (mapSelect) {
                mapSelect.value = "0";
                if (typeof changeMapStyle === 'function') changeMapStyle(0);
            }
        }

        // Update chart colors
        updateChartTheme();
    });

    console.log('Dark mode initialized (default: ON)');

    // Show welcome toast on first visit (after short delay for page load)
    setTimeout(() => {
        showWelcomeToast();
    }, 500);
}

// Global Error Handlers
window.addEventListener('error', function (event) {
    console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', function (event) {
    console.error('Unhandled promise rejection:', event.reason);
});

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== GPS Track Viewer v21 - PRODUCTION ===');
    console.log('High-volume support: 50,000 images');
    console.log('Batch limit: 10,000 images per upload');
    console.log('Languages: 11 (including Bavarian)');
    console.log('Default language: English (always)');
    console.log('Enhanced security and memory management');
    console.log('DOM loaded - initializing application...');
    console.log('Leaflet loaded:', typeof L !== 'undefined');
    console.log('exifr loaded:', typeof exifr !== 'undefined');
    console.log('Chart loaded:', typeof Chart !== 'undefined');
    console.log('dom-to-image loaded:', typeof domtoimage !== 'undefined');

    // Initialize in correct order with validation
    try {
        console.log('=== GPS Track Viewer - Starting Initialization ===');
        console.log('Timestamp:', new Date().toLocaleString());

        console.log('Step 1: Initializing Map...');
        if (!initMap()) {
            throw new Error('Map initialization failed');
        }

        console.log('Step 2: Initializing Dark Mode...');
        initDarkMode();

        console.log('Step 3: Initializing Language...');
        // Language already initialized above

        console.log('Step 4: Setting up File Upload...');
        setupFileUpload();

        console.log('Step 5: Setting up Controls...');
        setupControls();

        console.log('=== GPS Track Viewer v21 - All Systems Operational ===');
        console.log('File limits: Max 50,000 files, 10,000 per batch, 100MB per file');
        console.log('Languages: 11 languages including Bavarian/Oberpälzisch');
        console.log('Default language: ENGLISH (forced)');
        console.log('Security: Enhanced validation and memory monitoring');
        console.log('Heatmap: Multilingual descriptions in 10 languages');

        // Initialize heatmap labels
        updateHeatmapSchemeLabels();

        // Start memory monitoring
        setInterval(() => {
            checkMemoryUsage();
        }, 30000); // Check every 30 seconds
    } catch (error) {
        console.error('FATAL: Initialization error:', error);
        alert('Application failed to initialize. Please reload the page.\n\nError: ' + error.message);
    }

    // Language Initialization with Italian Easter Egg - ALWAYS ENGLISH DEFAULT
    function initLanguage() {
        const languageDropdown = document.getElementById('language-dropdown');
        if (!languageDropdown) {
            console.error('Language dropdown not found!');
            return;
        }

        // CRITICAL: Force English as default
        currentLang = 'en';
        languageDropdown.value = 'en';

        // Update all UI text to English
        updateLanguage('en');

        // Update Italian Easter Egg on init
        updateItalianEasterEgg();

        languageDropdown.addEventListener('change', (e) => {
            const newLang = e.target.value;
            console.log('Language changed to:', newLang);

            // Validate language exists
            if (!translations[newLang]) {
                console.warn('Invalid language selected:', newLang);
                currentLang = 'en';
                e.target.value = 'en';
                return;
            }

            currentLang = newLang;

            // Update language icon
            updateLanguageIcon();

            // Update Italian Easter Egg
            updateItalianEasterEgg();

            // Update all UI text
            updateLanguage(newLang);

            // Update heatmap labels immediately
            updateHeatmapSchemeLabels();
        });

        console.log('Language initialized successfully');
    }

    function updateItalianEasterEgg() {
        const languageDropdown = document.getElementById('language-dropdown');
        const italianOption = languageDropdown.querySelector('option[value="it"]');

        if (!italianOption) return;

        if (currentLang === 'it') {
            italianOption.textContent = '🤌 Italiano';
            console.log('%c🤌 Mamma mia! %cBenvenuto in Italiano!',
                'font-size: 18px; font-weight: bold;',
                'font-size: 13px;');
        } else {
            italianOption.textContent = '🇮🇹 Italiano';
        }
    }

    // Setup File Upload Handler
    function setupFileUpload() {
        try {
            const fileInput = document.getElementById('file-input');
            if (!fileInput) {
                console.error('File input not found!');
                return;
            }

            fileInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                if (files.length > 0) {
                    handleFileUpload(files);
                }
            });

            console.log('File upload handler initialized');
        } catch (error) {
            console.error('Error setting up file upload:', error);
        }
    }

    // Setup all control event listeners
    function setupControls() {
        try {
            // Debounce function for sliders
            function debounce(func, wait) {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        clearTimeout(timeout);
                        func(...args);
                    };
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                };
            }

            const debouncedUpdate = debounce(updateVisualization, 300);
            const debouncedHeatmapUpdate = debounce(updateHeatmap, 300);

            // Sidebar Expand Button (added for Elevation Profile)
            const expandBtn = document.getElementById('expand-sidebar-btn');
            if (expandBtn) {
                expandBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation(); // Prevent details from toggling
                    toggleSidebarExpand();
                });
            }

            // Reset Button
            const resetBtn = document.getElementById('reset-btn');
            if (resetBtn) {
                resetBtn.addEventListener('click', resetApp);
            }

            // Jump to Elevation Profile Handler
            const jumpToElevBtn = document.getElementById('jump-to-elevation');
            if (jumpToElevBtn) {
                jumpToElevBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const elevationDetails = document.getElementById('elevation-details');
                    if (elevationDetails) {
                        // Open the details element
                        elevationDetails.open = true;

                        // Scroll nicely
                        elevationDetails.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });

                        // Visual flash effect
                        elevationDetails.style.transition = 'background-color 0.3s';
                        const originalBg = elevationDetails.style.backgroundColor;
                        elevationDetails.style.backgroundColor = 'rgba(255, 126, 34, 0.2)'; // Orange highlight

                        setTimeout(() => {
                            elevationDetails.style.backgroundColor = originalBg;
                        }, 600);
                    }
                });
            }

            // Map Style
            const mapStyleSelect = document.getElementById('map-style-select');
            if (mapStyleSelect) {
                mapStyleSelect.addEventListener('change', (e) => {
                    changeMapStyle(parseInt(e.target.value));
                });
            }

            // Track Line Controls
            const trackColor = document.getElementById('track-color');
            if (trackColor) trackColor.addEventListener('change', updateVisualization);

            const lineStyle = document.getElementById('line-style');
            if (lineStyle) lineStyle.addEventListener('change', updateVisualization);

            const showLine = document.getElementById('show-line');
            if (showLine) showLine.addEventListener('change', updateVisualization);

            const lineThickness = document.getElementById('line-thickness');
            if (lineThickness) {
                lineThickness.addEventListener('input', (e) => {
                    document.getElementById('line-thickness-value').textContent = e.target.value;
                });
                lineThickness.addEventListener('change', debouncedUpdate);
            }

            const lineOpacity = document.getElementById('line-opacity');
            if (lineOpacity) {
                lineOpacity.addEventListener('input', (e) => {
                    document.getElementById('line-opacity-value').textContent = e.target.value + '%';
                });
                lineOpacity.addEventListener('change', debouncedUpdate);
            }

            // Track Points Controls
            const showPoints = document.getElementById('show-points');
            if (showPoints) showPoints.addEventListener('change', updateVisualization);

            const pointShape = document.getElementById('point-shape');
            if (pointShape) pointShape.addEventListener('change', updateVisualization);

            const pointColor = document.getElementById('point-color');
            if (pointColor) pointColor.addEventListener('change', updateVisualization);

            const pointBorderColor = document.getElementById('point-border-color');
            if (pointBorderColor) pointBorderColor.addEventListener('change', updateVisualization);

            const pointSize = document.getElementById('point-size');
            if (pointSize) {
                pointSize.addEventListener('input', (e) => {
                    document.getElementById('point-size-value').textContent = e.target.value;
                });
                pointSize.addEventListener('change', debouncedUpdate);
            }

            const pointOpacity = document.getElementById('point-opacity');
            if (pointOpacity) {
                pointOpacity.addEventListener('input', (e) => {
                    document.getElementById('point-opacity-value').textContent = e.target.value + '%';
                });
                pointOpacity.addEventListener('change', debouncedUpdate);
            }

            const pointBorderWidth = document.getElementById('point-border-width');
            if (pointBorderWidth) {
                pointBorderWidth.addEventListener('input', (e) => {
                    document.getElementById('point-border-width-value').textContent = e.target.value;
                });
                pointBorderWidth.addEventListener('change', debouncedUpdate);
            }

            // Track Markers Controls
            const showMarkers = document.getElementById('show-markers');
            if (showMarkers) showMarkers.addEventListener('change', updateVisualization);

            const markerColor = document.getElementById('marker-color');
            if (markerColor) markerColor.addEventListener('change', updateVisualization);

            const markerFrequency = document.getElementById('marker-frequency');
            if (markerFrequency) {
                markerFrequency.addEventListener('input', (e) => {
                    document.getElementById('marker-frequency-value').textContent = e.target.value;
                });
                markerFrequency.addEventListener('change', debouncedUpdate);
            }

            // Direction Arrows Controls
            const showArrows = document.getElementById('show-arrows');
            if (showArrows) showArrows.addEventListener('change', updateVisualization);

            const arrowColor = document.getElementById('arrow-color');
            if (arrowColor) arrowColor.addEventListener('change', updateVisualization);

            const arrowSize = document.getElementById('arrow-size');
            if (arrowSize) {
                arrowSize.addEventListener('input', (e) => {
                    document.getElementById('arrow-size-value').textContent = e.target.value;
                });
                arrowSize.addEventListener('change', debouncedUpdate);
            }

            const arrowSpacing = document.getElementById('arrow-spacing');
            if (arrowSpacing) {
                arrowSpacing.addEventListener('input', (e) => {
                    document.getElementById('arrow-spacing-value').textContent = e.target.value;
                });
                arrowSpacing.addEventListener('change', debouncedUpdate);
            }

            // Heatmap Controls
            const enableHeatmap = document.getElementById('enable-heatmap');
            if (enableHeatmap) enableHeatmap.addEventListener('change', updateHeatmap);

            const heatmapScheme = document.getElementById('heatmap-scheme');
            if (heatmapScheme) heatmapScheme.addEventListener('change', updateHeatmap);

            const heatmapRadius = document.getElementById('heatmap-radius');
            if (heatmapRadius) {
                heatmapRadius.addEventListener('input', (e) => {
                    document.getElementById('heatmap-radius-value').textContent = e.target.value;
                });
                heatmapRadius.addEventListener('change', debouncedHeatmapUpdate);
            }

            const heatmapBlur = document.getElementById('heatmap-blur');
            if (heatmapBlur) {
                heatmapBlur.addEventListener('input', (e) => {
                    document.getElementById('heatmap-blur-value').textContent = e.target.value;
                });
                heatmapBlur.addEventListener('change', debouncedHeatmapUpdate);
            }

            // v19: Min Points control
            const heatmapMinPoints = document.getElementById('heatmap-min-points');
            if (heatmapMinPoints) {
                heatmapMinPoints.addEventListener('change', debouncedHeatmapUpdate);
            }

            const heatmapIntensity = document.getElementById('heatmap-intensity');
            if (heatmapIntensity) {
                heatmapIntensity.addEventListener('input', (e) => {
                    document.getElementById('heatmap-intensity-value').textContent = parseFloat(e.target.value).toFixed(1);
                    debouncedHeatmapUpdate();
                });
                heatmapIntensity.addEventListener('change', updateHeatmap);
            }

            const heatmapOpacity = document.getElementById('heatmap-opacity');
            if (heatmapOpacity) {
                heatmapOpacity.addEventListener('input', (e) => {
                    document.getElementById('heatmap-opacity-value').textContent = e.target.value + '%';
                    debouncedHeatmapUpdate();
                });
                heatmapOpacity.addEventListener('change', updateHeatmap);
            }

            // Export Buttons
            const exportPng = document.getElementById('export-png');
            if (exportPng) exportPng.addEventListener('click', () => exportMap('png'));

            const exportGpx = document.getElementById('export-gpx');
            if (exportGpx) exportGpx.addEventListener('click', exportGPX);

            // Animation Controls
            const animationSpeed = document.getElementById('animation-speed');
            if (animationSpeed) {
                animationSpeed.addEventListener('input', (e) => {
                    document.getElementById('speed-value').textContent = e.target.value + 'x';
                });
            }

            const trailLength = document.getElementById('trail-length');
            if (trailLength) {
                trailLength.addEventListener('input', (e) => {
                    document.getElementById('trail-length-value').textContent = e.target.value;
                });
            }

            const playBtn = document.getElementById('play-btn');
            if (playBtn) playBtn.addEventListener('click', toggleAnimation);

            const resetAnimation = document.getElementById('reset-animation');
            if (resetAnimation) resetAnimation.addEventListener('click', resetAnimation);

            // Timestamp Toggle
            const showTimestampsCheckbox = document.getElementById('show-point-timestamps');
            if (showTimestampsCheckbox) {
                showTimestampsCheckbox.addEventListener('change', function () {
                    console.log('Timestamp toggle changed:', this.checked);
                    updatePermanentTimestamps();
                });
                console.log('Timestamp toggle initialized');
            }

            // Timeline section
            const timelineSection = document.querySelector('details:has(#timeline-content)');
            if (timelineSection) {
                timelineSection.addEventListener('toggle', function (e) {
                    if (this.open && gpsPoints.length > 0) {
                        generateTimeline();
                    }
                });
            }

            console.log('All controls initialized successfully');
        } catch (error) {
            console.error('Error setting up controls:', error);
        }
    }



    /**
     * Update language icon dynamically based on selected language
     */
    function updateLanguageIcon() {
        try {
            const icon = document.getElementById('language-icon');
            if (!icon) {
                console.warn('Language icon element not found');
                return;
            }

            const lang = currentLang || 'en';

            // Icon mapping: Bavarian gets beer, others get their flags
            const iconMap = {
                'en': '🌐',
                'de': '🇩🇪',
                'it': '🤌',
                'hr': '🇭🇷',
                'pl': '🇵🇱',
                'es': '🇪🇸',
                'uk': '🇺🇦',
                'nl': '🇳🇱',
                'sv': '🇸🇪',
                'no': '🇳🇴',
                'by': '🍺'  // BEER ICON FOR BAVARIAN
            };

            const newIcon = iconMap[lang] || '🌐';
            icon.textContent = newIcon;
            console.log('Language icon updated to:', newIcon, 'for language:', lang);
        } catch (e) {
            console.error('Error updating language icon:', e);
        }
    }

    // Initialize Language - FORCE ENGLISH
    currentLang = 'en';
    initLanguage();
    updateLanguageIcon();

    // Debounce function for sliders
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    const debouncedUpdate = debounce(updateVisualization, 300);
    const debouncedHeatmapUpdate = debounce(updateHeatmap, 300);

    // File input, reset, and map style are now handled in setupFileUpload() and setupControls()

    // Track Line Controls
    document.getElementById('track-color').addEventListener('change', updateVisualization);
    document.getElementById('line-style').addEventListener('change', updateVisualization);
    document.getElementById('show-line').addEventListener('change', updateVisualization);

    const lineThickness = document.getElementById('line-thickness');
    lineThickness.addEventListener('input', (e) => {
        document.getElementById('line-thickness-value').textContent = e.target.value;
    });
    lineThickness.addEventListener('change', debouncedUpdate);

    const lineOpacity = document.getElementById('line-opacity');
    lineOpacity.addEventListener('input', (e) => {
        document.getElementById('line-opacity-value').textContent = e.target.value + '%';
    });
    lineOpacity.addEventListener('change', debouncedUpdate);

    // Track Points Controls
    document.getElementById('show-points').addEventListener('change', updateVisualization);
    document.getElementById('point-shape').addEventListener('change', updateVisualization);
    document.getElementById('point-color').addEventListener('change', updateVisualization);
    document.getElementById('point-border-color').addEventListener('change', updateVisualization);

    const pointSize = document.getElementById('point-size');
    pointSize.addEventListener('input', (e) => {
        document.getElementById('point-size-value').textContent = e.target.value;
    });
    pointSize.addEventListener('change', debouncedUpdate);

    const pointOpacity = document.getElementById('point-opacity');
    pointOpacity.addEventListener('input', (e) => {
        document.getElementById('point-opacity-value').textContent = e.target.value + '%';
    });
    pointOpacity.addEventListener('change', debouncedUpdate);

    const pointBorderWidth = document.getElementById('point-border-width');
    pointBorderWidth.addEventListener('input', (e) => {
        document.getElementById('point-border-width-value').textContent = e.target.value;
    });
    pointBorderWidth.addEventListener('change', debouncedUpdate);

    // Track Markers Controls
    document.getElementById('show-markers').addEventListener('change', updateVisualization);
    document.getElementById('marker-color').addEventListener('change', updateVisualization);

    const markerFrequency = document.getElementById('marker-frequency');
    markerFrequency.addEventListener('input', (e) => {
        document.getElementById('marker-frequency-value').textContent = e.target.value;
    });
    markerFrequency.addEventListener('change', debouncedUpdate);

    // Direction Arrows Controls
    document.getElementById('show-arrows').addEventListener('change', updateVisualization);
    document.getElementById('arrow-color').addEventListener('change', updateVisualization);

    const arrowSize = document.getElementById('arrow-size');
    arrowSize.addEventListener('input', (e) => {
        document.getElementById('arrow-size-value').textContent = e.target.value;
    });
    arrowSize.addEventListener('change', debouncedUpdate);

    const arrowSpacing = document.getElementById('arrow-spacing');
    arrowSpacing.addEventListener('input', (e) => {
        document.getElementById('arrow-spacing-value').textContent = e.target.value;
    });
    arrowSpacing.addEventListener('change', debouncedUpdate);

    // Heatmap Controls
    document.getElementById('enable-heatmap').addEventListener('change', updateHeatmap);
    document.getElementById('heatmap-scheme').addEventListener('change', updateHeatmap);

    const heatmapRadius = document.getElementById('heatmap-radius');
    heatmapRadius.addEventListener('input', (e) => {
        document.getElementById('heatmap-radius-value').textContent = e.target.value;
    });
    heatmapRadius.addEventListener('change', debouncedHeatmapUpdate);

    const heatmapBlur = document.getElementById('heatmap-blur');
    heatmapBlur.addEventListener('input', (e) => {
        document.getElementById('heatmap-blur-value').textContent = e.target.value;
    });
    heatmapBlur.addEventListener('change', debouncedHeatmapUpdate);

    const heatmapIntensity = document.getElementById('heatmap-intensity');
    heatmapIntensity.addEventListener('input', (e) => {
        document.getElementById('heatmap-intensity-value').textContent = parseFloat(e.target.value).toFixed(1);
        debouncedHeatmapUpdate();
    });
    heatmapIntensity.addEventListener('change', () => {
        updateHeatmap();
    });

    const heatmapOpacity = document.getElementById('heatmap-opacity');
    heatmapOpacity.addEventListener('input', (e) => {
        document.getElementById('heatmap-opacity-value').textContent = e.target.value + '%';
        debouncedHeatmapUpdate();
    });
    heatmapOpacity.addEventListener('change', () => {
        updateHeatmap();
    });

    // Export Buttons
    document.getElementById('export-png').addEventListener('click', () => exportMap('png'));
    document.getElementById('export-gpx').addEventListener('click', exportGPX);



    // Modal Functions
    function openModal(title, content) {
        try {
            const modalTitle = document.getElementById('modal-title');
            const modalBody = document.getElementById('modal-body');
            const modalOverlay = document.getElementById('modal-overlay');
            const modalContent = document.getElementById('modal-content');

            if (!modalTitle || !modalBody || !modalOverlay || !modalContent) {
                console.error('Modal elements not found!');
                return;
            }

            modalTitle.textContent = title;
            modalBody.innerHTML = content;
            modalOverlay.classList.add('active');
            modalContent.classList.add('active');

            console.log('Modal opened:', title);
        } catch (error) {
            console.error('Error opening modal:', error);
        }
    }

    function closeModal() {
        try {
            const modalOverlay = document.getElementById('modal-overlay');
            const modalContent = document.getElementById('modal-content');

            if (modalOverlay) modalOverlay.classList.remove('active');
            if (modalContent) modalContent.classList.remove('active');

            console.log('Modal closed');
        } catch (error) {
            console.error('Error closing modal:', error);
        }
    }

    // Generate FAQ Content
    function generateFAQ() {
        const lang = currentLang || 'en';
        console.log('Generating FAQ for language:', lang);
        const faqs = faqContent[lang] || faqContent.en;

        if (!faqs || faqs.length === 0) {
            console.warn('No FAQ content found for language:', lang);
            return '<p>FAQ not available for this language.</p>';
        }

        let html = '<div class="faq-container">';

        faqs.forEach((item, index) => {
            html += `
                        <div class="faq-item">
                            <div class="faq-question" data-faq-index="${index}">
                                <span>${item.question}</span>
                                <span class="faq-toggle">▼</span>
                            </div>
                            <div class="faq-answer" style="display: none;">
                                ${item.answer}
                            </div>
                        </div>
                    `;
        });

        html += '</div>';

        // Add click handlers after rendering
        setTimeout(() => {
            document.querySelectorAll('.faq-question').forEach(q => {
                q.addEventListener('click', function () {
                    const answer = this.nextElementSibling;
                    const toggle = this.querySelector('.faq-toggle');
                    const isVisible = answer.style.display !== 'none';

                    answer.style.display = isVisible ? 'none' : 'block';
                    toggle.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
                });
            });
        }, 50);

        return html;
    }

    // Get Contact Content
    function getContactContent() {
        return `
                    <div class="contact-content">
                        <h3>Contact Us</h3>
                        <p>Have questions, bug reports, or feature requests? We'd love to hear from you!</p>
                        
                        <p><strong>Email:</strong> <a href="mailto:contact@example.com">contact@example.com</a></p>
                        
                        <h4>Why we built this</h4>
                        <p>GPS Track Viewer was created to give everyone access to professional GPS track visualization tools without expensive software or privacy concerns. We believe your location data belongs to you, not cloud servers. That's why everything runs locally in your browser.</p>
                        
                        <p>Whether you're a hiker, cyclist, photographer, or researcher, we hope this tool helps you understand your journeys better.</p>
                    </div>
                `;
    }



    // Get Credits Content with Special Thanks
    function getCreditsContent() {
        try {
            const lang = currentLang || 'en';
            const content = creditsContent[lang] || creditsContent.en;

            let html = '<div class="credits-container">';

            // SPECIAL THANKS SECTION (TOP)
            html += '<div class="special-thanks-section">';
            html += '<h3 style="margin-top: 0;">🙏 Special Thanks</h3>';

            html += '<div class="thank-you-item">';
            html += '<h4>🗺️ OpenStreetMap</h4>';
            html += '<p>We extend our deepest gratitude to <strong>OpenStreetMap</strong> and its amazing community. OpenStreetMap provides the free, collaborative mapping data that powers our application. Without the dedication of thousands of volunteers who contribute to OpenStreetMap, GPS Track Viewer would not be possible. OpenStreetMap represents the spirit of open-source collaboration at its finest.</p>';
            html += '<p><a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer">OpenStreetMap.org →</a> | <a href="https://github.com/openstreetmap/openstreetmap-website" target="_blank" rel="noopener noreferrer">GitHub →</a></p>';
            html += '</div>';

            html += '<div class="thank-you-item">';
            html += '<h4>🤖 Perplexity AI</h4>';
            html += '<p>We would like to thank <strong>Perplexity AI</strong> for their invaluable assistance in developing GPS Track Viewer. Perplexity AI\'s advanced language models helped with code generation, debugging, optimization, and ensuring best practices throughout the development process. This application is a testament to the power of human creativity combined with artificial intelligence.</p>';
            html += '<p><a href="https://www.perplexity.ai" target="_blank" rel="noopener noreferrer">Perplexity.ai →</a></p>';
            html += '</div>';

            html += '</div>';

            // Divider
            html += '<hr style="margin: 25px 0; border: none; border-top: 1px solid var(--border-color);">';

            // Regular credits
            html += `<h3>${content.title}</h3>`;
            html += `<p class="credits-intro">${sanitizeText(content.introduction)}</p>`;
            html += '<div class="credits-libraries">';

            content.libraries.forEach(lib => {
                html += '<div class="credit-item">';
                html += `<h4><a href="${sanitizeURL(lib.url)}" target="_blank" rel="noopener noreferrer">${sanitizeText(lib.name)}</a></h4>`;
                html += `<p class="credit-description">${sanitizeText(lib.description)}</p>`;
                html += '<p class="credit-meta">';
                html += `<strong>${translations[lang]?.created_by || 'Created by'}:</strong> ${sanitizeText(lib.creators)}`;
                html += `<span class="credit-license">${sanitizeText(lib.license)}</span>`;
                html += '</p>';
                html += '</div>';
            });

            html += '</div>';
            html += '<div class="credits-thank-you">';
            html += `<p>${sanitizeText(content.thank_you)}</p>`;
            html += '</div>';
            html += '<div class="credits-license-info">';
            html += `<p>${sanitizeText(content.license_info)}</p>`;
            html += '</div>';
            html += '</div>';

            return html;
        } catch (error) {
            console.error('Error generating credits content:', error);
            return '<p>Error loading credits. Please try again.</p>';
        }
    }

    // Get Donations Content
    function getDonationsContent() {
        return `
                    <div class="donations-content">
                        <h3>Support Our Project</h3>
                        <p>GPS Track Viewer is free and always will be. If you find it useful, consider supporting our development:</p>
                        
                        <h4>💳 PayPal</h4>
                        <p><a href="https://paypal.me/gpstrackviewer" target="_blank">Donate via PayPal</a></p>
                        
                        <h4>₿ Bitcoin</h4>
                        <p><code>1A1z7agoat4oPLQyANVv8FqvCvpEZDCSXd</code></p>
                        
                        <h4>Ξ Ethereum</h4>
                        <p><code>0x4A5E8f3e0d9b8c7a6f1e2d3c4b5a6f7e8d9c0b1a</code></p>
                        
                        <h4>🟡 Monero</h4>
                        <p><code>87M6JJxZMZXznvHf1sQBQu3Z1M3vwjLGQq6VUu8oLPjSjZJHB8jvWWWuKYa4FdNUCQwcWHGGvjPSKEYN8MgcRfqVpnw9Qje</code></p>
                        
                        <p style="margin-top: 20px; font-size: 12px; color: var(--text-secondary);">Every contribution helps us improve the tool and keep it free for everyone. Thank you!</p>
                    </div>
                `;
    }

    // Setup Modal System
    function setupModalSystem() {
        try {
            const modalClose = document.getElementById('modal-close');
            const modalOverlay = document.getElementById('modal-overlay');

            if (modalClose) {
                modalClose.addEventListener('click', closeModal);
            } else {
                console.error('Modal close button not found!');
            }

            if (modalOverlay) {
                modalOverlay.addEventListener('click', closeModal);
            } else {
                console.error('Modal overlay not found!');
            }

            console.log('Modal system initialized');
        } catch (error) {
            console.error('Error setting up modal system:', error);
        }
    }

    // Setup Credits Button
    function setupCreditsButton() {
        try {
            const creditsBtn = document.getElementById('menu-credits');

            if (!creditsBtn) {
                console.warn('Credits button not found');
                return false;
            }

            creditsBtn.addEventListener('click', function (e) {
                e.preventDefault();

                try {
                    const lang = currentLang || 'en';
                    const title = creditsContent[lang]?.title || creditsContent.en.title;
                    // Remove HTML entities from title for display
                    const displayTitle = title.replace(/&amp;/g, '&');
                    openModal(displayTitle, getCreditsContent());
                } catch (err) {
                    console.error('Error opening credits modal:', err);
                    alert('Error opening credits. Please check console.');
                }
            });

            console.log('Credits button initialized successfully');
            return true;
        } catch (e) {
            console.error('Error setting up credits button:', e);
            return false;
        }
    }

    // Setup Menu Buttons
    function setupMenuButtons() {
        try {
            const faqBtn = document.getElementById('menu-faq');
            const contactBtn = document.getElementById('menu-contact');
            const donationsBtn = document.getElementById('menu-donations');

            if (!faqBtn || !contactBtn || !donationsBtn) {
                console.error('Menu buttons not found!');
                return;
            }

            faqBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('FAQ button clicked, current language:', currentLang);

                // Get FAQ title in current language
                const lang = currentLang || 'en';
                const faqTitle = translations[lang]?.faq || 'FAQ';

                // Generate FAQ content
                const faqContent = generateFAQ();

                // Open modal with FAQ
                openModal(faqTitle, faqContent);

                console.log('FAQ modal opened for language:', lang);
            });

            contactBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openModal('Contact', getContactContent());
            });

            donationsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openModal('Donations', getDonationsContent());
            });

            console.log('Menu buttons initialized successfully');
        } catch (error) {
            console.error('Error setting up menu buttons:', error);
        }
    }

    // Initialize modal and menu systems
    setupModalSystem();
    setupMenuButtons();
    setupCreditsButton();
    setupPOIEditor(); // Initialize POI Editor
    setupOSMDatabase(); // Initialize OSM Database

    // Timestamp Toggle (now in Track Points section)
    const showTimestampsCheckbox = document.getElementById('show-point-timestamps');
    if (showTimestampsCheckbox) {
        showTimestampsCheckbox.addEventListener('change', function () {
            console.log('Timestamp toggle changed:', this.checked);
            updatePermanentTimestamps();
        });
        console.log('Timestamp toggle initialized');
    } else {
        console.warn('Timestamp toggle checkbox not found!');
    }

    // Timeline section - generate when opened
    const timelineSection = document.querySelector('details:has(#timeline-content)');
    if (timelineSection) {
        timelineSection.addEventListener('toggle', function (e) {
            if (this.open && gpsPoints.length > 0) {
                generateTimeline();
            }
        });
    }

    // Animation controls
    const animationSpeed = document.getElementById('animation-speed');
    animationSpeed.addEventListener('input', (e) => {
        document.getElementById('speed-value').textContent = e.target.value + 'x';
    });

    const trailLength = document.getElementById('trail-length');
    trailLength.addEventListener('input', (e) => {
        document.getElementById('trail-length-value').textContent = e.target.value;
    });

    document.getElementById('play-btn').addEventListener('click', toggleAnimation);
    document.getElementById('reset-animation').addEventListener('click', resetAnimation);
});


// Sidebar Expand Functionality for Elevation Profile
function toggleSidebarExpand() {
    try {
        const sidebar = document.querySelector('.sidebar');
        const body = document.body;
        const btn = document.getElementById('expand-sidebar-btn');

        if (!sidebar || !btn) return;

        sidebar.classList.toggle('sidebar-expanded');
        body.classList.toggle('sidebar-is-expanded');

        // Update button text/icon
        if (sidebar.classList.contains('sidebar-expanded')) {
            btn.textContent = '⇐'; // Point left (collapse)
            btn.title = 'Collapse sidebar';
        } else {
            btn.textContent = '⇒'; // Point right (expand) - using double arrow
            btn.title = 'Expand sidebar for better chart view';
        }

        // Trigger resize events for charts and map
        setTimeout(() => {
            // Resize Map
            if (map) map.invalidateSize();

            // Resize Elevation Chart
            if (elevationChart) {
                elevationChart.resize();
            }
        }, 350); // Wait for transition to finish

    } catch (e) {
        console.error('Error toggling sidebar:', e);
    }
}

// Animation Functions
function toggleAnimation() {
    try {
        if (!gpsPoints || gpsPoints.length === 0) {
            showNotification('No GPS data for animation', 'warning');
            return;
        }

        if (isAnimating) {
            pauseAnimation();
        } else {
            startAnimation();
        }
    } catch (error) {
        console.error('Error toggling animation:', error);
    }
}

function startAnimation() {
    try {
        if (!gpsPoints || gpsPoints.length === 0) return;

        console.log('Starting animation...');
        isAnimating = true;
        document.getElementById('play-icon').textContent = '⏸';
        document.getElementById('play-text').textContent = translations[currentLang].pause;

        const animMarkerColor = document.getElementById('anim-marker-color').value;

        if (!animationMarker) {
            const startPoint = gpsPoints[currentAnimationIndex];
            animationMarker = L.marker([startPoint.lat, startPoint.lng], {
                icon: L.divIcon({
                    className: 'animation-marker',
                    html: `<div style="background-color: ${animMarkerColor}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(255,0,0,0.5); animation: pulse 1s infinite;"></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                })
            }).addTo(map);
        }

        // Initialize trail if enabled
        const trailEnabled = document.getElementById('trail-effect').checked;
        if (trailEnabled && !trailLayer) {
            trailLayer = L.layerGroup().addTo(map);
        }

        const speed = parseFloat(document.getElementById('animation-speed').value);
        const interval = 500 / speed;

        animationInterval = setInterval(() => {
            if (currentAnimationIndex >= gpsPoints.length - 1) {
                pauseAnimation();
                return;
            }

            currentAnimationIndex++;
            const point = gpsPoints[currentAnimationIndex];
            animationMarker.setLatLng([point.lat, point.lng]);

            // Update trail
            const trailEnabled = document.getElementById('trail-effect').checked;
            if (trailEnabled && trailLayer) {
                const trailLen = parseInt(document.getElementById('trail-length').value);
                const startIdx = Math.max(0, currentAnimationIndex - trailLen);
                const trailCoords = gpsPoints.slice(startIdx, currentAnimationIndex + 1).map(p => [p.lat, p.lng]);

                trailLayer.clearLayers();
                if (trailCoords.length > 1) {
                    L.polyline(trailCoords, {
                        color: animMarkerColor,
                        weight: 4,
                        opacity: 0.6
                    }).addTo(trailLayer);
                }
            }

            const followMode = document.getElementById('follow-mode').checked;
            if (followMode) {
                map.setView([point.lat, point.lng], map.getZoom());
            }

            updateProgress();
        }, interval);

        console.log('Animation started');
    } catch (error) {
        console.error('Error starting animation:', error);
        pauseAnimation();
    }
}

function pauseAnimation() {
    try {
        console.log('Pausing animation...');
        isAnimating = false;
        document.getElementById('play-icon').textContent = '▶';
        document.getElementById('play-text').textContent = translations[currentLang].play;

        if (animationInterval) {
            clearInterval(animationInterval);
            animationInterval = null;
        }
    } catch (error) {
        console.error('Error pausing animation:', error);
    }
}

function resetAnimation() {
    try {
        console.log('Resetting animation...');
        pauseAnimation();
        currentAnimationIndex = 0;

        if (animationMarker) {
            map.removeLayer(animationMarker);
            animationMarker = null;
        }

        if (trailLayer) {
            map.removeLayer(trailLayer);
            trailLayer = null;
        }

        updateProgress();
        console.log('Animation reset');
    } catch (error) {
        console.error('Error resetting animation:', error);
    }
}



function updateProgress() {
    try {
        if (!gpsPoints || gpsPoints.length === 0) return;

        const progress = gpsPoints.length > 1 ? (currentAnimationIndex / (gpsPoints.length - 1)) * 100 : 0;
        document.getElementById('progress-fill').style.width = progress + '%';
        document.getElementById('time-display').textContent = `${currentAnimationIndex + 1} / ${gpsPoints.length}`;
    } catch (error) {
        console.error('Error updating progress:', error);
    }
}

// POI Editor Logic
function setupPOIEditor() {
    try {
        // Initialize layer
        poiLayer = L.layerGroup().addTo(map);

        // Toggle Edit Mode
        const toggle = document.getElementById('poi-edit-mode');
        if (toggle) {
            toggle.addEventListener('change', (e) => {
                isPOIEditMode = e.target.checked;
                const mapDiv = document.getElementById('map');
                if (isPOIEditMode) {
                    mapDiv.style.cursor = 'crosshair';
                    showNotification('Click on map to add a Point of Interest', 'info');
                } else {
                    mapDiv.style.cursor = 'grab';
                }
            });
        }

        // Clear POIs
        const clearBtn = document.getElementById('clear-pois-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Delete all custom POIs?')) {
                    customPOIs = [];
                    poiLayer.clearLayers();
                    updatePOIList();
                    showNotification('All POIs deleted', 'info');
                }
            });
        }

        // Map Click
        map.on('click', (e) => {
            if (isPOIEditMode) {
                openPOIModal(e.latlng.lat, e.latlng.lng);
            }
        });

        console.log('POI Editor initialized');
    } catch (e) {
        console.error('Error setting up POI editor:', e);
    }
}

function openPOIModal(lat, lng) {
    const latFixed = lat.toFixed(5);
    const lngFixed = lng.toFixed(5);

    const content = `
        <div class="poi-form-container" style="padding: 10px;">
            <p style="margin-bottom: 15px; color: #666; font-size: 0.9em;">Location: ${latFixed}, ${lngFixed}</p>
            
            <div class="form-group" style="margin-bottom: 15px;">
                <label style="display:block; margin-bottom: 5px; font-weight: bold;">Name</label>
                <input type="text" id="poi-input-name" class="form-control" placeholder="Point Name" style="width: 100%; padding: 8px;">
            </div>
            
            <div class="form-group" style="margin-bottom: 15px;">
                <label style="display:block; margin-bottom: 5px; font-weight: bold;">Type</label>
                <select id="poi-input-type" class="form-control" style="width: 100%; padding: 8px;">
                    <option value="generic">📍 Generic Marker</option>
                    <option value="viewpoint">📷 Viewpoint</option>
                    <option value="food">🍔 Food / Restaurant</option>
                    <option value="water">💧 Water Source</option>
                    <option value="hotel">🏨 Accommodation</option>
                    <option value="camp">⛺ Camp Site</option>
                    <option value="danger">⚠️ Danger / Warning</option>
                    <option value="info">ℹ️ Information</option>
                    <option value="parking">🅿️ Parking</option>
                </select>
            </div>
            
            <div class="form-group" style="margin-bottom: 20px;">
                <label style="display:block; margin-bottom: 5px; font-weight: bold;">Description</label>
                <textarea id="poi-input-desc" class="form-control" rows="3" style="width: 100%; padding: 8px;"></textarea>
            </div>
            
            <button id="save-poi-btn" class="btn btn-primary" style="width: 100%; padding: 10px;">Save POI</button>
        </div>
    `;

    openModal('Add Point of Interest', content);

    // Attach handler immediately (synchronous)
    const btn = document.getElementById('save-poi-btn');
    if (btn) {
        btn.addEventListener('click', () => {
            const name = document.getElementById('poi-input-name').value || 'New Point';
            const type = document.getElementById('poi-input-type').value;
            const desc = document.getElementById('poi-input-desc').value;

            addPOI({
                lat: lat,
                lng: lng,
                name: name,
                type: type,
                desc: desc,
                id: Date.now()
            });

            closeModal();
        });

        // Focus name input
        const nameInput = document.getElementById('poi-input-name');
        if (nameInput) nameInput.focus();
    } else {
        console.error('Save POI button not found after modal open');
    }
}

function addPOI(poi) {
    customPOIs.push(poi);
    renderPOI(poi);
    updatePOIList();
}

function renderPOI(poi) {
    if (!poiLayer) return;

    const icons = {
        'generic': '📍',
        'viewpoint': '📷',
        'food': '🍔',
        'water': '💧',
        'hotel': '🏨',
        'camp': '⛺',
        'danger': '⚠️',
        'info': 'ℹ️',
        'parking': '🅿️'
    };

    const iconChar = icons[poi.type] || '📍';

    const marker = L.marker([poi.lat, poi.lng], {
        icon: L.divIcon({
            className: 'custom-poi-marker',
            html: `<div style="font-size: 24px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); text-align: center; margin-top: -24px;">${iconChar}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        })
    });

    // Create popup content elements using DOM to avoid inline script (CSP)
    const popupDiv = document.createElement('div');
    popupDiv.style.minWidth = '200px';

    const titleH3 = document.createElement('h3');
    titleH3.style.margin = '0 0 5px 0';
    titleH3.textContent = poi.name; // TextContent is safe
    popupDiv.appendChild(titleH3);

    if (poi.desc) {
        const descP = document.createElement('p');
        descP.style.margin = '0 0 10px 0';
        descP.style.color = '#666';
        descP.textContent = poi.desc;
        popupDiv.appendChild(descP);
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete POI';
    deleteBtn.style.color = 'red';
    deleteBtn.style.background = 'none';
    deleteBtn.style.border = 'none';
    deleteBtn.style.padding = '0';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.textDecoration = 'underline';

    // Attach listener
    deleteBtn.addEventListener('click', function () {
        deletePOI(poi.id);
    });

    popupDiv.appendChild(deleteBtn);

    marker.bindPopup(popupDiv);
    marker.addTo(poiLayer);

    // Store marker reference
    poi.marker = marker;
}

// Global delete function
window.deletePOI = function (id) {
    const index = customPOIs.findIndex(p => p.id === id);
    if (index !== -1) {
        if (customPOIs[index].marker) {
            poiLayer.removeLayer(customPOIs[index].marker);
        }
        customPOIs.splice(index, 1);
        updatePOIList();
        map.closePopup();
    }
};

function updatePOIList() {
    const list = document.getElementById('poi-list');
    if (!list) return;

    list.innerHTML = ''; // Clear list

    if (customPOIs.length === 0) {
        const p = document.createElement('p');
        p.className = 'info-text';
        p.style.textAlign = 'center';
        p.textContent = 'No POIs added';
        list.appendChild(p);
        return;
    }

    const icons = {
        'generic': '📍', 'viewpoint': '📷', 'food': '🍔', 'water': '💧',
        'hotel': '🏨', 'camp': '⛺', 'danger': '⚠️', 'info': 'ℹ️', 'parking': '🅿️'
    };

    customPOIs.forEach(poi => {
        const item = document.createElement('div');
        item.className = 'poi-item';
        item.style.padding = '8px';
        item.style.borderBottom = '1px solid #eee';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';

        // Content Div
        const contentDiv = document.createElement('div');
        contentDiv.style.cursor = 'pointer';

        // Icon
        const iconSpan = document.createElement('span');
        iconSpan.style.marginRight = '5px';
        iconSpan.textContent = icons[poi.type] || '📍';
        contentDiv.appendChild(iconSpan);

        // Name
        const nameStrong = document.createElement('strong');
        nameStrong.textContent = poi.name; // Safe
        contentDiv.appendChild(nameStrong);

        // Click to view
        contentDiv.addEventListener('click', () => {
            map.setView([poi.lat, poi.lng], 16);
        });

        item.appendChild(contentDiv);

        // Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.style.border = 'none';
        deleteBtn.style.background = 'none';
        deleteBtn.style.cursor = 'pointer';

        deleteBtn.addEventListener('click', () => {
            deletePOI(poi.id);
        });

        item.appendChild(deleteBtn);
        list.appendChild(item);
    });
}

// OSM POI Database Logic
function setupOSMDatabase() {
    try {
        // Initialize multi-layer dictionary if not already done
        if (!osmLayers) osmLayers = {};

        const fetchBtn = document.getElementById('fetch-osm-btn');
        if (fetchBtn) {
            fetchBtn.addEventListener('click', fetchOSMData);
        }

        // Initial update of controls (likely empty)
        updateOSMLayerControls();

        console.log('OSM Database initialized (Multi-Layer)');
    } catch (e) {
        console.error('Error setting up OSM database:', e);
    }
}

async function fetchOSMData() {
    try {
        if (!map) return;

        const btn = document.getElementById('fetch-osm-btn');
        const originalText = btn.textContent;
        btn.textContent = '⏳ Loading...';
        btn.disabled = true;

        const bounds = map.getBounds();

        // Add 10% buffer to fetch slightly outside visible area
        const latSpan = bounds.getNorth() - bounds.getSouth();
        const lngSpan = bounds.getEast() - bounds.getWest();
        const latBuffer = latSpan * 0.1;
        const lngBuffer = lngSpan * 0.1;

        const s = bounds.getSouth() - latBuffer;
        const w = bounds.getWest() - lngBuffer;
        const n = bounds.getNorth() + latBuffer;
        const e = bounds.getEast() + lngBuffer;

        // Safety check for view size (approx 1 degree ~ 111km)
        if ((n - s) > 1 || (e - w) > 1) {
            if (!confirm('Area is very large. This might take a while or fail. Continue?')) {
                btn.textContent = originalText;
                btn.disabled = false;
                return;
            }
        }

        const category = document.getElementById('osm-category').value;
        let queryFilter = '';

        switch (category) {
            case 'tourism':
                queryFilter = 'node["tourism"~"viewpoint|museum|hotel|hostel|information|attraction"]';
                break;
            case 'sustenance':
                queryFilter = 'node["amenity"~"restaurant|cafe|fast_food|bar|pub|biergarten"]';
                break;
            case 'water':
                queryFilter = 'node["amenity"="drinking_water"]; node["natural"="spring"]';
                break;
            case 'peaks':
                queryFilter = 'node["natural"="peak"]';
                break;
            case 'historic':
                queryFilter = 'node["historic"~"castle|ruins|monument|memorial|archaeological_site"]';
                break;
            case 'camping':
                queryFilter = 'node["tourism"~"camp_site|caravan_site|picnic_site"]';
                break;

            // EXTENDED CATEGORIES - Explicit node/way/relation syntax for compatibility
            case 'huts':
                queryFilter = 'node["tourism"="alpine_hut"]; way["tourism"="alpine_hut"];';
                break;
            case 'nsg': // Nature Reserves - broader query
                queryFilter = 'node["leisure"="nature_reserve"]; way["leisure"="nature_reserve"]; relation["leisure"="nature_reserve"]; node["boundary"="protected_area"]["protect_class"~"1|2|3|4"]; way["boundary"="protected_area"]["protect_class"~"1|2|3|4"]; relation["boundary"="protected_area"]["protect_class"~"1|2|3|4"];';
                break;
            case 'lsg': // Landscape Protection - broader query
                queryFilter = 'node["boundary"="protected_area"]["protect_class"="5"]; way["boundary"="protected_area"]["protect_class"="5"]; relation["boundary"="protected_area"]["protect_class"="5"];';
                break;
            case 'vsg': // Bird Sanctuaries (Natura 2000 / Vogelschutz)
                queryFilter = 'node["boundary"="protected_area"]["protect_class"="98"]; way["boundary"="protected_area"]["protect_class"="98"]; relation["boundary"="protected_area"]["protect_class"="98"];';
                break;
            case 'ffh': // FFH Areas (Flora Fauna Habitat / Natura 2000)
                queryFilter = 'node["boundary"="protected_area"]["protect_class"~"97|98"]; way["boundary"="protected_area"]["protect_class"~"97|98"]; relation["boundary"="protected_area"]["protect_class"~"97|98"];';
                break;
            case 'transport':
                queryFilter = 'node["highway"="bus_stop"]; node["railway"="station"]; node["public_transport"~"station|stop_position"];';
                break;

            default:
                queryFilter = 'node["tourism"]';
        }

        // Construct Overpass QL - BBox format: (south, west, north, east)
        const bbox = `(${s},${w},${n},${e})`;

        // Handle multiple statements
        let queryBody = '';
        if (queryFilter.includes(';')) {
            const parts = queryFilter.split(';');
            parts.forEach(p => {
                if (p.trim()) queryBody += `${p.trim()}${bbox};`;
            });
        } else {
            queryBody = `${queryFilter}${bbox};`;
        }

        // USE "out center" to get center coordinates for Ways/Relations
        const query = `[out:json][timeout:45];( ${queryBody} ); out center 500;`;

        console.log('OSM Query:', query);

        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query
        });

        // Get raw text first to handle Overpass error messages
        const responseText = await response.text();

        // Check for specific Overpass/Server errors first
        if (!response.ok || responseText.includes('remark') && responseText.includes('busy')) {
            console.warn('Overpass API Issue:', response.status, responseText.substring(0, 200));

            // Friendly Handling for "Too Many Requests" or "Gateway Timeout" or "Server Busy"
            if (response.status === 429 || response.status === 504 || responseText.includes('busy') || responseText.includes('timeout')) {
                showNotification('🌍 Server Busy or Area Too Large. Please zoom in and try again.', 'warning');
                // Return early without throwing error to avoid scary error modal
                btn.textContent = originalText;
                btn.disabled = false;
                return;
            }

            throw new Error(`OSM Error (${response.status})`);
        }

        // Try to parse JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseErr) {
            console.error('Failed to parse OSM response:', responseText.substring(0, 500));
            // Check if HTML likely means server error page
            if (responseText.trim().startsWith('<')) {
                showNotification('🌍 Server Busy. Please zoom in to reduce data load.', 'warning');
                btn.textContent = originalText;
                btn.disabled = false;
                return;
            }
            throw new Error('Invalid JSON response from OSM.');
        }

        // Always render to ensure layer appears in list (even if empty)
        renderOSMData(data.elements || [], category);

        if (!data.elements || data.elements.length === 0) {
            showNotification(`No locations found for '${category}' in this view. Layer added (empty).`, 'info');
        } else {
            showNotification(`Loaded ${data.elements.length} points for '${category}'`, 'success');
        }

        btn.textContent = originalText;
        btn.disabled = false;

    } catch (err) {
        console.error('Error fetching OSM data:', err);
        const btn = document.getElementById('fetch-osm-btn');
        if (btn) {
            btn.textContent = '⬇️ Load in View';
            btn.disabled = false;
        }

        // Show detailed error in a modal for debugging
        const errorMsg = err.message || 'Unknown error';
        showNotification(`OSM Error: ${errorMsg.substring(0, 100)}...`, 'error');

        // Also log full error for debugging
        console.error('Full OSM Error:', errorMsg);
    }
}

function renderOSMData(elements, category) {
    // Labels for UI
    const categoryLabels = {
        'tourism': 'Tourism', 'sustenance': 'Food & Drink', 'water': 'Water',
        'peaks': 'Peaks', 'historic': 'Historic', 'camping': 'Camping',
        'huts': 'Alpine Huts', 'nsg': 'Nature Reserves', 'lsg': 'Landscape Prot.',
        'vsg': 'Bird Sanctuaries', 'ffh': 'FFH Areas', 'transport': 'Transport'
    };
    const label = categoryLabels[category] || category;

    // Create or Clear specific layer
    if (osmLayers[category]) {
        osmLayers[category].clearLayers();
    } else {
        osmLayers[category] = L.layerGroup();
    }

    // Add to map immediately
    if (!map.hasLayer(osmLayers[category])) {
        osmLayers[category].addTo(map);
    }

    const icons = {
        'tourism': '📷', 'sustenance': '🍔', 'water': '💧', 'peaks': '⛰️',
        'historic': '🏰', 'camping': '⛺', 'huts': '🛖', 'nsg': '🌳',
        'lsg': '🏞️', 'vsg': '🦅', 'ffh': '🌿', 'transport': '🚌'
    };

    const iconChar = icons[category] || '📍';

    elements.forEach(el => {
        // Handle Ways/Relations which return 'center' {lat, lon} instead of direct lat/lon
        const lat = el.lat || el.center?.lat;
        const lon = el.lon || el.center?.lon;

        if (lat && lon) {
            const name = el.tags?.name || el.tags?.description || el.tags?.protection_title || 'Unnamed';
            let type = el.tags?.amenity || el.tags?.tourism || el.tags?.natural || el.tags?.historic || label;

            // Robust Elevation Parsing
            let ele = el.tags?.ele || el.tags?.['ele:msl'] || el.tags?.altitude || el.tags?.height || null;
            if (ele) {
                // Sanitize: remove 'm', 'ft', or other text, parse as float
                const numEle = parseFloat(ele);
                if (!isNaN(numEle)) ele = numEle;
            }

            const marker = L.marker([lat, lon], {
                icon: L.divIcon({
                    className: 'osm-poi-marker',
                    html: `<div style="font-size: 20px; text-shadow: 0 0 2px white; text-align: center; margin-top: -20px;">${iconChar}</div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })
            });

            const popup = `
                <div class="osm-popup">
                    <strong style="font-size: 1.1em;">${sanitizeText(name)}</strong><br>
                    <span style="color: #666; font-size: 0.9em;">${sanitizeText(type)}</span>
                    ${ele ? `<br>⛰️ ${ele}m` : ''}
                    ${el.tags?.website ? `<br><a href="${sanitizeURL(el.tags.website)}" target="_blank">Website</a>` : ''}
                    ${el.tags?.wikipedia ? `<br><a href="${getWikipediaUrl(el.tags.wikipedia)}" target="_blank">Wikipedia</a>` : ''}
                </div>
            `;

            marker.bindPopup(popup);
            marker.addTo(osmLayers[category]);
        }
    });

    // Update the Sidebar UI
    updateOSMLayerControls();
}

function updateOSMLayerControls() {
    const list = document.getElementById('osm-layers-list');
    if (!list) return;

    list.innerHTML = ''; // Clear

    const categories = Object.keys(osmLayers);

    if (categories.length === 0) {
        const p = document.createElement('p');
        p.className = 'info-text';
        p.style.color = '#888';
        p.textContent = 'No data loaded yet.';
        list.appendChild(p);
        return;
    }

    const categoryLabels = {
        'tourism': '📷 Tourism', 'sustenance': '🍔 Food', 'water': '💧 Water',
        'peaks': '⛰️ Peaks', 'historic': '🏰 Historic', 'camping': '⛺ Camping',
        'huts': '🛖 Huts', 'nsg': '🌳 NSG', 'lsg': '🏞️ LSG',
        'vsg': '🦅 Birds', 'ffh': '🌿 FFH', 'transport': '🚌 Transport'
    };

    categories.forEach(cat => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        item.style.background = 'var(--bg-secondary, #f8f9fa)';
        item.style.color = 'var(--text-color, inherit)';
        item.style.padding = '5px 8px';
        item.style.borderRadius = '4px';
        item.style.marginBottom = '4px';

        // Get count
        const count = osmLayers[cat] ? osmLayers[cat].getLayers().length : 0;
        const catName = categoryLabels[cat] || cat;
        const displayName = `${catName} (${count})`;

        // Checkbox + Label Container
        const leftDiv = document.createElement('div');
        leftDiv.style.display = 'flex';
        leftDiv.style.alignItems = 'center';
        leftDiv.style.gap = '8px';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = map.hasLayer(osmLayers[cat]);
        checkbox.id = `toggle-layer-${cat}`;

        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                if (!map.hasLayer(osmLayers[cat])) map.addLayer(osmLayers[cat]);
            } else {
                if (map.hasLayer(osmLayers[cat])) map.removeLayer(osmLayers[cat]);
            }
        });

        const label = document.createElement('label');
        label.htmlFor = `toggle-layer-${cat}`;
        label.textContent = displayName;
        label.style.fontSize = '0.9em';
        label.style.cursor = 'pointer';

        leftDiv.appendChild(checkbox);
        leftDiv.appendChild(label);

        // Remove Button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '✕';
        removeBtn.title = 'Remove Layer';
        removeBtn.style.border = 'none';
        removeBtn.style.background = 'none';
        removeBtn.style.color = '#dc3545'; // Red
        removeBtn.style.cursor = 'pointer';
        removeBtn.style.fontWeight = 'bold';

        removeBtn.addEventListener('click', () => {
            if (map.hasLayer(osmLayers[cat])) map.removeLayer(osmLayers[cat]);
            delete osmLayers[cat];
            updateOSMLayerControls();
        });

        item.appendChild(leftDiv);
        item.appendChild(removeBtn);
        list.appendChild(item);
    });
}

// GPX Export
function exportGPX() {
    try {
        if (!gpsPoints || gpsPoints.length === 0) {
            showNotification('No GPS data to export', 'warning');
            return;
        }

        console.log('Starting GPX export with', gpsPoints.length, 'points...');

        let gpxContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
        gpxContent += '<gpx version="1.1" creator="GPS Track Viewer Pro" xmlns="http://www.topografix.com/GPX/1/1">\n';
        gpxContent += `    <name>GPS Track Create ${new Date().toISOString().split('T')[0]}</name>\n`;
        gpxContent += '  </metadata>\n';

        // Export Custom POIs (Waypoints must be before Track)
        if (customPOIs && customPOIs.length > 0) {
            customPOIs.forEach(poi => {
                gpxContent += `  <wpt lat="${poi.lat}" lon="${poi.lng}">\n`;
                gpxContent += `    <name>${sanitizeText(poi.name)}</name>\n`;
                gpxContent += `    <desc>${sanitizeText(poi.desc)}</desc>\n`;
                gpxContent += `    <sym>${poi.type}</sym>\n`;
                gpxContent += '  </wpt>\n';
            });
        }

        gpxContent += '  <trk>\n';
        gpxContent += `    <name>GPS Track ${new Date().toISOString().split('T')[0]}</name>\n`;
        gpxContent += '    <trkseg>\n';

        gpsPoints.forEach(point => {
            gpxContent += `      <trkpt lat="${point.lat}" lon="${point.lng}">\n`;
            if (point.altitude) {
                gpxContent += `        <ele>${point.altitude}</ele>\n`;
            }
            if (point.timestamp) {
                gpxContent += `        <time>${new Date(point.timestamp).toISOString()}</time>\n`;
            }
            gpxContent += '      </trkpt>\n';
        });

        gpxContent += '    </trkseg>\n';
        gpxContent += '  </trk>\n';
        gpxContent += '</gpx>';

        const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `gps-track-${Date.now()}.gpx`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('GPX export successful');
        showNotification('GPX file exported successfully', 'success');

    } catch (error) {
        console.error('GPX export error:', error);
        showNotification('GPX export failed', 'error');
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    if (initMap()) {
        // Setup Components
        setupPOIEditor();
        setupOSMDatabase();
        initChart();

        // Initial Language
        updateLanguage(currentLang);

        // File Upload Listener
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');

        if (dropZone && fileInput) {
            dropZone.addEventListener('click', () => fileInput.click());

            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('drag-over');
            });

            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('drag-over');
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
                handleFileUpload(e.dataTransfer.files);
            });

            fileInput.addEventListener('change', (e) => {
                handleFileUpload(e.target.files);
            });
        }
    }
});

// Force show elevation details (Fix for missing menu point)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const elevationDetails = document.getElementById('elevation-details');
        if (elevationDetails) {
            elevationDetails.style.display = 'block';
            console.log('Elevation profile forced visible');
        }
    }, 1000);
});
