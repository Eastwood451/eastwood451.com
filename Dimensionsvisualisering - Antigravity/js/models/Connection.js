/**
 * Connection Model
 * Represents a line connection between two markers
 */

// Utility function to generate unique IDs
let connectionCounter = 0;
function generateConnectionId() {
    return `conn-${String(connectionCounter++).padStart(3, '0')}`;
}

export class Connection {
    constructor(marker1Id, marker2Id, options = {}) {
        this.id = options.id || generateConnectionId();
        this.marker1Id = marker1Id;
        this.marker2Id = marker2Id;
        this.style = options.style || 'solid'; // 'solid' or 'dashed'
        this.color = options.color || '#000000';
        this.width = options.width || 2;
    }

    /**
     * Check if this connection involves a specific marker
     * @param {string} markerId - Marker ID to check
     * @returns {boolean} True if connection involves this marker
     */
    hasMarker(markerId) {
        return this.marker1Id === markerId || this.marker2Id === markerId;
    }

    /**
     * Get the other marker ID in this connection
     * @param {string} markerId - One marker ID
     * @returns {string|null} The other marker ID, or null if markerId not in connection
     */
    getOtherMarker(markerId) {
        if (this.marker1Id === markerId) return this.marker2Id;
        if (this.marker2Id === markerId) return this.marker1Id;
        return null;
    }

    /**
     * Check if this connection is the same as another (regardless of direction)
     * @param {Connection} other - Other connection to compare
     * @returns {boolean} True if same connection
     */
    isSameAs(other) {
        return (
            (this.marker1Id === other.marker1Id && this.marker2Id === other.marker2Id) ||
            (this.marker1Id === other.marker2Id && this.marker2Id === other.marker1Id)
        );
    }

    /**
     * Serialize connection to JSON
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            id: this.id,
            marker1Id: this.marker1Id,
            marker2Id: this.marker2Id,
            style: this.style,
            color: this.color,
            width: this.width
        };
    }

    /**
     * Create connection from JSON
     * @param {Object} json - JSON representation
     * @returns {Connection} New connection instance
     */
    static fromJSON(json) {
        return new Connection(json.marker1Id, json.marker2Id, json);
    }

    /**
     * Clone this connection
     * @returns {Connection} New connection instance with same properties
     */
    clone() {
        return new Connection(this.marker1Id, this.marker2Id, this.toJSON());
    }
}
