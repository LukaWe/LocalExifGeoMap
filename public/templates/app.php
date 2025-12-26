<?php
/**
 * GPS Track Viewer - Main Application Template
 * 
 * This file is rendered by the Renderer class.
 * Available variables:
 *   - $nonce: CSP nonce for inline scripts
 *   - $assetUrl(string): Helper function to generate asset URLs with token
 * 
 * @package gps-track-viewer
 */
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>GPS Track Viewer</title>
    
    <!-- Leaflet CSS (local) -->
    <link rel="stylesheet" href="/vendor/leaflet/leaflet.css" />
    
    <!-- Inter Font (local) -->
    <link rel="stylesheet" href="/vendor/fonts/inter.css">
    
    <!-- Application CSS (served through PHP) -->
    <link rel="stylesheet" href="<?= $assetUrl('styles.css') ?>">
</head>
<body>
    <!-- Sidebar -->
    <aside class="sidebar">
        <!-- Sidebar Header -->
        <div class="sidebar-header">
            <h1 id="app-title" data-i18n="title">GPS Track Viewer</h1>
        </div>
        
        <!-- Sidebar Controls Section - COMPACT LAYOUT -->
        <div class="sidebar-controls-compact">
            <!-- ROW 1: Language + Dark Mode (side by side) -->
            <div class="control-row">
                <div class="control-half">
                    <label class="control-label-small">
                        <span id="language-icon">🌐</span>
                        <span data-i18n="language">Language</span>
                    </label>
                    <select id="language-dropdown" class="control-select-small">
                        <option value="en">🇬🇧 English</option>
                        <option value="de">🇩🇪 Deutsch</option>
                        <option value="it">🇮🇹 Italiano</option>
                        <option value="hr">🇭🇷 Hrvatski</option>
                        <option value="pl">🇵🇱 Polski</option>
                        <option value="es">🇪🇸 Español</option>
                        <option value="uk">🇺🇦 Українська</option>
                        <option value="nl">🇳🇱 Nederlands</option>
                        <option value="sv">🇸🇪 Svenska</option>
                        <option value="no">🇳🇴 Norsk</option>
                        <option value="by">🇩🇪 Bayerisch</option>
                    </select>
                </div>
                
                <div class="control-half">
                    <label class="control-label-small">🌙 <span data-i18n="dark_mode">Dark</span></label>
                    <button id="dark-mode-toggle" class="toggle-btn-small">Off</button>
                </div>
            </div>
            
            <!-- ROW 2: FAQ + Contact (side by side) -->
            <div class="control-row">
                <button id="menu-faq" class="menu-btn-compact">
                    <span class="menu-icon-compact">❓</span>
                    <span class="menu-label-compact" data-i18n="faq">FAQ</span>
                </button>
                
                <button id="menu-contact" class="menu-btn-compact">
                    <span class="menu-icon-compact">📧</span>
                    <span class="menu-label-compact" data-i18n="contact">Contact</span>
                </button>
            </div>
            
            <!-- ROW 3: Donations + Credits (side by side) -->
            <div class="control-row">
                <button id="menu-donations" class="menu-btn-compact">
                    <span class="menu-icon-compact">💰</span>
                    <span class="menu-label-compact" data-i18n="donations">Donations</span>
                </button>
                
                <button id="menu-credits" class="menu-btn-compact">
                    <span class="menu-icon-compact">🙏</span>
                    <span class="menu-label-compact" data-i18n="credits">Credits</span>
                </button>
            </div>
        </div>
        
        <!-- Divider -->
        <div class="sidebar-divider"></div>
        
        <!-- Sidebar Content -->
        <div class="sidebar-content">

                <!-- 1. ANALYZE IMAGES - FIRST! -->
                <details open>
                    <summary>
                        <span class="section-icon">📤</span>
                        <span class="section-title" data-i18n="upload_section">Bilder hochladen</span>
                    </summary>
                    <div class="section-content">
                    <div class="file-input-wrapper">
                        <input type="file" id="file-input" accept="image/*" multiple>
                        <label for="file-input" class="file-input-label" data-i18n="select_images">Bilder auswählen</label>
                    </div>
                    <div class="stats">
                        <div class="stats-row">
                            <span class="stats-label" data-i18n="uploaded_images">Hochgeladene Bilder:</span>
                            <span class="stats-value" id="total-images">0</span>
                        </div>
                        <div class="stats-row">
                            <span class="stats-label" data-i18n="images_with_gps">Bilder mit GPS-Daten:</span>
                            <span class="stats-value" id="gps-images">0</span>
                        </div>
                        <div class="stats-row" style="margin-top: 5px; justify-content: center;">
                            <a href="#elevation-details" id="jump-to-elevation" class="text-link" style="font-size: 11px; text-decoration: underline; color: var(--primary-color);">Jump to Elevation Profile</a>
                        </div>
                    </div>
                    <button class="btn btn-secondary" id="reset-btn" data-i18n="reset">Zurücksetzen</button>
                    </div>
                </details>
                

                <!-- 2. MAP STYLE -->
                <details>
                    <summary>
                        <span class="section-icon">🗺️</span>
                        <span class="section-title" data-i18n="map_style">Kartenstil</span>
                    </summary>
                    <div class="section-content">
                    <div class="form-group">
                        <select id="map-style-select">
                            <option value="0">OpenStreetMap Standard</option>
                            <option value="1">OpenStreetMap Cycle</option>
                            <option value="2">OpenTopoMap</option>
                            <option value="3">Esri WorldImagery</option>
                            <option value="4">Esri WorldStreetMap</option>
                            <option value="5">Esri WorldTopoMap</option>
                            <option value="6">CartoDB Positron</option>
                            <option value="7">CartoDB Dark Matter</option>
                            <option value="8">CartoDB Voyager</option>
                            <option value="9">Humanitarian OSM</option>
                            <option value="10">OPNVKarte (Transport)</option>
                            <option value="11">OpenRailwayMap</option>
                        </select>
                    </div>
                    </div>
                </details>
                
                <!-- 2. TRACK LINE -->
                <details>
                    <summary>
                        <span class="section-icon">📏</span>
                        <span class="section-title" data-i18n="track_line">Streckenlinie</span>
                    </summary>
                    <div class="section-content">
                    <div class="checkbox-group">
                        <label>
                            <input type="checkbox" id="show-line" checked>
                            <span data-i18n="show_line">Linie anzeigen</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="form-label" data-i18n="line_color">Linienfarbe</label>
                        <input type="color" id="track-color" value="#FF0000">
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <span data-i18n="line_thickness">Linienstärke</span>
                            <span class="slider-value" id="line-thickness-value">3</span>
                        </label>
                        <input type="range" id="line-thickness" min="1" max="20" value="3">
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <span data-i18n="line_opacity">Liniendeckkraft</span>
                            <span class="slider-value" id="line-opacity-value">80%</span>
                        </label>
                        <input type="range" id="line-opacity" min="0" max="100" value="80">
                    </div>
                    <div class="form-group">
                        <label class="form-label" data-i18n="line_style">Linienstil</label>
                        <select id="line-style">
                            <option value="">Durchgezogen / Solid</option>
                            <option value="10, 10">Gestrichelt / Dashed</option>
                            <option value="2, 5">Gepunktet / Dotted</option>
                            <option value="10, 5, 2, 5">Strich-Punkt / Dash-Dot</option>
                        </select>
                    </div>
                    </div>
                </details>
                
                <!-- 3. TRACK POINTS -->
                <details>
                    <summary>
                        <span class="section-icon">🔴</span>
                        <span class="section-title" data-i18n="track_points">Streckenpunkte</span>
                    </summary>
                    <div class="section-content">
                    <div class="checkbox-group">
                        <label>
                            <input type="checkbox" id="show-points">
                            <span data-i18n="show_points">Punkte anzeigen</span>
                        </label>
                    </div>
                    
                    <!-- Show Timestamps Toggle -->
                    <div class="checkbox-group" style="margin-left: 20px; margin-top: 8px;">
                        <label>
                            <input type="checkbox" id="show-point-timestamps">
                            <span data-i18n="show_point_timestamps">Show Timestamps on All Points</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="form-label" data-i18n="point_shape">Punktform</label>
                        <select id="point-shape">
                            <option value="circle">Kreis / Circle</option>
                            <option value="square">Quadrat / Square</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" data-i18n="point_color">Punktfarbe</label>
                        <input type="color" id="point-color" value="#FF0000">
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <span data-i18n="point_size">Punktgröße</span>
                            <span class="slider-value" id="point-size-value">6</span>
                        </label>
                        <input type="range" id="point-size" min="2" max="30" value="6">
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <span data-i18n="point_opacity">Punktdeckkraft</span>
                            <span class="slider-value" id="point-opacity-value">80%</span>
                        </label>
                        <input type="range" id="point-opacity" min="0" max="100" value="80">
                    </div>
                    <div class="form-group">
                        <label class="form-label" data-i18n="point_border_color">Punktrandfarbe</label>
                        <input type="color" id="point-border-color" value="#FFFFFF">
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <span data-i18n="point_border_width">Punktrandbreite</span>
                            <span class="slider-value" id="point-border-width-value">1</span>
                        </label>
                        <input type="range" id="point-border-width" min="0" max="5" value="1">
                    </div>
                    </div>
                </details>
                
                <!-- 7. POI EDITOR -->
                <details>
                    <summary>
                        <span class="section-icon">🚩</span>
                        <span class="section-title">Points of Interest</span>
                    </summary>
                    <div class="section-content">
                        <div class="checkbox-group">
                            <label>
                                <input type="checkbox" id="poi-edit-mode">
                                <span>Enable Editing Mode</span>
                            </label>
                            <p class="info-text" style="margin-left: 25px; margin-top: 5px;">Click map to add POI</p>
                        </div>
                        
                        <div class="form-group">
                             <button class="btn btn-secondary" id="clear-pois-btn" style="width: 100%; margin-top: 10px;">
                                <span class="btn-icon">🗑️</span> Clear All POIs
                             </button>
                        </div>

                        <div id="poi-list" class="poi-list" style="max-height: 200px; overflow-y: auto; margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 10px;">
                            <p class="info-text" style="text-align: center;">No POIs added</p>
                        </div>
                    </div>
                </details>

                <!-- 8. OSM DATA (NEW) -->
                <details>
                    <summary>
                        <span class="section-icon">🌍</span>
                        <span class="section-title">OpenStreetMap Data</span>
                    </summary>
                    <div class="section-content">
                        <div class="form-group">
                            <label class="form-label">Category</label>
                            <select id="osm-category" class="form-control" style="width: 100%;">
                                <option value="tourism">📷 Tourism (Viewpoints, Museums)</option>
                                <option value="sustenance">🍔 Food & Drink</option>
                                <option value="water">💧 Drinking Water</option>
                                <option value="peaks">⛰️ Peaks</option>
                                <option value="historic">🏰 Castles & Ruins</option>
                                <option value="camping">⛺ Camping</option>
                                <option value="huts">🛖 Alpine Huts</option>
                                <option value="nsg">🌳 Nature Reserves (NSG)</option>
                                <option value="lsg">🏞️ Landscape Protection (LSG)</option>
                                <option value="vsg">🦅 Bird Sanctuaries</option>
                                <option value="transport">🚌 Public Transport</option>
                                <option value="ffh">🌿 FFH Areas (Flora-Fauna-Habitat)</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <button id="fetch-osm-btn" class="btn btn-secondary" style="width: 100%;">
                                <span class="btn-icon">⬇️</span>
                                <span data-i18n="load_in_view">Load in View</span>
                            </button>
                             <p class="info-text" style="text-align: center; margin-top: 5px;">Loads up to 300 points in current view</p>
                        </div>

                        <!-- Dynamic Active Layers Control -->
                        <div id="osm-active-layers" style="margin-top: 15px; border-top: 1px solid var(--border-color); padding-top: 10px;">
                            <label class="form-label" style="margin-bottom: 5px;">Active Layers:</label>
                            <div id="osm-layers-list" class="checkbox-group" style="display: flex; flex-direction: column; gap: 5px;">
                                <p class="info-text" style="color: #888;">No data loaded yet.</p>
                            </div>
                        </div>
                    </div>
                </details>

                <!-- 4. ELEVATION PROFILE (MOVED UP) -->
                <details id="elevation-details">
                    <summary>
                        <span class="section-icon">📈</span>
                        <span class="section-title" data-i18n="elevation_profile">Elevation Profile</span>
                        <button id="expand-sidebar-btn" class="expand-sidebar-btn" title="Expand sidebar for better chart view">⇔</button>
                    </summary>
                    <div class="section-content">
                        <!-- Expand info text -->
                        <p class="info-text" style="margin-bottom: 10px; font-size: 12px;">💡 Click ⇔ to expand for better chart interaction</p>
                        
                        <!-- NO DATA STATE -->
                        <div id="elevation-no-data" style="text-align: center; padding: 20px; color: var(--text-secondary); background: var(--bg-color); border-radius: 6px; border: 1px dashed var(--border-color);">
                            <p style="margin: 0; font-size: 13px;">No elevation data available.</p>
                            <p style="margin: 5px 0 0 0; font-size: 11px; opacity: 0.8;">Upload photos with GPS altitude to view profile.</p>
                        </div>

                        <!-- Chart Container with FIXED HEIGHT to prevent jumping -->
                        <div id="elevation-chart-wrapper" style="position: relative; width: 100%; height: 250px; margin-bottom: 15px; background-color: var(--bg-color); border-radius: 6px; border: 1px solid var(--border-color); padding: 10px; box-sizing: border-box; overflow: hidden; display: none;">
                            <canvas id="elevation-canvas" style="display: block !important; width: 100% !important; height: 100% !important; max-width: 100%; max-height: 100%;"></canvas>
                        </div>
                        
                        <div class="elevation-stats" style="display: none;">
                            <div class="stat-row">
                                <span data-i18n="elevation_gain">Elevation Gain:</span>
                                <span id="elevation-gain" class="stat-value">--</span>
                            </div>
                            <div class="stat-row">
                                <span data-i18n="elevation_loss">Elevation Loss:</span>
                                <span id="elevation-loss" class="stat-value">--</span>
                            </div>
                            <div class="stat-row">
                                <span data-i18n="min_elevation">Min Elevation:</span>
                                <span id="min-elevation" class="stat-value">--</span>
                            </div>
                            <div class="stat-row">
                                <span data-i18n="max_elevation">Max Elevation:</span>
                                <span id="max-elevation" class="stat-value">--</span>
                            </div>
                        </div>
                    </div>
                </details>

                <!-- 9. HEATMAP - ENABLED BUT CLOSED (v19) -->
                <details id="heatmap-details">
                    <summary>
                        <span class="section-icon">🔥</span>
                        <span class="section-title" data-i18n="heatmap">Heatmap</span>
                    </summary>
                    <div class="section-content">
                    <div class="checkbox-group">
                        <label>
                            <input type="checkbox" id="enable-heatmap" checked>
                            <span data-i18n="enable_heatmap">Heatmap aktivieren</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="form-label" data-i18n="heatmap_scheme">Farbschema</label>
                        <select id="heatmap-scheme">
                            <option value="default">🔥 Feuer (Rot-Gelb)</option>
                            <option value="cool">❄️ Kühl (Blau-Cyan)</option>
                            <option value="earth">🌍 Erde (Gelb-Braun)</option>
                            <option value="marine">🌊 Marine (Dunkelblau-Cyan)</option>
                            <option value="twilight">🌅 Dämmerung (Lila-Orange)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <span data-i18n="heatmap_intensity">Intensität</span>
                            <span class="slider-value" id="heatmap-intensity-value">1.0</span>
                        </label>
                        <input type="range" id="heatmap-intensity" min="0.1" max="2.0" step="0.1" value="1.0">
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <span data-i18n="heatmap_radius">Radius (Pixel)</span>
                            <span class="slider-value" id="heatmap-radius-value">25</span>
                        </label>
                        <input type="range" id="heatmap-radius" min="10" max="100" step="5" value="25">
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <span data-i18n="heatmap_blur">Weichzeichner</span>
                            <span class="slider-value" id="heatmap-blur-value">25</span>
                        </label>
                        <input type="range" id="heatmap-blur" min="10" max="100" step="5" value="25">
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <span data-i18n="heatmap_opacity">Deckkraft</span>
                            <span class="slider-value" id="heatmap-opacity-value">100%</span>
                        </label>
                        <input type="range" id="heatmap-opacity" min="0" max="100" step="5" value="100">
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <span data-i18n="heatmap_min_points">Min. Punkte</span>
                            <input type="number" id="heatmap-min-points" min="1" max="100" value="1" style="width: 60px; margin-left: 8px;">
                        </label>
                    </div>
                    </div>
                </details>
                

                <!-- 5. TRACK MARKERS -->
                <details>
                    <summary>
                        <span class="section-icon">📍</span>
                        <span class="section-title" data-i18n="track_markers">Streckenmarkierungen</span>
                    </summary>
                    <div class="section-content">
                    <div class="checkbox-group">
                        <label>
                            <input type="checkbox" id="show-markers">
                            <span data-i18n="show_markers">Markierungen anzeigen</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <span data-i18n="marker_frequency">Markierungshäufigkeit</span>
                            <span class="slider-value" id="marker-frequency-value">1</span>
                        </label>
                        <input type="range" id="marker-frequency" min="1" max="50" value="1">
                        <p class="info-text" data-i18n="every_nth_point">Jeden N-ten Punkt anzeigen</p>
                    </div>
                    <div class="form-group">
                        <label class="form-label" data-i18n="marker_color">Markierungsfarbe</label>
                        <input type="color" id="marker-color" value="#FF0000">
                    </div>
                    </div>
                </details>
                
                <!-- 6. DIRECTION ARROWS -->
                <details>
                    <summary>
                        <span class="section-icon">➡️</span>
                        <span class="section-title" data-i18n="direction_arrows">Richtungspfeile</span>
                    </summary>
                    <div class="section-content">
                    <div class="checkbox-group">
                        <label>
                            <input type="checkbox" id="show-arrows">
                            <span data-i18n="show_arrows">Pfeile anzeigen</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <span data-i18n="arrow_size">Pfeilgröße</span>
                            <span class="slider-value" id="arrow-size-value">12</span>
                        </label>
                        <input type="range" id="arrow-size" min="5" max="30" value="12">
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <span data-i18n="arrow_spacing">Pfeilabstand</span>
                            <span class="slider-value" id="arrow-spacing-value">50</span>
                        </label>
                        <input type="range" id="arrow-spacing" min="20" max="200" value="50">
                    </div>
                    <div class="form-group">
                        <label class="form-label" data-i18n="arrow_color">Pfeilfarbe</label>
                        <input type="color" id="arrow-color" value="#FF0000">
                    </div>
                    </div>
                </details>
                

                
                <!-- 8. ELEVATION PROFILE -->
                <details>
                    <summary>
                        <span class="section-icon">▶️</span>
                        <span class="section-title" data-i18n="animation">Animation</span>
                    </summary>
                    <div class="section-content">
                    <div class="animation-controls">
                        <button class="btn btn-primary play-btn" id="play-btn">
                            <span id="play-icon">▶</span>
                            <span id="play-text" data-i18n="play">Abspielen</span>
                        </button>
                        <div class="progress-bar">
                            <div class="progress-fill" id="progress-fill"></div>
                        </div>
                        <div class="time-display" id="time-display">0 / 0</div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <span data-i18n="speed">Geschwindigkeit</span>
                            <span class="slider-value" id="speed-value">1.0x</span>
                        </label>
                        <input type="range" id="animation-speed" min="0.5" max="5" step="0.5" value="1">
                    </div>
                    <div class="checkbox-group">
                        <label>
                            <input type="checkbox" id="follow-mode" checked>
                            <span data-i18n="follow_mode">Kamera folgt</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="form-label" data-i18n="marker_color_anim">Markerfarbe</label>
                        <input type="color" id="anim-marker-color" value="#FF0000">
                    </div>
                    <div class="checkbox-group">
                        <label>
                            <input type="checkbox" id="trail-effect">
                            <span data-i18n="trail_effect">Spureffekt</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="form-label">
                            <span data-i18n="trail_length">Spurlänge</span>
                            <span class="slider-value" id="trail-length-value">10</span>
                        </label>
                        <input type="range" id="trail-length" min="5" max="50" value="10">
                    </div>
                    <button class="btn btn-secondary" id="reset-animation" data-i18n="reset">Zurücksetzen</button>
                    </div>
                </details>
                
                <!-- OLD ELEVATION LOCATION REMOVED -->
                
                <!-- 10. ANIMATION (MOVED BELOW TIMELINE) -->
                <details>
                    <summary>
                        <span class="section-icon">📊</span>
                        <span class="section-title" data-i18n="statistics">Statistiken</span>
                    </summary>
                    <div class="section-content">
                    <div class="statistics-grid" id="statistics-grid">
                        <div class="stat-card">
                            <div class="stat-label" data-i18n="total_distance">Gesamtstrecke</div>
                            <div class="stat-value" id="stat-distance">0 km</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label" data-i18n="total_points">Anzahl Punkte</div>
                            <div class="stat-value" id="stat-points">0</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label" data-i18n="duration">Dauer</div>
                            <div class="stat-value" id="stat-duration">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label" data-i18n="avg_speed">Ø Geschwindigkeit</div>
                            <div class="stat-value" id="stat-speed">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label" data-i18n="elevation_gain">Höhengewinn</div>
                            <div class="stat-value" id="stat-elevation-gain">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label" data-i18n="elevation_loss">Höhenverlust</div>
                            <div class="stat-value" id="stat-elevation-loss">-</div>
                        </div>
                    </div>
                    </div>
                </details>
                
                <!-- 11. STATISTICS (MOVED BELOW TIMELINE) -->
                <details>
                    <summary>
                        <span class="section-icon">📅</span>
                        <span class="section-title" data-i18n="timeline">Timeline</span>
                    </summary>
                    <div class="section-content">
                        <div id="timeline-content" class="timeline-wrapper">
                            <p data-i18n="no_data" style="color: var(--text-secondary); text-align: center; padding: 20px;">No track data available</p>
                        </div>
                    </div>
                </details>
                
                <!-- 12. EXPORT MAP - DEFAULT OPEN -->
                <details open>
                    <summary>
                        <span class="section-icon">💾</span>
                        <span class="section-title" data-i18n="export">Karte exportieren</span>
                    </summary>
                    <div class="section-content">
                    <div class="export-buttons">
                        <button class="btn btn-primary export-full-width" id="export-png">
                            <span class="btn-icon">🖼️</span>
                            <span data-i18n="export_png">Export as PNG</span>
                        </button>
                        <button class="btn btn-primary export-full-width" id="export-gpx">
                            <span class="btn-icon">📍</span>
                            <span data-i18n="export_gpx">GPX Export</span>
                        </button>
                    </div>
                    <p class="info-text" data-i18n="export_info">Die Karte wird im aktuellen Zustand exportiert</p>
                    </div>
                </details>
        </div>
    </aside>
    
    <!-- Map Container -->
    <div class="map-container">
        <div id="map"></div>
    </div>
    
    <!-- Modal Overlay and Window -->
    <div id="modal-overlay" class="modal-overlay"></div>
    <div id="modal-content" class="modal-window">
        <div class="modal-header">
            <h2 id="modal-title">Modal</h2>
            <button id="modal-close" class="modal-close">✕</button>
        </div>
        <div id="modal-body" class="modal-body"></div>
    </div>
    
    <!-- Loading Overlay -->
    <div class="loading-overlay" id="loading-overlay">
        <div class="loading-content">
            <div class="spinner"></div>
            <p id="loading-text" data-i18n="processing">Verarbeite Bilder...</p>
            <div id="loading-progress" style="display: none; margin-top: 15px; width: 250px;">
                <div style="background: #e0e0e0; border-radius: 4px; height: 8px; overflow: hidden;">
                    <div id="loading-progress-bar" style="background: var(--primary-blue, #007bff); height: 100%; width: 0%; transition: width 0.2s ease;"></div>
                </div>
                <p id="loading-counter" style="margin-top: 8px; font-size: 14px; color: #666;">0 / 0</p>
            </div>
        </div>
    </div>
    
    <!-- Notification -->
    <div class="notification" id="notification"></div>
    
    <!-- External Libraries (local) -->
    <script nonce="<?= $nonce ?>" src="/vendor/leaflet/leaflet.js"></script>
    <script nonce="<?= $nonce ?>" src="/vendor/leaflet-heat/leaflet-heat.js"></script>
    <script nonce="<?= $nonce ?>" src="/vendor/leaflet-polylinedecorator/leaflet.polylineDecorator.js"></script>
    <script nonce="<?= $nonce ?>" src="/vendor/exifr/exifr.umd.js"></script>
    <script nonce="<?= $nonce ?>" src="/vendor/dom-to-image/dom-to-image.min.js"></script>
    <script nonce="<?= $nonce ?>" src="/vendor/chartjs/chart.umd.min.js"></script>
    <script nonce="<?= $nonce ?>" src="/vendor/dompurify/purify.min.js"></script>
    
    <!-- Application JavaScript (served through PHP with obfuscation) -->
    <script nonce="<?= $nonce ?>" src="<?= $assetUrl('lang.js') ?>"></script>
    <script nonce="<?= $nonce ?>" src="<?= $assetUrl('TrackParser.js') ?>"></script>
    <script nonce="<?= $nonce ?>" src="<?= $assetUrl('app.js') ?>"></script>
</body>
</html>
