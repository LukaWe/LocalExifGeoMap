/**
 * TrackParser.js
 * Handles secure parsing of GPX, KML, and GeoJSON files in the browser.
 * 
 * @package gps-track-viewer
 */

window.TrackParser = class TrackParser {
    constructor() {
        this.domParser = new DOMParser();
    }

    /**
     * Parse a track file (GPX, KML, or GeoJSON)
     * @param {File} file 
     * @returns {Promise<Array>} Array of point objects {lat, lng, altitude, timestamp}
     */
    async parse(file) {
        const text = await file.text();
        const extension = file.name.split('.').pop().toLowerCase();

        switch (extension) {
            case 'gpx':
                return this.parseGPX(text);
            case 'kml':
                return this.parseKML(text);
            case 'json':
            case 'geojson':
                return this.parseGeoJSON(text);
            default:
                throw new Error('Unsupported file format: ' + extension);
        }
    }

    /**
     * Parse GPX XML content
     * @param {string} xmlContent 
     */
    parseGPX(xmlContent) {
        const xmlDoc = this.domParser.parseFromString(xmlContent, "text/xml");
        const points = [];

        // Check for parse errors
        const parserError = xmlDoc.querySelector("parsererror");
        if (parserError) {
            throw new Error("Invalid GPX XML");
        }

        // Handle both <trkpt> (tracks) and <rtept> (routes)
        const trkpts = xmlDoc.querySelectorAll("trkpt, rtept");

        trkpts.forEach(pt => {
            const lat = parseFloat(pt.getAttribute("lat"));
            const lon = parseFloat(pt.getAttribute("lon"));

            if (this.isValidCoordinate(lat, lon)) {
                const ele = pt.querySelector("ele");
                const time = pt.querySelector("time");

                points.push({
                    lat: lat,
                    lng: lon,
                    altitude: ele ? parseFloat(ele.textContent) : null,
                    timestamp: time ? new Date(time.textContent).toISOString() : null
                });
            }
        });

        return points;
    }

    /**
     * Parse KML XML content
     * @param {string} xmlContent 
     */
    parseKML(xmlContent) {
        const xmlDoc = this.domParser.parseFromString(xmlContent, "text/xml");
        const points = [];

        const parserError = xmlDoc.querySelector("parsererror");
        if (parserError) {
            throw new Error("Invalid KML XML");
        }

        // Process <Coordinates> inside <LineString>
        const coordinates = xmlDoc.querySelectorAll("LineString > coordinates");

        coordinates.forEach(coordNode => {
            const rawCoords = coordNode.textContent.trim().split(/\s+/);

            rawCoords.forEach(rawCoord => {
                const parts = rawCoord.split(',');
                if (parts.length >= 2) {
                    const lon = parseFloat(parts[0]);
                    const lat = parseFloat(parts[1]);
                    const ele = parts.length > 2 ? parseFloat(parts[2]) : null;

                    if (this.isValidCoordinate(lat, lon)) {
                        points.push({
                            lat: lat,
                            lng: lon,
                            altitude: ele,
                            timestamp: null // KML usually doesn't have per-point timestamps in simple LineStrings
                        });
                    }
                }
            });
        });

        // Also check for <gx:Track> extensions (often contain time)
        const gxTracks = xmlDoc.querySelectorAll("Track"); // Google Earth extension namespace often handled as just Track by DOMParser if namespace aware, but verify selector
        // Note: DOMParser basic XML handling might need namespace handling for gx:Track. 
        // For basic KML logic, LineString is primary. We can add gx:Track later if needed.

        return points;
    }

    /**
     * Parse GeoJSON content
     * @param {string} jsonContent 
     */
    parseGeoJSON(jsonContent) {
        try {
            const data = JSON.parse(jsonContent);
            const points = [];

            const exactFeatures = (features) => {
                features.forEach(feature => {
                    if (feature.geometry && (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString')) {
                        const coords = feature.geometry.type === 'LineString'
                            ? feature.geometry.coordinates
                            : feature.geometry.coordinates.flat();

                        coords.forEach(coord => {
                            // GeoJSON is [lon, lat, ele]
                            const lon = coord[0];
                            const lat = coord[1];
                            const ele = coord[2] || null;

                            if (this.isValidCoordinate(lat, lon)) {
                                points.push({
                                    lat: lat,
                                    lng: lon,
                                    altitude: ele,
                                    timestamp: feature.properties?.time || null // Sometimes in properties
                                });
                            }
                        });
                    }
                });
            };

            if (data.type === 'FeatureCollection') {
                exactFeatures(data.features);
            } else if (data.type === 'Feature') {
                exactFeatures([data]);
            }

            return points;
        } catch (e) {
            throw new Error("Invalid JSON");
        }
    }

    isValidCoordinate(lat, lon) {
        return !isNaN(lat) && !isNaN(lon) &&
            lat >= -90 && lat <= 90 &&
            lon >= -180 && lon <= 180;
    }
}
