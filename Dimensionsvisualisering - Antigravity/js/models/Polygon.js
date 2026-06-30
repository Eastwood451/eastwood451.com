/**
 * Polygon Model
 * Represents a filled polygon formed by connected markers
 */

// Utility function to generate unique IDs
let polygonCounter = 0;
function generatePolygonId() {
    return `poly-${String(polygonCounter++).padStart(3, '0')}`;
}

export class Polygon {
    constructor(markerIds, options = {}) {
        this.id = options.id || generatePolygonId();
        this.markerIds = [...markerIds]; // ordered array of marker IDs
        this.fillColor = options.fillColor || '#CCCCCC';
        this.fillOpacity = options.fillOpacity !== undefined ? options.fillOpacity : 0.3;
    }

    /**
     * Check if this polygon contains a specific marker
     * @param {string} markerId - Marker ID to check
     * @returns {boolean} True if polygon contains this marker
     */
    hasMarker(markerId) {
        return this.markerIds.includes(markerId);
    }

    /**
     * Get number of vertices in polygon
     * @returns {number} Number of vertices
     */
    getVertexCount() {
        return this.markerIds.length;
    }

    /**
     * Check if this polygon is the same as another (same markers, regardless of order/direction)
     * @param {Polygon} other - Other polygon to compare
     * @returns {boolean} True if same polygon
     */
    isSameAs(other) {
        if (this.markerIds.length !== other.markerIds.length) {
            return false;
        }

        // Check if all markers are present in both polygons
        const thisSet = new Set(this.markerIds);
        const otherSet = new Set(other.markerIds);

        if (thisSet.size !== otherSet.size) {
            return false;
        }

        for (const id of thisSet) {
            if (!otherSet.has(id)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Serialize polygon to JSON
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            id: this.id,
            markerIds: [...this.markerIds],
            fillColor: this.fillColor,
            fillOpacity: this.fillOpacity
        };
    }

    /**
     * Create polygon from JSON
     * @param {Object} json - JSON representation
     * @returns {Polygon} New polygon instance
     */
    static fromJSON(json) {
        return new Polygon(json.markerIds, json);
    }

    /**
     * Clone this polygon
     * @returns {Polygon} New polygon instance with same properties
     */
    clone() {
        return new Polygon(this.markerIds, this.toJSON());
    }
}
