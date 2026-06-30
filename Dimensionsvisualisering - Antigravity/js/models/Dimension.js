/**
 * Dimension Model
 * Represents a dimension line with min/max values, position, and rotation
 */

// Utility function to generate unique IDs
let dimensionCounter = 0;
function generateDimensionId() {
    return `dim-${String(dimensionCounter++).padStart(3, '0')}`;
}

// Utility function to rotate a point around a center
function rotatePoint(point, center, angleDegrees) {
    const angleRad = (angleDegrees * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    const dx = point.x - center.x;
    const dy = point.y - center.y;

    return {
        x: dx * cos - dy * sin + center.x,
        y: dx * sin + dy * cos + center.y
    };
}

export class Dimension {
    constructor(options = {}) {
        this.id = options.id || generateDimensionId();
        this.label = options.label || `Dimension ${this.id}`;
        this.minValue = options.minValue !== undefined ? options.minValue : 0;
        this.maxValue = options.maxValue !== undefined ? options.maxValue : 100;
        this.length = options.length || 300; // pixels
        this.position = options.position || { x: 400, y: 300 }; // center point
        this.rotation = options.rotation || 0; // degrees (0-360)
        this.magneticEndpoints = options.magneticEndpoints !== undefined ? options.magneticEndpoints : true;
        this.markers = []; // Array of marker IDs
    }

    /**
     * Get the start and end points of the dimension line
     * @returns {Object} { start: {x, y}, end: {x, y} }
     */
    getEndpoints() {
        const halfLength = this.length / 2;

        // Unrotated endpoints (horizontal line centered at position)
        const start = { x: this.position.x - halfLength, y: this.position.y };
        const end = { x: this.position.x + halfLength, y: this.position.y };

        // Apply rotation around center
        const startRotated = rotatePoint(start, this.position, this.rotation);
        const endRotated = rotatePoint(end, this.position, this.rotation);

        return { start: startRotated, end: endRotated };
    }

    /**
     * Convert a value on the dimension scale to absolute x,y coordinates
     * @param {number} value - Value on the dimension scale (between minValue and maxValue)
     * @returns {Object} { x, y } absolute position
     */
    valueToPosition(value) {
        // Clamp value to min/max range
        const clampedValue = Math.max(this.minValue, Math.min(this.maxValue, value));

        // Normalize value to 0-1 range
        const normalized = (clampedValue - this.minValue) / (this.maxValue - this.minValue);

        // Calculate pixel offset from start of line
        const pixelOffset = normalized * this.length;

        // Calculate position along unrotated dimension line
        const halfLength = this.length / 2;
        const unrotatedPoint = {
            x: this.position.x - halfLength + pixelOffset,
            y: this.position.y
        };

        // Apply rotation
        return rotatePoint(unrotatedPoint, this.position, this.rotation);
    }

    /**
     * Convert an absolute x,y position to a value on the dimension scale
     * @param {Object} point - { x, y } absolute position
     * @returns {number} Value on the dimension scale
     */
    positionToValue(point) {
        // Reverse rotation to get unrotated point
        const unrotatedPoint = rotatePoint(point, this.position, -this.rotation);

        // Calculate offset from start of line
        const halfLength = this.length / 2;
        const startX = this.position.x - halfLength;
        const pixelOffset = unrotatedPoint.x - startX;

        // Normalize to 0-1 range
        const normalized = pixelOffset / this.length;

        // Convert to value on dimension scale
        const value = this.minValue + normalized * (this.maxValue - this.minValue);

        // Clamp to min/max range
        return Math.max(this.minValue, Math.min(this.maxValue, value));
    }

    /**
     * Get the closest point on the dimension line to a given point
     * @param {Object} point - { x, y } absolute position
     * @returns {Object} { x, y, value } closest point and its value
     */
    getClosestPointOnLine(point) {
        const endpoints = this.getEndpoints();

        // Vector from start to end
        const dx = endpoints.end.x - endpoints.start.x;
        const dy = endpoints.end.y - endpoints.start.y;
        const lengthSquared = dx * dx + dy * dy;

        // Vector from start to point
        const px = point.x - endpoints.start.x;
        const py = point.y - endpoints.start.y;

        // Project point onto line
        const t = Math.max(0, Math.min(1, (px * dx + py * dy) / lengthSquared));

        const closestPoint = {
            x: endpoints.start.x + t * dx,
            y: endpoints.start.y + t * dy
        };

        const value = this.positionToValue(closestPoint);

        return { ...closestPoint, value };
    }

    /**
     * Get distance from a point to the dimension line
     * @param {Object} point - { x, y } absolute position
     * @returns {number} Distance in pixels
     */
    getDistanceToLine(point) {
        const closestPoint = this.getClosestPointOnLine(point);
        const dx = point.x - closestPoint.x;
        const dy = point.y - closestPoint.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Add a marker ID to this dimension
     * @param {string} markerId - ID of the marker to add
     */
    addMarker(markerId) {
        if (!this.markers.includes(markerId)) {
            this.markers.push(markerId);
        }
    }

    /**
     * Remove a marker ID from this dimension
     * @param {string} markerId - ID of the marker to remove
     */
    removeMarker(markerId) {
        const index = this.markers.indexOf(markerId);
        if (index > -1) {
            this.markers.splice(index, 1);
        }
    }

    /**
     * Serialize dimension to JSON
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            id: this.id,
            label: this.label,
            minValue: this.minValue,
            maxValue: this.maxValue,
            length: this.length,
            position: { ...this.position },
            rotation: this.rotation,
            magneticEndpoints: this.magneticEndpoints,
            markers: [...this.markers]
        };
    }

    /**
     * Create dimension from JSON
     * @param {Object} json - JSON representation
     * @returns {Dimension} New dimension instance
     */
    static fromJSON(json) {
        return new Dimension(json);
    }

    /**
     * Clone this dimension
     * @returns {Dimension} New dimension instance with same properties
     */
    clone() {
        return new Dimension(this.toJSON());
    }
}

// Export utility function for use by other modules
export { rotatePoint };
