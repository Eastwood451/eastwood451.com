/**
 * Marker Model
 * Represents a marker point on a dimension
 */

// Utility function to generate unique IDs
let markerCounter = 0;
function generateMarkerId() {
    return `mark-${String(markerCounter++).padStart(3, '0')}`;
}

export class Marker {
    constructor(dimensionId, options = {}) {
        this.id = options.id || generateMarkerId();
        this.dimensionId = dimensionId;
        this.name = options.name || `Marker ${this.id}`;
        this.value = options.value !== undefined ? options.value : 50; // position on dimension scale
        this.color = options.color || '#FF0000';
        this.radius = options.radius || 8; // visual size in pixels
    }

    /**
     * Get absolute x,y position based on dimension
     * @param {Dimension} dimension - The dimension this marker belongs to
     * @returns {Object} { x, y } absolute position
     */
    getAbsolutePosition(dimension) {
        if (!dimension || dimension.id !== this.dimensionId) {
            console.error(`Marker ${this.id} dimension mismatch`);
            return { x: 0, y: 0 };
        }
        return dimension.valueToPosition(this.value);
    }

    /**
     * Update marker position from absolute coordinates
     * @param {Dimension} dimension - The dimension this marker belongs to
     * @param {Object} point - { x, y } absolute position
     */
    setPositionFromPoint(dimension, point) {
        if (!dimension || dimension.id !== this.dimensionId) {
            console.error(`Marker ${this.id} dimension mismatch`);
            return;
        }

        // Get closest point on dimension line
        const closestPoint = dimension.getClosestPointOnLine(point);
        this.value = closestPoint.value;
    }

    /**
     * Serialize marker to JSON
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            id: this.id,
            dimensionId: this.dimensionId,
            name: this.name,
            value: this.value,
            color: this.color,
            radius: this.radius
        };
    }

    /**
     * Create marker from JSON
     * @param {Object} json - JSON representation
     * @returns {Marker} New marker instance
     */
    static fromJSON(json) {
        return new Marker(json.dimensionId, json);
    }

    /**
     * Clone this marker
     * @returns {Marker} New marker instance with same properties
     */
    clone() {
        return new Marker(this.dimensionId, this.toJSON());
    }
}
