/**
 * Intersection Model
 * Represents an intersection (fællespunkt) between two markers on their respective dimensions
 */

// Utility function to generate unique IDs
let intersectionCounter = 0;
function generateIntersectionId() {
    return `intersect-${String(intersectionCounter++).padStart(3, '0')}`;
}

export class Intersection {
    constructor(marker1Id, marker2Id, options = {}) {
        this.id = options.id || generateIntersectionId();
        this.marker1Id = marker1Id;
        this.marker2Id = marker2Id;

        // Visual style properties
        this.pointColor = options.pointColor || '#FF0000'; // Color of the intersection point itself
        this.pointRadius = options.pointRadius !== undefined ? options.pointRadius : 6;

        this.lineColor = options.lineColor || '#FF0000'; // Color of the dashed projection lines
        this.lineWidth = options.lineWidth || 2;
        this.lineStyle = options.lineStyle || 'dashed'; // solid, dashed
    }

    /**
     * Check if this intersection uses a specific marker
     * @param {string} markerId - ID of the marker to check
     * @returns {boolean} True if the marker is used in this intersection
     */
    hasMarker(markerId) {
        return this.marker1Id === markerId || this.marker2Id === markerId;
    }

    /**
     * Serialize intersection to JSON
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            id: this.id,
            marker1Id: this.marker1Id,
            marker2Id: this.marker2Id,
            pointColor: this.pointColor,
            pointRadius: this.pointRadius,
            lineColor: this.lineColor,
            lineWidth: this.lineWidth,
            lineStyle: this.lineStyle
        };
    }

    /**
     * Create intersection from JSON
     * @param {Object} json - JSON representation
     * @returns {Intersection} New intersection instance
     */
    static fromJSON(json) {
        return new Intersection(json.marker1Id, json.marker2Id, json);
    }

    /**
     * Clone this intersection
     * @returns {Intersection} New intersection instance with same properties
     */
    clone() {
        return new Intersection(this.marker1Id, this.marker2Id, this.toJSON());
    }
}
