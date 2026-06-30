(() => {
  // js/models/Dimension.js
  var dimensionCounter = 0;
  function generateDimensionId() {
    return `dim-${String(dimensionCounter++).padStart(3, "0")}`;
  }
  function rotatePoint(point, center, angleDegrees) {
    const angleRad = angleDegrees * Math.PI / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    return {
      x: dx * cos - dy * sin + center.x,
      y: dx * sin + dy * cos + center.y
    };
  }
  var Dimension = class _Dimension {
    constructor(options = {}) {
      this.id = options.id || generateDimensionId();
      this.label = options.label || `Dimension ${this.id}`;
      this.minValue = options.minValue !== void 0 ? options.minValue : 0;
      this.maxValue = options.maxValue !== void 0 ? options.maxValue : 100;
      this.length = options.length || 300;
      this.position = options.position || { x: 400, y: 300 };
      this.rotation = options.rotation || 0;
      this.magneticEndpoints = options.magneticEndpoints !== void 0 ? options.magneticEndpoints : true;
      this.markers = [];
    }
    /**
     * Get the start and end points of the dimension line
     * @returns {Object} { start: {x, y}, end: {x, y} }
     */
    getEndpoints() {
      const halfLength = this.length / 2;
      const start = { x: this.position.x - halfLength, y: this.position.y };
      const end = { x: this.position.x + halfLength, y: this.position.y };
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
      const clampedValue = Math.max(this.minValue, Math.min(this.maxValue, value));
      const normalized = (clampedValue - this.minValue) / (this.maxValue - this.minValue);
      const pixelOffset = normalized * this.length;
      const halfLength = this.length / 2;
      const unrotatedPoint = {
        x: this.position.x - halfLength + pixelOffset,
        y: this.position.y
      };
      return rotatePoint(unrotatedPoint, this.position, this.rotation);
    }
    /**
     * Convert an absolute x,y position to a value on the dimension scale
     * @param {Object} point - { x, y } absolute position
     * @returns {number} Value on the dimension scale
     */
    positionToValue(point) {
      const unrotatedPoint = rotatePoint(point, this.position, -this.rotation);
      const halfLength = this.length / 2;
      const startX = this.position.x - halfLength;
      const pixelOffset = unrotatedPoint.x - startX;
      const normalized = pixelOffset / this.length;
      const value = this.minValue + normalized * (this.maxValue - this.minValue);
      return Math.max(this.minValue, Math.min(this.maxValue, value));
    }
    /**
     * Get the closest point on the dimension line to a given point
     * @param {Object} point - { x, y } absolute position
     * @returns {Object} { x, y, value } closest point and its value
     */
    getClosestPointOnLine(point) {
      const endpoints = this.getEndpoints();
      const dx = endpoints.end.x - endpoints.start.x;
      const dy = endpoints.end.y - endpoints.start.y;
      const lengthSquared = dx * dx + dy * dy;
      const px = point.x - endpoints.start.x;
      const py = point.y - endpoints.start.y;
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
      return new _Dimension(json);
    }
    /**
     * Clone this dimension
     * @returns {Dimension} New dimension instance with same properties
     */
    clone() {
      return new _Dimension(this.toJSON());
    }
  };

  // js/models/Marker.js
  var markerCounter = 0;
  function generateMarkerId() {
    return `mark-${String(markerCounter++).padStart(3, "0")}`;
  }
  var Marker = class _Marker {
    constructor(dimensionId, options = {}) {
      this.id = options.id || generateMarkerId();
      this.dimensionId = dimensionId;
      this.name = options.name || `Marker ${this.id}`;
      this.value = options.value !== void 0 ? options.value : 50;
      this.color = options.color || "#FF0000";
      this.radius = options.radius || 8;
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
      return new _Marker(json.dimensionId, json);
    }
    /**
     * Clone this marker
     * @returns {Marker} New marker instance with same properties
     */
    clone() {
      return new _Marker(this.dimensionId, this.toJSON());
    }
  };

  // js/models/Connection.js
  var connectionCounter = 0;
  function generateConnectionId() {
    return `conn-${String(connectionCounter++).padStart(3, "0")}`;
  }
  var Connection = class _Connection {
    constructor(marker1Id, marker2Id, options = {}) {
      this.id = options.id || generateConnectionId();
      this.marker1Id = marker1Id;
      this.marker2Id = marker2Id;
      this.style = options.style || "solid";
      this.color = options.color || "#000000";
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
      return this.marker1Id === other.marker1Id && this.marker2Id === other.marker2Id || this.marker1Id === other.marker2Id && this.marker2Id === other.marker1Id;
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
      return new _Connection(json.marker1Id, json.marker2Id, json);
    }
    /**
     * Clone this connection
     * @returns {Connection} New connection instance with same properties
     */
    clone() {
      return new _Connection(this.marker1Id, this.marker2Id, this.toJSON());
    }
  };

  // js/models/Intersection.js
  var intersectionCounter = 0;
  function generateIntersectionId() {
    return `intersect-${String(intersectionCounter++).padStart(3, "0")}`;
  }
  var Intersection = class _Intersection {
    constructor(marker1Id, marker2Id, options = {}) {
      this.id = options.id || generateIntersectionId();
      this.marker1Id = marker1Id;
      this.marker2Id = marker2Id;
      this.pointColor = options.pointColor || "#FF0000";
      this.pointRadius = options.pointRadius !== void 0 ? options.pointRadius : 6;
      this.lineColor = options.lineColor || "#FF0000";
      this.lineWidth = options.lineWidth || 2;
      this.lineStyle = options.lineStyle || "dashed";
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
      return new _Intersection(json.marker1Id, json.marker2Id, json);
    }
    /**
     * Clone this intersection
     * @returns {Intersection} New intersection instance with same properties
     */
    clone() {
      return new _Intersection(this.marker1Id, this.marker2Id, this.toJSON());
    }
  };

  // js/models/Polygon.js
  var polygonCounter = 0;
  function generatePolygonId() {
    return `poly-${String(polygonCounter++).padStart(3, "0")}`;
  }
  var Polygon = class _Polygon {
    constructor(markerIds, options = {}) {
      this.id = options.id || generatePolygonId();
      this.markerIds = [...markerIds];
      this.fillColor = options.fillColor || "#CCCCCC";
      this.fillOpacity = options.fillOpacity !== void 0 ? options.fillOpacity : 0.3;
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
      return new _Polygon(json.markerIds, json);
    }
    /**
     * Clone this polygon
     * @returns {Polygon} New polygon instance with same properties
     */
    clone() {
      return new _Polygon(this.markerIds, this.toJSON());
    }
  };

  // js/managers/CanvasManager.js
  var CanvasManager = class {
    constructor(svgElement) {
      this.svg = svgElement;
      this.dimensionsLayer = svgElement.querySelector("#dimensions-layer");
      this.markersLayer = svgElement.querySelector("#markers-layer");
      this.connectionsLayer = svgElement.querySelector("#connections-layer");
      this.intersectionsLayer = svgElement.querySelector("#intersections-layer");
      this.polygonsLayer = svgElement.querySelector("#polygons-layer");
      this.handlesLayer = svgElement.querySelector("#handles-layer");
      this.dimensionElements = /* @__PURE__ */ new Map();
      this.markerElements = /* @__PURE__ */ new Map();
      this.connectionElements = /* @__PURE__ */ new Map();
      this.intersectionElements = /* @__PURE__ */ new Map();
      this.polygonElements = /* @__PURE__ */ new Map();
      this.handleElements = /* @__PURE__ */ new Map();
      this.selectedElement = null;
      this.selectedType = null;
      this.viewport = null;
      this.zoomLevel = 1;
      this.minZoom = 0.25;
      this.maxZoom = 4;
      this.initializeViewport();
    }
    initializeViewport() {
      const rect = this.svg.getBoundingClientRect();
      const width = rect.width || this.svg.clientWidth || 1e3;
      const height = rect.height || this.svg.clientHeight || 700;
      this.viewport = {
        x: 0,
        y: 0,
        width,
        height
      };
      this.updateViewBox();
    }
    updateViewBox() {
      if (!this.viewport) return;
      this.svg.setAttribute("viewBox", `${this.viewport.x} ${this.viewport.y} ${this.viewport.width} ${this.viewport.height}`);
    }
    clientToWorld(clientX, clientY) {
      const rect = this.svg.getBoundingClientRect();
      if (!rect.width || !rect.height || !this.viewport) {
        return { x: clientX, y: clientY };
      }
      return {
        x: this.viewport.x + (clientX - rect.left) / rect.width * this.viewport.width,
        y: this.viewport.y + (clientY - rect.top) / rect.height * this.viewport.height
      };
    }
    zoomAtPoint(clientX, clientY, zoomDelta) {
      if (!this.viewport) return false;
      const nextZoom = Math.min(this.maxZoom, Math.max(this.minZoom, this.zoomLevel * zoomDelta));
      if (Math.abs(nextZoom - this.zoomLevel) < 1e-4) return false;
      const rect = this.svg.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;
      const focus = this.clientToWorld(clientX, clientY);
      const ratioX = (clientX - rect.left) / rect.width;
      const ratioY = (clientY - rect.top) / rect.height;
      this.zoomLevel = nextZoom;
      this.viewport.width = rect.width / this.zoomLevel;
      this.viewport.height = rect.height / this.zoomLevel;
      this.viewport.x = focus.x - ratioX * this.viewport.width;
      this.viewport.y = focus.y - ratioY * this.viewport.height;
      this.updateViewBox();
      return true;
    }
    panByClientDelta(deltaX, deltaY) {
      if (!this.viewport) return;
      const rect = this.svg.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      this.viewport.x -= deltaX * (this.viewport.width / rect.width);
      this.viewport.y -= deltaY * (this.viewport.height / rect.height);
      this.updateViewBox();
    }
    handleResize() {
      if (!this.viewport) {
        this.initializeViewport();
        return;
      }
      const rect = this.svg.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const centerX = this.viewport.x + this.viewport.width / 2;
      const centerY = this.viewport.y + this.viewport.height / 2;
      this.viewport.width = rect.width / this.zoomLevel;
      this.viewport.height = rect.height / this.zoomLevel;
      this.viewport.x = centerX - this.viewport.width / 2;
      this.viewport.y = centerY - this.viewport.height / 2;
      this.updateViewBox();
    }
    /**
     * Render a dimension
     * @param {Dimension} dimension - Dimension to render
     */
    renderDimension(dimension) {
      let group = this.dimensionElements.get(dimension.id);
      if (!group) {
        group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.setAttribute("data-dimension-id", dimension.id);
        group.classList.add("dimension-group");
        this.dimensionsLayer.appendChild(group);
        this.dimensionElements.set(dimension.id, group);
      } else {
        group.innerHTML = "";
      }
      const endpoints = dimension.getEndpoints();
      const hitArea = document.createElementNS("http://www.w3.org/2000/svg", "line");
      hitArea.setAttribute("x1", endpoints.start.x);
      hitArea.setAttribute("y1", endpoints.start.y);
      hitArea.setAttribute("x2", endpoints.end.x);
      hitArea.setAttribute("y2", endpoints.end.y);
      hitArea.setAttribute("stroke", "transparent");
      hitArea.setAttribute("stroke-width", "20");
      hitArea.classList.add("dimension-line");
      hitArea.setAttribute("data-dimension-id", dimension.id);
      hitArea.style.cursor = "move";
      group.appendChild(hitArea);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", endpoints.start.x);
      line.setAttribute("y1", endpoints.start.y);
      line.setAttribute("x2", endpoints.end.x);
      line.setAttribute("y2", endpoints.end.y);
      line.classList.add("dimension-line-visible");
      line.setAttribute("stroke", "#333");
      line.setAttribute("stroke-width", "2");
      line.setAttribute("fill", "none");
      line.style.pointerEvents = "none";
      group.appendChild(line);
      const startCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      startCircle.setAttribute("cx", endpoints.start.x);
      startCircle.setAttribute("cy", endpoints.start.y);
      startCircle.setAttribute("r", "5");
      startCircle.classList.add("dimension-endpoint");
      startCircle.setAttribute("data-dimension-id", dimension.id);
      startCircle.setAttribute("data-endpoint", "start");
      group.appendChild(startCircle);
      const endCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      endCircle.setAttribute("cx", endpoints.end.x);
      endCircle.setAttribute("cy", endpoints.end.y);
      endCircle.setAttribute("r", "5");
      endCircle.classList.add("dimension-endpoint");
      endCircle.setAttribute("data-dimension-id", dimension.id);
      endCircle.setAttribute("data-endpoint", "end");
      group.appendChild(endCircle);
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", dimension.position.x);
      label.setAttribute("y", dimension.position.y - 15);
      label.setAttribute("text-anchor", "middle");
      label.classList.add("dimension-label");
      label.textContent = dimension.label;
      group.appendChild(label);
      const minText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      minText.setAttribute("x", endpoints.start.x);
      minText.setAttribute("y", endpoints.start.y + 20);
      minText.setAttribute("text-anchor", "middle");
      minText.classList.add("dimension-scale-text");
      minText.textContent = dimension.minValue;
      group.appendChild(minText);
      const maxText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      maxText.setAttribute("x", endpoints.end.x);
      maxText.setAttribute("y", endpoints.end.y + 20);
      maxText.setAttribute("text-anchor", "middle");
      maxText.classList.add("dimension-scale-text");
      maxText.textContent = dimension.maxValue;
      group.appendChild(maxText);
    }
    /**
     * Render a marker
     * @param {Marker} marker - Marker to render
     * @param {Dimension} dimension - Dimension the marker belongs to
     */
    renderMarker(marker, dimension) {
      const position = marker.getAbsolutePosition(dimension);
      let group = this.markerElements.get(marker.id);
      if (!group) {
        group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.setAttribute("data-marker-id", marker.id);
        group.classList.add("marker-group");
        this.markersLayer.appendChild(group);
        this.markerElements.set(marker.id, group);
      } else {
        group.innerHTML = "";
      }
      const hitArea = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      hitArea.setAttribute("cx", position.x);
      hitArea.setAttribute("cy", position.y);
      hitArea.setAttribute("r", Math.max(marker.radius + 8, 16));
      hitArea.setAttribute("fill", "transparent");
      hitArea.classList.add("marker");
      hitArea.setAttribute("data-marker-id", marker.id);
      hitArea.style.cursor = "move";
      group.appendChild(hitArea);
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", position.x);
      circle.setAttribute("cy", position.y);
      circle.setAttribute("r", marker.radius);
      circle.setAttribute("fill", marker.color);
      circle.setAttribute("stroke", "white");
      circle.setAttribute("stroke-width", "2");
      circle.classList.add("marker-visible");
      circle.style.pointerEvents = "none";
      group.appendChild(circle);
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", position.x);
      label.setAttribute("y", position.y - marker.radius - 5);
      label.setAttribute("text-anchor", "middle");
      label.classList.add("marker-label");
      label.textContent = marker.name;
      group.appendChild(label);
    }
    /**
     * Render a connection
     * @param {Connection} connection - Connection to render
     * @param {Marker} marker1 - First marker
     * @param {Marker} marker2 - Second marker
     * @param {Dimension} dim1 - Dimension of first marker
     * @param {Dimension} dim2 - Dimension of second marker
     */
    renderConnection(connection, marker1, marker2, dim1, dim2) {
      const pos1 = marker1.getAbsolutePosition(dim1);
      const pos2 = marker2.getAbsolutePosition(dim2);
      let line = this.connectionElements.get(connection.id);
      if (!line) {
        line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("data-connection-id", connection.id);
        line.classList.add("connection");
        this.connectionsLayer.appendChild(line);
        this.connectionElements.set(connection.id, line);
      }
      line.setAttribute("x1", pos1.x);
      line.setAttribute("y1", pos1.y);
      line.setAttribute("x2", pos2.x);
      line.setAttribute("y2", pos2.y);
      line.setAttribute("stroke", connection.color);
      line.setAttribute("stroke-width", connection.width);
      line.classList.remove("solid", "dashed");
      line.classList.add(connection.style);
    }
    /**
     * Render an intersection
     * @param {Intersection} intersection - Intersection to render
     * @param {Marker} marker1 - First marker
     * @param {Marker} marker2 - Second marker
     * @param {Dimension} dim1 - Dimension of first marker
     * @param {Dimension} dim2 - Dimension of second marker
     */
    renderIntersection(intersection, marker1, marker2, dim1, dim2) {
      const mathPoint = this.calculateOrthogonalIntersection(marker1, marker2, dim1, dim2);
      if (!mathPoint) {
        this.removeIntersection(intersection.id);
        return;
      }
      const pos1 = marker1.getAbsolutePosition(dim1);
      const pos2 = marker2.getAbsolutePosition(dim2);
      let group = this.intersectionElements.get(intersection.id);
      if (!group) {
        group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.setAttribute("data-intersection-id", intersection.id);
        group.classList.add("intersection-group");
        this.intersectionsLayer.appendChild(group);
        this.intersectionElements.set(intersection.id, group);
      } else {
        group.innerHTML = "";
      }
      const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line1.setAttribute("x1", pos1.x);
      line1.setAttribute("y1", pos1.y);
      line1.setAttribute("x2", mathPoint.x);
      line1.setAttribute("y2", mathPoint.y);
      line1.setAttribute("stroke", intersection.lineColor);
      line1.setAttribute("stroke-width", intersection.lineWidth);
      if (intersection.lineStyle === "dashed") {
        line1.setAttribute("stroke-dasharray", "5,5");
      }
      line1.style.pointerEvents = "none";
      group.appendChild(line1);
      const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line2.setAttribute("x1", pos2.x);
      line2.setAttribute("y1", pos2.y);
      line2.setAttribute("x2", mathPoint.x);
      line2.setAttribute("y2", mathPoint.y);
      line2.setAttribute("stroke", intersection.lineColor);
      line2.setAttribute("stroke-width", intersection.lineWidth);
      if (intersection.lineStyle === "dashed") {
        line2.setAttribute("stroke-dasharray", "5,5");
      }
      line2.style.pointerEvents = "none";
      group.appendChild(line2);
      const hitArea = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      hitArea.setAttribute("cx", mathPoint.x);
      hitArea.setAttribute("cy", mathPoint.y);
      hitArea.setAttribute("r", Math.max(intersection.pointRadius + 10, 16));
      hitArea.setAttribute("fill", "transparent");
      hitArea.classList.add("intersection");
      hitArea.setAttribute("data-intersection-id", intersection.id);
      hitArea.style.cursor = "pointer";
      group.appendChild(hitArea);
      const point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      point.setAttribute("cx", mathPoint.x);
      point.setAttribute("cy", mathPoint.y);
      point.setAttribute("r", intersection.pointRadius);
      point.setAttribute("fill", intersection.pointColor);
      point.classList.add("intersection-visible");
      point.style.pointerEvents = "none";
      group.appendChild(point);
    }
    /**
     * Calculates intersection point of two lines orthogonal to dim1 and dim2 passing through marker1 and marker2 respectively.
     */
    calculateOrthogonalIntersection(marker1, marker2, dim1, dim2) {
      const p1 = marker1.getAbsolutePosition(dim1);
      const p2 = marker2.getAbsolutePosition(dim2);
      const d1_endpts = dim1.getEndpoints();
      const v1x = d1_endpts.end.x - d1_endpts.start.x;
      const v1y = d1_endpts.end.y - d1_endpts.start.y;
      const d2_endpts = dim2.getEndpoints();
      const v2x = d2_endpts.end.x - d2_endpts.start.x;
      const v2y = d2_endpts.end.y - d2_endpts.start.y;
      const orth1x = -v1y;
      const orth1y = v1x;
      const orth2x = -v2y;
      const orth2y = v2x;
      const det = orth1x * -orth2y - orth1y * -orth2x;
      if (Math.abs(det) < 1e-6) {
        return null;
      }
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const t1 = (dx * -orth2y - dy * -orth2x) / det;
      return {
        x: p1.x + t1 * orth1x,
        y: p1.y + t1 * orth1y
      };
    }
    /**
     * Render a polygon
     * @param {Polygon} polygon - Polygon to render
     * @param {Array} markers - Array of Marker objects in order
     * @param {Array} dimensions - Array of corresponding Dimension objects
     */
    renderPolygon(polygon, markers, dimensions) {
      const points = markers.map((marker, index) => {
        const pos = marker.getAbsolutePosition(dimensions[index]);
        return `${pos.x},${pos.y}`;
      }).join(" ");
      let polygonEl = this.polygonElements.get(polygon.id);
      if (!polygonEl) {
        polygonEl = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        polygonEl.setAttribute("data-polygon-id", polygon.id);
        polygonEl.classList.add("polygon-fill");
        this.polygonsLayer.appendChild(polygonEl);
        this.polygonElements.set(polygon.id, polygonEl);
      }
      polygonEl.setAttribute("points", points);
      polygonEl.setAttribute("fill", polygon.fillColor);
      polygonEl.setAttribute("fill-opacity", polygon.fillOpacity);
    }
    /**
     * Remove a dimension from the canvas
     * @param {string} dimensionId - ID of dimension to remove
     */
    removeDimension(dimensionId) {
      const group = this.dimensionElements.get(dimensionId);
      if (group) {
        group.remove();
        this.dimensionElements.delete(dimensionId);
      }
      const handles = this.handleElements.get(dimensionId);
      if (handles) {
        handles.remove();
        this.handleElements.delete(dimensionId);
      }
    }
    /**
     * Remove a marker from the canvas
     * @param {string} markerId - ID of marker to remove
     */
    removeMarker(markerId) {
      const group = this.markerElements.get(markerId);
      if (group) {
        group.remove();
        this.markerElements.delete(markerId);
      }
    }
    /**
     * Remove a connection from the canvas
     * @param {string} connectionId - ID of connection to remove
     */
    removeConnection(connectionId) {
      const line = this.connectionElements.get(connectionId);
      if (line) {
        line.remove();
        this.connectionElements.delete(connectionId);
      }
    }
    /**
     * Remove an intersection from the canvas
     * @param {string} intersectionId - ID of intersection to remove
     */
    removeIntersection(intersectionId) {
      const group = this.intersectionElements.get(intersectionId);
      if (group) {
        group.remove();
        this.intersectionElements.delete(intersectionId);
      }
    }
    /**
     * Remove a polygon from the canvas
     * @param {string} polygonId - ID of polygon to remove
     */
    removePolygon(polygonId) {
      const polygonEl = this.polygonElements.get(polygonId);
      if (polygonEl) {
        polygonEl.remove();
        this.polygonElements.delete(polygonId);
      }
    }
    /**
     * Clear all selections
     */
    clearSelection() {
      this.svg.querySelectorAll(".selected").forEach((el) => {
        el.classList.remove("selected");
      });
      this.selectedElement = null;
      this.selectedType = null;
      this.hideAllHandles();
    }
    /**
     * Select an element
     * @param {string} id - Element ID
     * @param {string} type - Element type ('dimension', 'marker', 'connection', 'polygon')
     */
    selectElement(id, type) {
      this.clearSelection();
      this.selectedElement = id;
      this.selectedType = type;
      let element;
      switch (type) {
        case "dimension":
          element = this.dimensionElements.get(id);
          if (element) {
            element.classList.add("selected");
          }
          break;
        case "marker":
          element = this.markerElements.get(id);
          if (element) {
            element.querySelector(".marker").classList.add("selected");
          }
          break;
        case "connection":
          element = this.connectionElements.get(id);
          if (element) {
            element.classList.add("selected");
          }
          break;
        case "intersection":
          element = this.intersectionElements.get(id);
          if (element) {
            const circle = element.querySelector(".intersection-visible");
            if (circle) circle.classList.add("selected");
          }
          break;
        case "polygon":
          element = this.polygonElements.get(id);
          if (element) {
            element.classList.add("selected");
          }
          break;
      }
    }
    /**
     * Hide all rotation handles
     */
    hideAllHandles() {
      this.handlesLayer.innerHTML = "";
      this.handleElements.clear();
    }
    /**
     * Show rotation handles for a dimension
     * @param {Dimension} dimension - Dimension to show handles for
     */
    showRotationHandles(dimension) {
      this.hideAllHandles();
      const endpoints = dimension.getEndpoints();
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("data-dimension-id", dimension.id);
      const handle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      handle.setAttribute("cx", endpoints.end.x);
      handle.setAttribute("cy", endpoints.end.y);
      handle.setAttribute("r", "10");
      handle.classList.add("rotation-handle");
      handle.setAttribute("data-dimension-id", dimension.id);
      group.appendChild(handle);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", dimension.position.x);
      line.setAttribute("y1", dimension.position.y);
      line.setAttribute("x2", endpoints.end.x);
      line.setAttribute("y2", endpoints.end.y);
      line.classList.add("rotation-line");
      group.appendChild(line);
      this.handlesLayer.appendChild(group);
      this.handleElements.set(dimension.id, group);
    }
    /**
     * Update rotation handles for a dimension (during rotation)
     * @param {Dimension} dimension - Dimension being rotated
     */
    updateRotationHandles(dimension) {
      const group = this.handleElements.get(dimension.id);
      if (!group) return;
      const endpoints = dimension.getEndpoints();
      const handle = group.querySelector(".rotation-handle");
      if (handle) {
        handle.setAttribute("cx", endpoints.end.x);
        handle.setAttribute("cy", endpoints.end.y);
      }
      const line = group.querySelector(".rotation-line");
      if (line) {
        line.setAttribute("x1", dimension.position.x);
        line.setAttribute("y1", dimension.position.y);
        line.setAttribute("x2", endpoints.end.x);
        line.setAttribute("y2", endpoints.end.y);
      }
    }
    /**
     * Show snap indicator at a position
     * @param {Object} position - { x, y } position to show indicator
     */
    showSnapIndicator(position) {
      const indicator = this.svg.querySelector("#snap-indicator");
      if (indicator) {
        indicator.setAttribute("cx", position.x);
        indicator.setAttribute("cy", position.y);
        indicator.style.display = "block";
      }
    }
    /**
     * Hide snap indicator
     */
    hideSnapIndicator() {
      const indicator = this.svg.querySelector("#snap-indicator");
      if (indicator) {
        indicator.style.display = "none";
      }
    }
    /**
     * Clear entire canvas
     */
    clear() {
      this.dimensionsLayer.innerHTML = "";
      this.markersLayer.innerHTML = "";
      this.connectionsLayer.innerHTML = "";
      this.intersectionsLayer.innerHTML = "";
      this.polygonsLayer.innerHTML = "";
      this.handlesLayer.innerHTML = "";
      this.dimensionElements.clear();
      this.markerElements.clear();
      this.connectionElements.clear();
      this.intersectionElements.clear();
      this.polygonElements.clear();
      this.handleElements.clear();
      this.selectedElement = null;
      this.selectedType = null;
    }
  };

  // js/managers/InteractionManager.js
  var InteractionManager = class {
    constructor(svgElement, canvasManager2, appState) {
      this.svg = svgElement;
      this.canvasManager = canvasManager2;
      this.appState = appState;
      this.isDragging = false;
      this.dragType = null;
      this.dragTarget = null;
      this.dragStart = { x: 0, y: 0 };
      this.dragOffset = { x: 0, y: 0 };
      this.isPanning = false;
      this.panStartClient = { x: 0, y: 0 };
      this.didPan = false;
      this.panThreshold = 3;
      this.rotationPivot = null;
      this.rotationEndpointType = null;
      this.onDimensionMoved = null;
      this.onMarkerMoved = null;
      this.onDimensionRotated = null;
      this.snapManager = null;
      this.setupEventListeners();
    }
    /**
     * Setup event listeners for interactions
     */
    setupEventListeners() {
      this.svg.addEventListener("mousedown", this.handleMouseDown.bind(this));
      this.svg.addEventListener("mousemove", this.handleMouseMove.bind(this));
      this.svg.addEventListener("mouseup", this.handleMouseUp.bind(this));
      this.svg.addEventListener("mouseleave", this.handleMouseUp.bind(this));
      this.svg.addEventListener("touchstart", this.handleTouchStart.bind(this), { passive: false });
      this.svg.addEventListener("touchmove", this.handleTouchMove.bind(this), { passive: false });
      this.svg.addEventListener("touchend", this.handleTouchEnd.bind(this));
    }
    /**
     * Handle mouse down event
     */
    handleMouseDown(e) {
      if (e.button !== 0) return;
      const target = e.target;
      const point = this.getSVGPoint(e.clientX, e.clientY);
      const rotationHandle = target.closest(".rotation-handle");
      const dimensionEndpoint = target.closest(".dimension-endpoint");
      const dimensionLine = target.closest(".dimension-line");
      const marker = target.closest(".marker");
      const clickedInteractiveElement = rotationHandle || dimensionEndpoint || dimensionLine || marker;
      if (!clickedInteractiveElement) {
        if (this.appState.mode === "select") {
          this.startPan(e.clientX, e.clientY);
          e.preventDefault();
        }
        return;
      }
      if (this.appState.mode !== "select") return;
      if (rotationHandle) {
        const dimensionId = rotationHandle.getAttribute("data-dimension-id");
        this.startRotation(dimensionId, point);
        e.preventDefault();
      } else if (dimensionEndpoint) {
        const dimensionId = dimensionEndpoint.getAttribute("data-dimension-id");
        const endpointType = dimensionEndpoint.getAttribute("data-endpoint");
        this.startRotationFromEndpoint(dimensionId, endpointType, point);
        e.preventDefault();
      } else if (marker) {
        const markerId = marker.getAttribute("data-marker-id");
        this.startDragMarker(markerId, point);
        e.preventDefault();
      } else if (dimensionLine) {
        const dimensionId = dimensionLine.getAttribute("data-dimension-id");
        this.startDragDimension(dimensionId, point);
        e.preventDefault();
      }
    }
    /**
     * Handle mouse move event
     */
    handleMouseMove(e) {
      if (this.isPanning) {
        this.updatePan(e.clientX, e.clientY);
        e.preventDefault();
        return;
      }
      if (!this.isDragging) return;
      const point = this.getSVGPoint(e.clientX, e.clientY);
      if (this.dragType === "dimension") {
        this.updateDragDimension(point);
      } else if (this.dragType === "marker") {
        this.updateDragMarker(point);
      } else if (this.dragType === "rotate") {
        this.updateRotation(point);
      }
      e.preventDefault();
    }
    /**
     * Handle mouse up event
     */
    handleMouseUp(e) {
      if (this.isPanning) {
        this.endPan();
        e.preventDefault();
        return;
      }
      if (!this.isDragging) return;
      const point = this.getSVGPoint(e.clientX, e.clientY);
      if (this.dragType === "dimension") {
        this.endDragDimension(point);
      } else if (this.dragType === "marker") {
        this.endDragMarker(point);
      } else if (this.dragType === "rotate") {
        this.endRotation(point);
      }
      this.isDragging = false;
      this.dragType = null;
      this.dragTarget = null;
      e.preventDefault();
    }
    /**
     * Handle touch start
     */
    handleTouchStart(e) {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY,
        button: 0
      });
      this.handleMouseDown(mouseEvent);
      e.preventDefault();
    }
    /**
     * Handle touch move
     */
    handleTouchMove(e) {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.handleMouseMove(mouseEvent);
      e.preventDefault();
    }
    /**
     * Handle touch end
     */
    handleTouchEnd(e) {
      const mouseEvent = new MouseEvent("mouseup", {
        clientX: 0,
        clientY: 0
      });
      this.handleMouseUp(mouseEvent);
      e.preventDefault();
    }
    /**
     * Get SVG coordinate from client coordinate
     */
    getSVGPoint(clientX, clientY) {
      return this.canvasManager.clientToWorld(clientX, clientY);
    }
    startPan(clientX, clientY) {
      this.isPanning = true;
      this.didPan = false;
      this.panStartClient = { x: clientX, y: clientY };
      this.svg.style.cursor = "grabbing";
    }
    updatePan(clientX, clientY) {
      const deltaX = clientX - this.panStartClient.x;
      const deltaY = clientY - this.panStartClient.y;
      if (Math.abs(deltaX) > this.panThreshold || Math.abs(deltaY) > this.panThreshold) {
        this.didPan = true;
      }
      this.canvasManager.panByClientDelta(deltaX, deltaY);
      this.panStartClient = { x: clientX, y: clientY };
    }
    endPan() {
      this.isPanning = false;
      this.svg.style.cursor = this.appState.mode === "select" ? "grab" : "default";
    }
    consumeDidPan() {
      const didPan = this.didPan;
      this.didPan = false;
      return didPan;
    }
    /**
     * Start dragging a dimension
     */
    startDragDimension(dimensionId, point) {
      const dimension = this.appState.dimensions.find((d) => d.id === dimensionId);
      if (!dimension) return;
      this.isDragging = true;
      this.dragType = "dimension";
      this.dragTarget = dimensionId;
      this.dragStart = { ...point };
      this.dragOffset = {
        x: point.x - dimension.position.x,
        y: point.y - dimension.position.y
      };
      this.svg.style.cursor = "grabbing";
    }
    /**
     * Get all dimensions connected to a dimension through snaps
     */
    getConnectedDimensions(dimensionId, visited = /* @__PURE__ */ new Set()) {
      if (visited.has(dimensionId)) return [];
      visited.add(dimensionId);
      const connected = [dimensionId];
      if (!this.snapManager) return connected;
      const snapInfo = this.snapManager.getSnapInfo(dimensionId);
      if (snapInfo.start) {
        const targetDimId = snapInfo.start.targetDimensionId;
        if (!visited.has(targetDimId)) {
          connected.push(...this.getConnectedDimensions(targetDimId, visited));
        }
      }
      if (snapInfo.end) {
        const targetDimId = snapInfo.end.targetDimensionId;
        if (!visited.has(targetDimId)) {
          connected.push(...this.getConnectedDimensions(targetDimId, visited));
        }
      }
      for (const dim of this.appState.dimensions) {
        if (visited.has(dim.id)) continue;
        const otherSnapInfo = this.snapManager.getSnapInfo(dim.id);
        if (otherSnapInfo.start?.targetDimensionId === dimensionId || otherSnapInfo.end?.targetDimensionId === dimensionId) {
          connected.push(...this.getConnectedDimensions(dim.id, visited));
        }
      }
      return connected;
    }
    /**
     * Update dimension drag
     */
    updateDragDimension(point) {
      const dimension = this.appState.dimensions.find((d) => d.id === this.dragTarget);
      if (!dimension) return;
      const newX = point.x - this.dragOffset.x;
      const newY = point.y - this.dragOffset.y;
      const deltaX = newX - dimension.position.x;
      const deltaY = newY - dimension.position.y;
      const connectedDimIds = this.getConnectedDimensions(dimension.id);
      connectedDimIds.forEach((dimId) => {
        const dim = this.appState.dimensions.find((d) => d.id === dimId);
        if (!dim) return;
        dim.position.x += deltaX;
        dim.position.y += deltaY;
        this.canvasManager.renderDimension(dim);
        if (dim.id === dimension.id) {
          this.canvasManager.updateRotationHandles(dim);
        }
        const markers = this.appState.markers.filter((m) => m.dimensionId === dim.id);
        markers.forEach((marker) => {
          this.canvasManager.renderMarker(marker, dim);
          const connections = this.appState.connections.filter((c) => c.hasMarker(marker.id));
          connections.forEach((conn) => {
            const marker1 = this.appState.markers.find((m) => m.id === conn.marker1Id);
            const marker2 = this.appState.markers.find((m) => m.id === conn.marker2Id);
            const dim1 = this.appState.dimensions.find((d) => d.id === marker1?.dimensionId);
            const dim2 = this.appState.dimensions.find((d) => d.id === marker2?.dimensionId);
            if (marker1 && marker2 && dim1 && dim2) {
              this.canvasManager.renderConnection(conn, marker1, marker2, dim1, dim2);
            }
          });
        });
      });
      if (this.snapManager) {
        connectedDimIds.forEach((dimId) => {
          const dim = this.appState.dimensions.find((d) => d.id === dimId);
          if (dim) {
            const snapInfo = this.snapManager.getSnapInfo(dimId);
            if (snapInfo.start) {
              const endpoints = dim.getEndpoints();
              snapInfo.start.point = endpoints.start;
            }
            if (snapInfo.end) {
              const endpoints = dim.getEndpoints();
              snapInfo.end.point = endpoints.end;
            }
          }
        });
        this.snapManager.checkSnap(dimension, this.canvasManager);
      }
    }
    /**
     * End dimension drag
     */
    endDragDimension(point) {
      const dimension = this.appState.dimensions.find((d) => d.id === this.dragTarget);
      if (!dimension) return;
      if (this.snapManager) {
        this.snapManager.applySnap(dimension, this.appState.dimensions, this.canvasManager);
      }
      if (this.onDimensionMoved) {
        this.onDimensionMoved(dimension);
      }
      this.svg.style.cursor = this.appState.mode === "select" ? "grab" : "default";
      this.canvasManager.hideSnapIndicator();
    }
    /**
     * Start dragging a marker
     */
    startDragMarker(markerId, point) {
      const marker = this.appState.markers.find((m) => m.id === markerId);
      if (!marker) return;
      this.isDragging = true;
      this.dragType = "marker";
      this.dragTarget = markerId;
      this.dragStart = { ...point };
      this.svg.style.cursor = "grabbing";
    }
    /**
     * Update marker drag
     */
    updateDragMarker(point) {
      const marker = this.appState.markers.find((m) => m.id === this.dragTarget);
      if (!marker) return;
      const dimension = this.appState.dimensions.find((d) => d.id === marker.dimensionId);
      if (!dimension) return;
      const closestPoint = dimension.getClosestPointOnLine(point);
      marker.value = closestPoint.value;
      this.canvasManager.renderMarker(marker, dimension);
      const connections = this.appState.connections.filter((c) => c.hasMarker(marker.id));
      connections.forEach((conn) => {
        const marker1 = this.appState.markers.find((m) => m.id === conn.marker1Id);
        const marker2 = this.appState.markers.find((m) => m.id === conn.marker2Id);
        const dim1 = this.appState.dimensions.find((d) => d.id === marker1?.dimensionId);
        const dim2 = this.appState.dimensions.find((d) => d.id === marker2?.dimensionId);
        if (marker1 && marker2 && dim1 && dim2) {
          this.canvasManager.renderConnection(conn, marker1, marker2, dim1, dim2);
        }
      });
    }
    /**
     * End marker drag
     */
    endDragMarker(point) {
      const marker = this.appState.markers.find((m) => m.id === this.dragTarget);
      if (!marker) return;
      if (this.onMarkerMoved) {
        this.onMarkerMoved(marker);
      }
      this.svg.style.cursor = this.appState.mode === "select" ? "grab" : "default";
    }
    /**
     * Start rotation from endpoint (rotate around opposite endpoint)
     */
    startRotationFromEndpoint(dimensionId, endpointType, point) {
      const dimension = this.appState.dimensions.find((d) => d.id === dimensionId);
      if (!dimension) return;
      const endpoints = dimension.getEndpoints();
      this.rotationPivot = endpointType === "start" ? endpoints.end : endpoints.start;
      this.rotationEndpointType = endpointType;
      this.isDragging = true;
      this.dragType = "rotate";
      this.dragTarget = dimensionId;
      this.dragStart = { ...point };
      this.svg.style.cursor = "grabbing";
    }
    /**
     * Start rotation (legacy method - rotates around center)
     */
    startRotation(dimensionId, point) {
      const dimension = this.appState.dimensions.find((d) => d.id === dimensionId);
      if (!dimension) return;
      this.isDragging = true;
      this.dragType = "rotate";
      this.dragTarget = dimensionId;
      this.dragStart = { ...point };
      this.rotationPivot = null;
      this.svg.style.cursor = "grabbing";
    }
    /**
     * Snap angle to 5-degree increments
     */
    snapAngleToGrid(angle) {
      const increment = 5;
      return Math.round(angle / increment) * increment;
    }
    /**
     * Update rotation
     */
    updateRotation(point) {
      const dimension = this.appState.dimensions.find((d) => d.id === this.dragTarget);
      if (!dimension) return;
      if (this.rotationPivot) {
        const pivot = this.rotationPivot;
        const dx = point.x - pivot.x;
        const dy = point.y - pivot.y;
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        angle = this.snapAngleToGrid(angle);
        const halfLength = dimension.length / 2;
        if (this.rotationEndpointType === "start") {
          dimension.rotation = this.snapAngleToGrid(angle + 180);
          const centerAngle = angle * Math.PI / 180;
          dimension.position.x = pivot.x + Math.cos(centerAngle) * halfLength;
          dimension.position.y = pivot.y + Math.sin(centerAngle) * halfLength;
        } else {
          dimension.rotation = angle;
          const centerAngle = angle * Math.PI / 180;
          dimension.position.x = pivot.x + Math.cos(centerAngle) * halfLength;
          dimension.position.y = pivot.y + Math.sin(centerAngle) * halfLength;
        }
      } else {
        const dx = point.x - dimension.position.x;
        const dy = point.y - dimension.position.y;
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        angle = this.snapAngleToGrid(angle);
        dimension.rotation = angle;
      }
      this.canvasManager.renderDimension(dimension);
      this.canvasManager.updateRotationHandles(dimension);
      const markers = this.appState.markers.filter((m) => m.dimensionId === dimension.id);
      markers.forEach((marker) => {
        this.canvasManager.renderMarker(marker, dimension);
        const connections = this.appState.connections.filter((c) => c.hasMarker(marker.id));
        connections.forEach((conn) => {
          const marker1 = this.appState.markers.find((m) => m.id === conn.marker1Id);
          const marker2 = this.appState.markers.find((m) => m.id === conn.marker2Id);
          const dim1 = this.appState.dimensions.find((d) => d.id === marker1?.dimensionId);
          const dim2 = this.appState.dimensions.find((d) => d.id === marker2?.dimensionId);
          if (marker1 && marker2 && dim1 && dim2) {
            this.canvasManager.renderConnection(conn, marker1, marker2, dim1, dim2);
          }
        });
      });
      if (this.snapManager) {
        this.snapManager.maintainSnap(dimension, this.appState.dimensions, this.canvasManager);
      }
    }
    /**
     * End rotation
     */
    endRotation(point) {
      const dimension = this.appState.dimensions.find((d) => d.id === this.dragTarget);
      if (!dimension) return;
      if (this.onDimensionRotated) {
        this.onDimensionRotated(dimension);
      }
      this.rotationPivot = null;
      this.rotationEndpointType = null;
      this.svg.style.cursor = this.appState.mode === "select" ? "grab" : "default";
    }
    /**
     * Enable interactions
     */
    enable() {
      this.svg.style.pointerEvents = "auto";
      this.svg.style.cursor = this.appState.mode === "select" ? "grab" : "default";
    }
    /**
     * Disable interactions
     */
    disable() {
      this.svg.style.pointerEvents = "none";
      this.isDragging = false;
      this.isPanning = false;
    }
  };

  // js/managers/SnapManager.js
  var SnapManager = class {
    constructor(snapDistance = 20) {
      this.snapDistance = snapDistance;
      this.snappedPairs = /* @__PURE__ */ new Map();
      this.tempSnapTarget = null;
    }
    /**
     * Calculate distance between two points
     */
    distance(p1, p2) {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      return Math.sqrt(dx * dx + dy * dy);
    }
    /**
     * Find nearest snap target for a dimension endpoint
     */
    findSnapTarget(endpoint, currentDimensionId, allDimensions, endpointType) {
      let closestTarget = null;
      let minDistance = this.snapDistance;
      for (const dim of allDimensions) {
        if (dim.id === currentDimensionId) continue;
        const endpoints = dim.getEndpoints();
        const distStart = this.distance(endpoint, endpoints.start);
        if (distStart < minDistance) {
          minDistance = distStart;
          closestTarget = {
            dimensionId: dim.id,
            endpoint: "start",
            point: endpoints.start,
            distance: distStart
          };
        }
        const distEnd = this.distance(endpoint, endpoints.end);
        if (distEnd < minDistance) {
          minDistance = distEnd;
          closestTarget = {
            dimensionId: dim.id,
            endpoint: "end",
            point: endpoints.end,
            distance: distEnd
          };
        }
      }
      return closestTarget;
    }
    /**
     * Check for snap during drag (shows snap indicator)
     */
    checkSnap(dimension, canvasManager2) {
      const endpoints = dimension.getEndpoints();
      const startTarget = this.findSnapTarget(
        endpoints.start,
        dimension.id,
        canvasManager2.svg.ownerDocument.defaultView.AppState.dimensions,
        "start"
      );
      const endTarget = this.findSnapTarget(
        endpoints.end,
        dimension.id,
        canvasManager2.svg.ownerDocument.defaultView.AppState.dimensions,
        "end"
      );
      let target = null;
      if (startTarget && endTarget) {
        target = startTarget.distance < endTarget.distance ? startTarget : endTarget;
      } else {
        target = startTarget || endTarget;
      }
      if (target) {
        canvasManager2.showSnapIndicator(target.point);
        this.tempSnapTarget = target;
      } else {
        canvasManager2.hideSnapIndicator();
        this.tempSnapTarget = null;
      }
    }
    /**
     * Apply snap after drag ends
     */
    applySnap(dimension, allDimensions, canvasManager2) {
      if (!this.tempSnapTarget) {
        canvasManager2.hideSnapIndicator();
        return;
      }
      const target = this.tempSnapTarget;
      const endpoints = dimension.getEndpoints();
      const distStart = this.distance(endpoints.start, target.point);
      const distEnd = this.distance(endpoints.end, target.point);
      const snapEndpoint = distStart < distEnd ? "start" : "end";
      const currentEndpoint = snapEndpoint === "start" ? endpoints.start : endpoints.end;
      const offset = {
        x: target.point.x - currentEndpoint.x,
        y: target.point.y - currentEndpoint.y
      };
      dimension.position.x += offset.x;
      dimension.position.y += offset.y;
      const key = `${dimension.id}-${snapEndpoint}`;
      this.snappedPairs.set(key, {
        targetDimensionId: target.dimensionId,
        targetEndpoint: target.endpoint,
        point: { ...target.point }
      });
      console.log(`Snapped ${dimension.id} ${snapEndpoint} to ${target.dimensionId} ${target.endpoint}`);
      canvasManager2.renderDimension(dimension);
      canvasManager2.updateRotationHandles(dimension);
      const markers = window.AppState.markers.filter((m) => m.dimensionId === dimension.id);
      markers.forEach((marker) => {
        canvasManager2.renderMarker(marker, dimension);
      });
      canvasManager2.hideSnapIndicator();
      this.tempSnapTarget = null;
    }
    /**
     * Maintain snap during rotation
     */
    maintainSnap(dimension, allDimensions, canvasManager2) {
      const startSnap = this.snappedPairs.get(`${dimension.id}-start`);
      const endSnap = this.snappedPairs.get(`${dimension.id}-end`);
      if (!startSnap && !endSnap) return;
      const endpoints = dimension.getEndpoints();
      const snapToMaintain = startSnap || endSnap;
      const endpointType = startSnap ? "start" : "end";
      const currentEndpoint = endpointType === "start" ? endpoints.start : endpoints.end;
      const targetDim = allDimensions.find((d) => d.id === snapToMaintain.targetDimensionId);
      if (!targetDim) {
        this.snappedPairs.delete(`${dimension.id}-${endpointType}`);
        return;
      }
      const targetEndpoints = targetDim.getEndpoints();
      const targetPoint = snapToMaintain.targetEndpoint === "start" ? targetEndpoints.start : targetEndpoints.end;
      const offset = {
        x: targetPoint.x - currentEndpoint.x,
        y: targetPoint.y - currentEndpoint.y
      };
      const offsetDist = Math.sqrt(offset.x * offset.x + offset.y * offset.y);
      if (offsetDist > 0.5) {
        dimension.position.x += offset.x;
        dimension.position.y += offset.y;
        snapToMaintain.point = { ...targetPoint };
        canvasManager2.renderDimension(dimension);
        canvasManager2.updateRotationHandles(dimension);
        const markers = window.AppState.markers.filter((m) => m.dimensionId === dimension.id);
        markers.forEach((marker) => {
          canvasManager2.renderMarker(marker, dimension);
        });
      }
    }
    /**
     * Remove snap for a dimension
     */
    removeSnap(dimensionId) {
      this.snappedPairs.delete(`${dimensionId}-start`);
      this.snappedPairs.delete(`${dimensionId}-end`);
      const keysToDelete = [];
      for (const [key, snapInfo] of this.snappedPairs.entries()) {
        if (snapInfo.targetDimensionId === dimensionId) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach((key) => this.snappedPairs.delete(key));
    }
    /**
     * Remove all snaps
     */
    clearAllSnaps() {
      this.snappedPairs.clear();
      this.tempSnapTarget = null;
    }
    /**
     * Check if a dimension is snapped
     */
    isSnapped(dimensionId) {
      return this.snappedPairs.has(`${dimensionId}-start`) || this.snappedPairs.has(`${dimensionId}-end`);
    }
    /**
     * Get snap info for a dimension
     */
    getSnapInfo(dimensionId) {
      return {
        start: this.snappedPairs.get(`${dimensionId}-start`),
        end: this.snappedPairs.get(`${dimensionId}-end`)
      };
    }
  };

  // js/managers/PolygonManager.js
  var PolygonManager = class {
    constructor(appState, canvasManager2) {
      this.appState = appState;
      this.canvasManager = canvasManager2;
    }
    /**
     * Detect all polygons from connections
     * @returns {Array} Array of detected polygons
     */
    detectPolygons() {
      const { connections, markers } = this.appState;
      if (connections.length < 3) {
        return [];
      }
      const graph = /* @__PURE__ */ new Map();
      for (const conn of connections) {
        if (!graph.has(conn.marker1Id)) {
          graph.set(conn.marker1Id, []);
        }
        if (!graph.has(conn.marker2Id)) {
          graph.set(conn.marker2Id, []);
        }
        graph.get(conn.marker1Id).push(conn.marker2Id);
        graph.get(conn.marker2Id).push(conn.marker1Id);
      }
      const cycles = this.findAllCycles(graph);
      const polygons = cycles.map((cycle) => {
        const orderedMarkers = this.orderPolygonPoints(cycle);
        return new Polygon(orderedMarkers);
      });
      return polygons;
    }
    /**
     * Find all simple cycles in the graph
     * @param {Map} graph - Adjacency list graph
     * @returns {Array} Array of cycles (each cycle is an array of marker IDs)
     */
    findAllCycles(graph) {
      const cycles = [];
      const visited = /* @__PURE__ */ new Set();
      for (const startNode of graph.keys()) {
        if (visited.has(startNode)) continue;
        const localCycles = this.findCyclesFromNode(graph, startNode, visited);
        cycles.push(...localCycles);
      }
      return this.removeDuplicateCycles(cycles);
    }
    /**
     * Find cycles starting from a specific node
     * @param {Map} graph - Adjacency list graph
     * @param {string} startNode - Starting node ID
     * @param {Set} globalVisited - Set of globally visited nodes
     * @returns {Array} Array of cycles found from this node
     */
    findCyclesFromNode(graph, startNode, globalVisited) {
      const cycles = [];
      const stack = [[startNode, [startNode], /* @__PURE__ */ new Set([startNode])]];
      const maxDepth = 10;
      while (stack.length > 0) {
        const [node, path, localVisited] = stack.pop();
        const neighbors = graph.get(node) || [];
        for (const neighbor of neighbors) {
          if (neighbor === startNode && path.length >= 3) {
            cycles.push([...path]);
            globalVisited.add(...path);
          } else if (!localVisited.has(neighbor) && path.length < maxDepth) {
            const newPath = [...path, neighbor];
            const newVisited = new Set(localVisited);
            newVisited.add(neighbor);
            stack.push([neighbor, newPath, newVisited]);
          }
        }
      }
      return cycles;
    }
    /**
     * Remove duplicate cycles
     * @param {Array} cycles - Array of cycles
     * @returns {Array} Unique cycles
     */
    removeDuplicateCycles(cycles) {
      const unique = [];
      const seen = /* @__PURE__ */ new Set();
      for (const cycle of cycles) {
        const sorted = [...cycle].sort().join(",");
        if (!seen.has(sorted)) {
          seen.add(sorted);
          unique.push(cycle);
        }
      }
      return unique;
    }
    /**
     * Order polygon points clockwise from centroid
     * @param {Array} markerIds - Array of marker IDs
     * @returns {Array} Ordered array of marker IDs
     */
    orderPolygonPoints(markerIds) {
      const { markers, dimensions } = this.appState;
      const positions = markerIds.map((id) => {
        const marker = markers.find((m) => m.id === id);
        if (!marker) return null;
        const dimension = dimensions.find((d) => d.id === marker.dimensionId);
        if (!dimension) return null;
        const pos = marker.getAbsolutePosition(dimension);
        return { markerId: id, ...pos };
      }).filter(Boolean);
      if (positions.length < 3) return markerIds;
      const centroid = {
        x: positions.reduce((sum, p) => sum + p.x, 0) / positions.length,
        y: positions.reduce((sum, p) => sum + p.y, 0) / positions.length
      };
      const withAngles = positions.map((pos) => ({
        markerId: pos.markerId,
        angle: Math.atan2(pos.y - centroid.y, pos.x - centroid.x)
      }));
      withAngles.sort((a, b) => a.angle - b.angle);
      return withAngles.map((item) => item.markerId);
    }
    /**
     * Update polygons based on current connections
     * Detects and renders all polygons
     */
    updatePolygons() {
      const { polygons: oldPolygons } = this.appState;
      const detectedPolygons = this.detectPolygons();
      for (const oldPoly of oldPolygons) {
        const stillExists = detectedPolygons.some(
          (newPoly) => this.areSamePolygon(oldPoly, newPoly)
        );
        if (!stillExists) {
          this.canvasManager.removePolygon(oldPoly.id);
        }
      }
      const newPolygons = [];
      for (const detectedPoly of detectedPolygons) {
        const existing = oldPolygons.find(
          (oldPoly) => this.areSamePolygon(oldPoly, detectedPoly)
        );
        if (existing) {
          newPolygons.push(existing);
          this.renderPolygon(existing);
        } else {
          newPolygons.push(detectedPoly);
          this.renderPolygon(detectedPoly);
        }
      }
      this.appState.polygons = newPolygons;
      console.log(`Detected ${newPolygons.length} polygons`);
    }
    /**
     * Check if two polygons are the same
     * @param {Polygon} poly1 - First polygon
     * @param {Polygon} poly2 - Second polygon
     * @returns {boolean} True if same polygon
     */
    areSamePolygon(poly1, poly2) {
      if (poly1.markerIds.length !== poly2.markerIds.length) {
        return false;
      }
      const set1 = new Set(poly1.markerIds);
      const set2 = new Set(poly2.markerIds);
      if (set1.size !== set2.size) {
        return false;
      }
      for (const id of set1) {
        if (!set2.has(id)) {
          return false;
        }
      }
      return true;
    }
    /**
     * Render a polygon
     * @param {Polygon} polygon - Polygon to render
     */
    renderPolygon(polygon) {
      const { markers, dimensions } = this.appState;
      const markerObjs = polygon.markerIds.map(
        (id) => markers.find((m) => m.id === id)
      ).filter(Boolean);
      const dimensionObjs = markerObjs.map(
        (marker) => dimensions.find((d) => d.id === marker.dimensionId)
      ).filter(Boolean);
      if (markerObjs.length === polygon.markerIds.length && dimensionObjs.length === polygon.markerIds.length) {
        this.canvasManager.renderPolygon(polygon, markerObjs, dimensionObjs);
      }
    }
    /**
     * Remove a polygon
     * @param {string} polygonId - ID of polygon to remove
     */
    removePolygon(polygonId) {
      const index = this.appState.polygons.findIndex((p) => p.id === polygonId);
      if (index > -1) {
        this.appState.polygons.splice(index, 1);
        this.canvasManager.removePolygon(polygonId);
      }
    }
    /**
     * Clear all polygons
     */
    clearAllPolygons() {
      for (const polygon of this.appState.polygons) {
        this.canvasManager.removePolygon(polygon.id);
      }
      this.appState.polygons = [];
    }
  };

  // js/main.js
  var AppState = {
    dimensions: [],
    markers: [],
    connections: [],
    intersections: [],
    polygons: [],
    selectedElement: null,
    selectedType: null,
    mode: "select",
    // 'select', 'addDimension', 'addMarker', 'connect', 'addIntersection'
    snapDistance: 20,
    // Temporary state for multi-step operations
    tempFirstMarker: null,
    // For connection mode
    tempFirstIntersectionMarker: null
    // For intersection mode
  };
  var canvasManager;
  var interactionManager;
  var snapManager;
  var polygonManager;
  function init() {
    console.log("Initializing Dimension Visualization App...");
    const svgElement = document.getElementById("canvas-svg");
    if (!svgElement) {
      console.error("SVG canvas element not found!");
      return;
    }
    canvasManager = new CanvasManager(svgElement);
    interactionManager = new InteractionManager(svgElement, canvasManager, AppState);
    snapManager = new SnapManager(AppState.snapDistance);
    polygonManager = new PolygonManager(AppState, canvasManager);
    interactionManager.snapManager = snapManager;
    interactionManager.onDimensionMoved = () => {
      rerenderAllPolygons();
      updateStatusBar();
    };
    interactionManager.onMarkerMoved = () => {
      polygonManager.updatePolygons();
      AppState.markers.forEach((m) => rerenderIntersectionsForMarker(m.id));
      updateStatusBar();
    };
    interactionManager.onDimensionRotated = () => {
      rerenderAllPolygons();
      AppState.markers.forEach((m) => rerenderIntersectionsForMarker(m.id));
      updateStatusBar();
    };
    setupToolbarEvents();
    setupCanvasEvents();
    setupPropertyPanelEvents();
    updateStatusBar();
    updateModeDisplay();
    console.log("App initialized successfully!");
  }
  function setupToolbarEvents() {
    const btnFile = document.getElementById("btn-file");
    const fileMenu = document.getElementById("file-menu");
    if (btnFile && fileMenu) {
      btnFile.addEventListener("click", (e) => {
        e.stopPropagation();
        fileMenu.classList.toggle("hidden");
      });
      document.addEventListener("click", () => {
        fileMenu.classList.add("hidden");
      });
    }
    const btnSave = document.getElementById("btn-save");
    if (btnSave) {
      btnSave.addEventListener("click", () => {
        saveToFile();
      });
    }
    const btnLoad = document.getElementById("btn-load");
    if (btnLoad) {
      btnLoad.addEventListener("click", () => {
        loadFromFile();
      });
    }
    const btnExportSvg = document.getElementById("btn-export-svg");
    if (btnExportSvg) {
      btnExportSvg.addEventListener("click", () => {
        exportSVG();
      });
    }
    const btnExportPng = document.getElementById("btn-export-png");
    if (btnExportPng) {
      btnExportPng.addEventListener("click", () => {
        exportPNG();
      });
    }
    const btnAddDimension = document.getElementById("btn-add-dimension");
    if (btnAddDimension) {
      btnAddDimension.addEventListener("click", () => {
        setMode("addDimension");
      });
    }
    const btnAddMarker = document.getElementById("btn-add-marker");
    if (btnAddMarker) {
      btnAddMarker.addEventListener("click", () => {
        setMode("addMarker");
      });
    }
    const btnConnect = document.getElementById("btn-connect");
    if (btnConnect) {
      btnConnect.addEventListener("click", () => {
        setMode("connect");
      });
    }
    const btnIntersection = document.getElementById("btn-intersection");
    if (btnIntersection) {
      btnIntersection.addEventListener("click", () => {
        setMode("addIntersection");
      });
    }
  }
  function setupCanvasEvents() {
    const svg = document.getElementById("canvas-svg");
    if (!svg) return;
    svg.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomDelta = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      canvasManager.zoomAtPoint(e.clientX, e.clientY, zoomDelta);
    }, { passive: false });
    svg.addEventListener("click", (e) => {
      if (interactionManager.consumeDidPan()) {
        return;
      }
      handleCanvasClick(e);
    });
    svg.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      handleCanvasRightClick(e);
    });
    svg.addEventListener("dblclick", (e) => {
      if (interactionManager.consumeDidPan()) {
        return;
      }
      if (e.target === svg) {
        setMode("select");
        canvasManager.clearSelection();
        updatePropertyPanel();
      }
    });
    window.addEventListener("resize", () => {
      canvasManager.handleResize();
    });
  }
  function setupPropertyPanelEvents() {
  }
  function handleCanvasClick(e) {
    const target = e.target;
    switch (AppState.mode) {
      case "addDimension":
        addDimensionAtPoint(e.clientX, e.clientY);
        setMode("select");
        break;
      case "addMarker":
        handleAddMarkerClick(target);
        break;
      case "connect":
        handleConnectClick(target);
        break;
      case "addIntersection":
        handleAddIntersectionClick(target);
        break;
      case "select":
        handleSelectClick(target);
        break;
    }
  }
  function addDimensionAtPoint(clientX, clientY) {
    const { x, y } = canvasManager.clientToWorld(clientX, clientY);
    const dimension = new Dimension({
      position: { x, y },
      label: `Dimension ${AppState.dimensions.length + 1}`,
      minValue: 0,
      maxValue: 100,
      length: 300
    });
    AppState.dimensions.push(dimension);
    canvasManager.renderDimension(dimension);
    const midpointMarker = new Marker(dimension.id, {
      value: 50,
      name: `Mark\xF8r ${AppState.markers.length + 1}`,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")
    });
    AppState.markers.push(midpointMarker);
    dimension.addMarker(midpointMarker.id);
    canvasManager.renderMarker(midpointMarker, dimension);
    canvasManager.selectElement(dimension.id, "dimension");
    AppState.selectedElement = dimension.id;
    AppState.selectedType = "dimension";
    updatePropertyPanel();
    updateStatusBar();
    console.log(`Dimension ${dimension.id} created at (${x}, ${y}) with midpoint marker ${midpointMarker.id}`);
  }
  function handleAddMarkerClick(target) {
    const dimensionId = target.getAttribute("data-dimension-id");
    if (!dimensionId) {
      alert("Klik p\xE5 en dimension for at tilf\xF8je en mark\xF8r");
      return;
    }
    const dimension = AppState.dimensions.find((d) => d.id === dimensionId);
    if (!dimension) return;
    const svg = document.getElementById("canvas-svg");
    const rect = svg.getBoundingClientRect();
    const clickPoint = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    const closestPoint = dimension.getClosestPointOnLine(clickPoint);
    const marker = new Marker(dimensionId, {
      value: closestPoint.value,
      name: `Mark\xF8r ${AppState.markers.length + 1}`,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")
    });
    AppState.markers.push(marker);
    dimension.addMarker(marker.id);
    canvasManager.renderMarker(marker, dimension);
    canvasManager.selectElement(marker.id, "marker");
    AppState.selectedElement = marker.id;
    AppState.selectedType = "marker";
    updatePropertyPanel();
    updateStatusBar();
    setMode("select");
    console.log(`Marker ${marker.id} created on dimension ${dimensionId}`);
  }
  function handleConnectClick(target) {
    const markerId = target.getAttribute("data-marker-id");
    if (!markerId) {
      alert("Klik p\xE5 en mark\xF8r for at forbinde");
      return;
    }
    if (!AppState.tempFirstMarker) {
      AppState.tempFirstMarker = markerId;
      console.log(`First marker selected: ${markerId}`);
      const markerEl = canvasManager.markerElements.get(markerId);
      if (markerEl) {
        markerEl.querySelector(".marker").classList.add("selected");
      }
    } else {
      const marker2Id = markerId;
      const marker1Id = AppState.tempFirstMarker;
      if (marker1Id === marker2Id) {
        alert("Kan ikke forbinde en mark\xF8r til sig selv");
        AppState.tempFirstMarker = null;
        canvasManager.clearSelection();
        return;
      }
      const exists = AppState.connections.some(
        (c) => c.marker1Id === marker1Id && c.marker2Id === marker2Id || c.marker1Id === marker2Id && c.marker2Id === marker1Id
      );
      if (exists) {
        alert("Forbindelse findes allerede");
        AppState.tempFirstMarker = null;
        canvasManager.clearSelection();
        return;
      }
      const connection = new Connection(marker1Id, marker2Id);
      AppState.connections.push(connection);
      const marker1 = AppState.markers.find((m) => m.id === marker1Id);
      const marker2 = AppState.markers.find((m) => m.id === marker2Id);
      const dim1 = AppState.dimensions.find((d) => d.id === marker1.dimensionId);
      const dim2 = AppState.dimensions.find((d) => d.id === marker2.dimensionId);
      canvasManager.renderConnection(connection, marker1, marker2, dim1, dim2);
      console.log(`Connection ${connection.id} created between ${marker1Id} and ${marker2Id}`);
      polygonManager.updatePolygons();
      AppState.tempFirstMarker = null;
      canvasManager.clearSelection();
      updateStatusBar();
      setMode("select");
    }
  }
  function handleAddIntersectionClick(target) {
    const markerId = target.getAttribute("data-marker-id");
    if (!markerId) {
      alert("Klik p\xE5 en mark\xF8r for at v\xE6lge f\xF8rste punkt i f\xE6llespunktet");
      return;
    }
    if (!AppState.tempFirstIntersectionMarker) {
      AppState.tempFirstIntersectionMarker = markerId;
      console.log(`First marker selected for intersection: ${markerId}`);
      const markerEl = canvasManager.markerElements.get(markerId);
      if (markerEl) {
        markerEl.querySelector(".marker").classList.add("selected");
      }
    } else {
      const marker2Id = markerId;
      const marker1Id = AppState.tempFirstIntersectionMarker;
      if (marker1Id === marker2Id) {
        alert("Kan ikke lave et f\xE6llespunkt mellem en mark\xF8r og sig selv");
        AppState.tempFirstIntersectionMarker = null;
        canvasManager.clearSelection();
        return;
      }
      const marker1 = AppState.markers.find((m) => m.id === marker1Id);
      const marker2 = AppState.markers.find((m) => m.id === marker2Id);
      if (marker1.dimensionId === marker2.dimensionId) {
        alert("Mark\xF8rerne skal v\xE6re p\xE5 forskellige dimensioner for at finde et f\xE6llespunkt");
        AppState.tempFirstIntersectionMarker = null;
        canvasManager.clearSelection();
        return;
      }
      const exists = AppState.intersections.some(
        (i) => i.marker1Id === marker1Id && i.marker2Id === marker2Id || i.marker1Id === marker2Id && i.marker2Id === marker1Id
      );
      if (exists) {
        alert("F\xE6llespunkt findes allerede");
        AppState.tempFirstIntersectionMarker = null;
        canvasManager.clearSelection();
        return;
      }
      const intersection = new Intersection(marker1Id, marker2Id);
      AppState.intersections.push(intersection);
      const dim1 = AppState.dimensions.find((d) => d.id === marker1.dimensionId);
      const dim2 = AppState.dimensions.find((d) => d.id === marker2.dimensionId);
      canvasManager.renderIntersection(intersection, marker1, marker2, dim1, dim2);
      console.log(`Intersection ${intersection.id} created between ${marker1Id} and ${marker2Id}`);
      AppState.tempFirstIntersectionMarker = null;
      canvasManager.clearSelection();
      updateStatusBar();
      setMode("select");
    }
  }
  function handleSelectClick(target) {
    const dimensionId = target.getAttribute("data-dimension-id");
    const markerId = target.getAttribute("data-marker-id");
    const connectionId = target.getAttribute("data-connection-id");
    const intersectionId = target.getAttribute("data-intersection-id");
    const polygonId = target.getAttribute("data-polygon-id");
    if (markerId) {
      canvasManager.selectElement(markerId, "marker");
      AppState.selectedElement = markerId;
      AppState.selectedType = "marker";
      updatePropertyPanel();
    } else if (dimensionId) {
      canvasManager.selectElement(dimensionId, "dimension");
      AppState.selectedElement = dimensionId;
      AppState.selectedType = "dimension";
      const dimension = AppState.dimensions.find((d) => d.id === dimensionId);
      if (dimension) {
        canvasManager.showRotationHandles(dimension);
      }
      updatePropertyPanel();
    } else if (connectionId) {
      canvasManager.selectElement(connectionId, "connection");
      AppState.selectedElement = connectionId;
      AppState.selectedType = "connection";
      updatePropertyPanel();
    } else if (intersectionId) {
      canvasManager.selectElement(intersectionId, "intersection");
      AppState.selectedElement = intersectionId;
      AppState.selectedType = "intersection";
      updatePropertyPanel();
    } else if (polygonId) {
      canvasManager.selectElement(polygonId, "polygon");
      AppState.selectedElement = polygonId;
      AppState.selectedType = "polygon";
      updatePropertyPanel();
    } else {
      canvasManager.clearSelection();
      AppState.selectedElement = null;
      AppState.selectedType = null;
      updatePropertyPanel();
    }
  }
  function handleCanvasRightClick(e) {
    const target = e.target;
    const endpoint = target.closest(".dimension-endpoint");
    if (endpoint) {
      const dimensionId = endpoint.getAttribute("data-dimension-id");
      const endpointType = endpoint.getAttribute("data-endpoint");
      if (dimensionId && endpointType) {
        const hasSnaps = snapManager && snapManager.isSnapped(dimensionId);
        if (hasSnaps) {
          showUnsnapModal(dimensionId, endpointType);
        }
      }
    }
  }
  function showUnsnapModal(dimensionId, endpointType) {
    const dimension = AppState.dimensions.find((d) => d.id === dimensionId);
    if (!dimension) return;
    const snapInfo = snapManager.getSnapInfo(dimensionId);
    const endpointSnap = endpointType === "start" ? snapInfo.start : snapInfo.end;
    if (!endpointSnap) return;
    const connectedAtPoint = [];
    connectedAtPoint.push({
      id: dimensionId,
      label: dimension.label,
      endpoint: endpointType
    });
    for (const dim of AppState.dimensions) {
      if (dim.id === dimensionId) continue;
      const otherSnapInfo = snapManager.getSnapInfo(dim.id);
      if (otherSnapInfo.start) {
        const isSamePoint = otherSnapInfo.start.targetDimensionId === dimensionId && otherSnapInfo.start.targetEndpoint === endpointType || dimensionId === otherSnapInfo.start.targetDimensionId;
        if (isSamePoint || otherSnapInfo.start.targetDimensionId === endpointSnap.targetDimensionId && otherSnapInfo.start.targetEndpoint === endpointSnap.targetEndpoint) {
          connectedAtPoint.push({
            id: dim.id,
            label: dim.label,
            endpoint: "start"
          });
        }
      }
      if (otherSnapInfo.end) {
        const isSamePoint = otherSnapInfo.end.targetDimensionId === dimensionId && otherSnapInfo.end.targetEndpoint === endpointType || dimensionId === otherSnapInfo.end.targetDimensionId;
        if (isSamePoint || otherSnapInfo.end.targetDimensionId === endpointSnap.targetDimensionId && otherSnapInfo.end.targetEndpoint === endpointSnap.targetEndpoint) {
          connectedAtPoint.push({
            id: dim.id,
            label: dim.label,
            endpoint: "end"
          });
        }
      }
    }
    const uniqueDimensions = Array.from(new Map(
      connectedAtPoint.map((item) => [item.id, item])
    ).values());
    if (uniqueDimensions.length === 0) return;
    const unsnapList = document.getElementById("unsnap-list");
    if (!unsnapList) return;
    unsnapList.innerHTML = "";
    uniqueDimensions.forEach((dim) => {
      const item = document.createElement("div");
      item.classList.add("unsnap-item");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `unsnap-${dim.id}-${dim.endpoint}`;
      checkbox.value = `${dim.id}|${dim.endpoint}`;
      const label = document.createElement("label");
      label.htmlFor = checkbox.id;
      label.textContent = `${dim.label} (${dim.endpoint === "start" ? "Start" : "Slut"} endepunkt)`;
      item.appendChild(checkbox);
      item.appendChild(label);
      unsnapList.appendChild(item);
    });
    const modal = document.getElementById("unsnap-modal");
    if (modal) {
      modal.classList.remove("hidden");
    }
    setupUnsnapModalHandlers();
  }
  function setupUnsnapModalHandlers() {
    const confirmBtn = document.getElementById("unsnap-confirm");
    const cancelBtn = document.getElementById("unsnap-cancel");
    const modal = document.getElementById("unsnap-modal");
    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    newCancelBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.add("hidden");
      }
    });
    newConfirmBtn.addEventListener("click", () => {
      const checkboxes = document.querySelectorAll('#unsnap-list input[type="checkbox"]:checked');
      checkboxes.forEach((checkbox) => {
        const [dimId, endpoint] = checkbox.value.split("|");
        if (snapManager) {
          snapManager.snappedPairs.delete(`${dimId}-${endpoint}`);
          console.log(`Unsnapped ${dimId} ${endpoint}`);
        }
      });
      AppState.dimensions.forEach((dim) => {
        canvasManager.renderDimension(dim);
      });
      rerenderAllMarkersAndConnections();
      rerenderAllPolygons();
      modal.classList.add("hidden");
    });
  }
  function setMode(mode) {
    AppState.mode = mode;
    updateModeDisplay();
    const svg = document.getElementById("canvas-svg");
    svg.className = `mode-${mode}`;
    svg.style.cursor = mode === "select" ? "grab" : "";
    document.querySelectorAll(".toolbar-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    if (mode === "addDimension") {
      document.getElementById("btn-add-dimension")?.classList.add("active");
    } else if (mode === "addMarker") {
      document.getElementById("btn-add-marker")?.classList.add("active");
    } else if (mode === "connect") {
      document.getElementById("btn-connect")?.classList.add("active");
    } else if (mode === "addIntersection") {
      document.getElementById("btn-intersection")?.classList.add("active");
    }
    AppState.tempFirstMarker = null;
    AppState.tempFirstIntersectionMarker = null;
    if (mode !== "connect" && mode !== "addIntersection") {
      canvasManager.clearSelection();
    }
  }
  function updateModeDisplay() {
    const modeDisplay = document.getElementById("mode-display");
    if (!modeDisplay) return;
    const modeNames = {
      select: "Select",
      addDimension: "Tilf\xF8j Dimension",
      addMarker: "Tilf\xF8j Mark\xF8r",
      connect: "Forbind Mark\xF8rer",
      addIntersection: "Tilf\xF8j F\xE6llespunkt"
    };
    modeDisplay.textContent = `Mode: ${modeNames[AppState.mode] || AppState.mode}`;
  }
  function updateStatusBar() {
    const statusText = document.getElementById("status-text");
    if (!statusText) return;
    statusText.textContent = `${AppState.dimensions.length} dimensioner \u2022 ${AppState.markers.length} mark\xF8rer \u2022 ${AppState.connections.length} forbindelser \u2022 ${AppState.intersections.length} f\xE6llespunkter \u2022 ${AppState.polygons.length} polygoner`;
  }
  function updatePropertyPanel() {
    const propsContent = document.querySelector(".props-content");
    if (!propsContent) return;
    if (!AppState.selectedElement || !AppState.selectedType) {
      propsContent.innerHTML = '<p class="props-empty">V\xE6lg et element</p>';
      return;
    }
    switch (AppState.selectedType) {
      case "dimension":
        updateDimensionProperties(propsContent);
        break;
      case "marker":
        updateMarkerProperties(propsContent);
        break;
      case "connection":
        updateConnectionProperties(propsContent);
        break;
      case "intersection":
        updateIntersectionProperties(propsContent);
        break;
      case "polygon":
        updatePolygonProperties(propsContent);
        break;
    }
  }
  function updateDimensionProperties(container) {
    const dimension = AppState.dimensions.find((d) => d.id === AppState.selectedElement);
    if (!dimension) return;
    container.innerHTML = `
        <div class="prop-group">
            <label>Navn</label>
            <input type="text" id="prop-dim-label" value="${dimension.label}">
        </div>
        <div class="prop-group">
            <label>Min V\xE6rdi</label>
            <input type="number" id="prop-dim-min" value="${dimension.minValue}">
        </div>
        <div class="prop-group">
            <label>Max V\xE6rdi</label>
            <input type="number" id="prop-dim-max" value="${dimension.maxValue}">
        </div>
        <div class="prop-group">
            <label>L\xE6ngde (pixels)</label>
            <input type="number" id="prop-dim-length" value="${dimension.length}">
        </div>
        <div class="prop-group">
            <label>Rotation (grader)</label>
            <input type="number" id="prop-dim-rotation" value="${Math.round(dimension.rotation / 5) * 5}" min="0" max="360" step="5">
        </div>
        <div class="prop-group">
            <button id="btn-delete-dimension">Slet Dimension</button>
        </div>
    `;
    document.getElementById("prop-dim-label").addEventListener("input", (e) => {
      dimension.label = e.target.value;
      canvasManager.renderDimension(dimension);
    });
    document.getElementById("prop-dim-min").addEventListener("input", (e) => {
      dimension.minValue = parseFloat(e.target.value);
      canvasManager.renderDimension(dimension);
    });
    document.getElementById("prop-dim-max").addEventListener("input", (e) => {
      dimension.maxValue = parseFloat(e.target.value);
      canvasManager.renderDimension(dimension);
    });
    document.getElementById("prop-dim-length").addEventListener("input", (e) => {
      dimension.length = parseFloat(e.target.value);
      canvasManager.renderDimension(dimension);
      canvasManager.showRotationHandles(dimension);
      rerenderAllMarkersAndConnections();
      rerenderAllIntersections();
      rerenderAllPolygons();
    });
    document.getElementById("prop-dim-rotation").addEventListener("input", (e) => {
      dimension.rotation = parseFloat(e.target.value) % 360;
      canvasManager.renderDimension(dimension);
      canvasManager.updateRotationHandles(dimension);
      rerenderAllMarkersAndConnections();
      rerenderAllIntersections();
      rerenderAllPolygons();
    });
    document.getElementById("btn-delete-dimension").addEventListener("click", () => {
      deleteDimension(dimension.id);
    });
  }
  function updateMarkerProperties(container) {
    const marker = AppState.markers.find((m) => m.id === AppState.selectedElement);
    if (!marker) return;
    const dimension = AppState.dimensions.find((d) => d.id === marker.dimensionId);
    container.innerHTML = `
        <div class="prop-group">
            <label>Navn</label>
            <input type="text" id="prop-marker-name" value="${marker.name}">
        </div>
        <div class="prop-group">
            <label>V\xE6rdi</label>
            <input type="number" id="prop-marker-value" value="${marker.value}"
                   min="${dimension?.minValue || 0}" max="${dimension?.maxValue || 100}">
        </div>
        <div class="prop-group">
            <label>Farve</label>
            <input type="color" id="prop-marker-color" value="${marker.color}">
        </div>
        <div class="prop-group">
            <label>St\xF8rrelse</label>
            <input type="number" id="prop-marker-radius" value="${marker.radius}" min="4" max="20">
        </div>
        <div class="prop-group">
            <button id="btn-delete-marker">Slet Mark\xF8r</button>
        </div>
    `;
    document.getElementById("prop-marker-name").addEventListener("input", (e) => {
      marker.name = e.target.value;
      if (dimension) canvasManager.renderMarker(marker, dimension);
    });
    document.getElementById("prop-marker-value").addEventListener("input", (e) => {
      marker.value = parseFloat(e.target.value);
      if (dimension) {
        canvasManager.renderMarker(marker, dimension);
        rerenderConnectionsForMarker(marker.id);
        rerenderIntersectionsForMarker(marker.id);
        rerenderAllPolygons();
      }
    });
    document.getElementById("prop-marker-color").addEventListener("input", (e) => {
      marker.color = e.target.value;
      if (dimension) canvasManager.renderMarker(marker, dimension);
    });
    document.getElementById("prop-marker-radius").addEventListener("input", (e) => {
      marker.radius = parseFloat(e.target.value);
      if (dimension) canvasManager.renderMarker(marker, dimension);
    });
    document.getElementById("btn-delete-marker").addEventListener("click", () => {
      deleteMarker(marker.id);
    });
  }
  function updateConnectionProperties(container) {
    const connection = AppState.connections.find((c) => c.id === AppState.selectedElement);
    if (!connection) return;
    container.innerHTML = `
        <div class="prop-group">
            <label>Linje Style</label>
            <select id="prop-conn-style">
                <option value="solid" ${connection.style === "solid" ? "selected" : ""}>Hel linje</option>
                <option value="dashed" ${connection.style === "dashed" ? "selected" : ""}>Stiplet linje</option>
            </select>
        </div>
        <div class="prop-group">
            <label>Farve</label>
            <input type="color" id="prop-conn-color" value="${connection.color}">
        </div>
        <div class="prop-group">
            <label>Tykkelse</label>
            <input type="number" id="prop-conn-width" value="${connection.width}" min="1" max="10">
        </div>
        <div class="prop-group">
            <button id="btn-delete-connection">Slet Forbindelse</button>
        </div>
    `;
    document.getElementById("prop-conn-style").addEventListener("change", (e) => {
      connection.style = e.target.value;
      rerenderConnection(connection.id);
    });
    document.getElementById("prop-conn-color").addEventListener("input", (e) => {
      connection.color = e.target.value;
      rerenderConnection(connection.id);
    });
    document.getElementById("prop-conn-width").addEventListener("input", (e) => {
      connection.width = parseFloat(e.target.value);
      rerenderConnection(connection.id);
    });
    document.getElementById("btn-delete-connection").addEventListener("click", () => {
      deleteConnection(connection.id);
    });
  }
  function updateIntersectionProperties(container) {
    const intersection = AppState.intersections.find((i) => i.id === AppState.selectedElement);
    if (!intersection) return;
    container.innerHTML = `
        <div class="prop-group">
            <label>Punkt Farve</label>
            <input type="color" id="prop-int-point-color" value="${intersection.pointColor}">
        </div>
        <div class="prop-group">
            <label>Punkt St\xF8rrelse</label>
            <input type="number" id="prop-int-point-radius" value="${intersection.pointRadius}" min="2" max="20">
        </div>
        <div class="prop-group">
            <label>Linje Farve</label>
            <input type="color" id="prop-int-line-color" value="${intersection.lineColor}">
        </div>
        <div class="prop-group">
            <label>Linje Tykkelse</label>
            <input type="number" id="prop-int-line-width" value="${intersection.lineWidth}" min="1" max="10">
        </div>
        <div class="prop-group">
            <label>Linje Style</label>
            <select id="prop-int-line-style">
                <option value="solid" ${intersection.lineStyle === "solid" ? "selected" : ""}>Hel linje</option>
                <option value="dashed" ${intersection.lineStyle === "dashed" ? "selected" : ""}>Stiplet linje</option>
            </select>
        </div>
        <div class="prop-group">
            <button id="btn-delete-intersection">Slet F\xE6llespunkt</button>
        </div>
    `;
    document.getElementById("prop-int-point-color").addEventListener("input", (e) => {
      intersection.pointColor = e.target.value;
      rerenderIntersection(intersection.id);
    });
    document.getElementById("prop-int-point-radius").addEventListener("input", (e) => {
      intersection.pointRadius = parseFloat(e.target.value);
      rerenderIntersection(intersection.id);
    });
    document.getElementById("prop-int-line-color").addEventListener("input", (e) => {
      intersection.lineColor = e.target.value;
      rerenderIntersection(intersection.id);
    });
    document.getElementById("prop-int-line-width").addEventListener("input", (e) => {
      intersection.lineWidth = parseFloat(e.target.value);
      rerenderIntersection(intersection.id);
    });
    document.getElementById("prop-int-line-style").addEventListener("change", (e) => {
      intersection.lineStyle = e.target.value;
      rerenderIntersection(intersection.id);
    });
    document.getElementById("btn-delete-intersection").addEventListener("click", () => {
      deleteIntersection(intersection.id);
    });
  }
  function updatePolygonProperties(container) {
    const polygon = AppState.polygons.find((p) => p.id === AppState.selectedElement);
    if (!polygon) return;
    container.innerHTML = `
        <div class="prop-group">
            <label>Udfyldningsfarve</label>
            <input type="color" id="prop-poly-color" value="${polygon.fillColor}">
        </div>
        <div class="prop-group">
            <label>Gennemsigtighed</label>
            <input type="number" id="prop-poly-opacity" value="${polygon.fillOpacity}" min="0" max="1" step="0.1">
        </div>
        <div class="prop-group">
            <button id="btn-delete-polygon">Slet Polygon</button>
        </div>
    `;
    document.getElementById("prop-poly-color").addEventListener("input", (e) => {
      polygon.fillColor = e.target.value;
      rerenderPolygon(polygon.id);
    });
    document.getElementById("prop-poly-opacity").addEventListener("input", (e) => {
      polygon.fillOpacity = parseFloat(e.target.value);
      rerenderPolygon(polygon.id);
    });
    document.getElementById("btn-delete-polygon").addEventListener("click", () => {
      deletePolygon(polygon.id);
    });
  }
  function deleteDimension(dimensionId) {
    if (!confirm("Slet denne dimension? Alle tilh\xF8rende mark\xF8rer vil ogs\xE5 blive slettet.")) {
      return;
    }
    const markersToDelete = AppState.markers.filter((m) => m.dimensionId === dimensionId);
    markersToDelete.forEach((marker) => {
      deleteMarker(marker.id, false);
    });
    if (snapManager) {
      snapManager.removeSnap(dimensionId);
    }
    const index = AppState.dimensions.findIndex((d) => d.id === dimensionId);
    if (index > -1) {
      AppState.dimensions.splice(index, 1);
    }
    canvasManager.removeDimension(dimensionId);
    canvasManager.clearSelection();
    AppState.selectedElement = null;
    AppState.selectedType = null;
    updatePropertyPanel();
    updateStatusBar();
  }
  function deleteMarker(markerId, confirm2 = true) {
    if (confirm2 && !window.confirm("Slet denne mark\xF8r? Alle forbindelser vil ogs\xE5 blive slettet.")) {
      return;
    }
    const connectionsToDelete = AppState.connections.filter((c) => c.hasMarker(markerId));
    connectionsToDelete.forEach((conn) => {
      deleteConnection(conn.id, false);
    });
    const intersectionsToDelete = AppState.intersections.filter((i) => i.hasMarker(markerId));
    intersectionsToDelete.forEach((i) => {
      deleteIntersection(i.id, false);
    });
    const marker = AppState.markers.find((m) => m.id === markerId);
    if (marker) {
      const dimension = AppState.dimensions.find((d) => d.id === marker.dimensionId);
      if (dimension) {
        dimension.removeMarker(markerId);
      }
    }
    const index = AppState.markers.findIndex((m) => m.id === markerId);
    if (index > -1) {
      AppState.markers.splice(index, 1);
    }
    canvasManager.removeMarker(markerId);
    if (AppState.selectedElement === markerId) {
      canvasManager.clearSelection();
      AppState.selectedElement = null;
      AppState.selectedType = null;
      updatePropertyPanel();
    }
    updateStatusBar();
  }
  function deleteConnection(connectionId, confirm2 = true) {
    if (confirm2 && !window.confirm("Slet denne forbindelse?")) {
      return;
    }
    const index = AppState.connections.findIndex((c) => c.id === connectionId);
    if (index > -1) {
      AppState.connections.splice(index, 1);
    }
    canvasManager.removeConnection(connectionId);
    polygonManager.updatePolygons();
    if (AppState.selectedElement === connectionId) {
      canvasManager.clearSelection();
      AppState.selectedElement = null;
      AppState.selectedType = null;
      updatePropertyPanel();
    }
    updateStatusBar();
  }
  function deleteIntersection(intersectionId, confirm2 = true) {
    if (confirm2 && !window.confirm("Slet dette f\xE6llespunkt?")) {
      return;
    }
    const index = AppState.intersections.findIndex((i) => i.id === intersectionId);
    if (index > -1) {
      AppState.intersections.splice(index, 1);
    }
    canvasManager.removeIntersection(intersectionId);
    if (AppState.selectedElement === intersectionId) {
      canvasManager.clearSelection();
      AppState.selectedElement = null;
      AppState.selectedType = null;
      updatePropertyPanel();
    }
    updateStatusBar();
  }
  function deletePolygon(polygonId) {
    const index = AppState.polygons.findIndex((p) => p.id === polygonId);
    if (index > -1) {
      AppState.polygons.splice(index, 1);
    }
    canvasManager.removePolygon(polygonId);
    if (AppState.selectedElement === polygonId) {
      canvasManager.clearSelection();
      AppState.selectedElement = null;
      AppState.selectedType = null;
      updatePropertyPanel();
    }
    updateStatusBar();
  }
  function rerenderConnection(connectionId) {
    const connection = AppState.connections.find((c) => c.id === connectionId);
    if (!connection) return;
    const marker1 = AppState.markers.find((m) => m.id === connection.marker1Id);
    const marker2 = AppState.markers.find((m) => m.id === connection.marker2Id);
    const dim1 = AppState.dimensions.find((d) => d.id === marker1?.dimensionId);
    const dim2 = AppState.dimensions.find((d) => d.id === marker2?.dimensionId);
    if (marker1 && marker2 && dim1 && dim2) {
      canvasManager.renderConnection(connection, marker1, marker2, dim1, dim2);
    }
  }
  function rerenderConnectionsForMarker(markerId) {
    const connections = AppState.connections.filter((c) => c.hasMarker(markerId));
    connections.forEach((conn) => rerenderConnection(conn.id));
  }
  function rerenderAllMarkersAndConnections() {
    AppState.markers.forEach((marker) => {
      const dimension = AppState.dimensions.find((d) => d.id === marker.dimensionId);
      if (dimension) {
        canvasManager.renderMarker(marker, dimension);
      }
    });
    AppState.connections.forEach((conn) => rerenderConnection(conn.id));
  }
  function rerenderIntersection(intersectionId) {
    const intersection = AppState.intersections.find((i) => i.id === intersectionId);
    if (!intersection) return;
    const marker1 = AppState.markers.find((m) => m.id === intersection.marker1Id);
    const marker2 = AppState.markers.find((m) => m.id === intersection.marker2Id);
    const dim1 = AppState.dimensions.find((d) => d.id === marker1?.dimensionId);
    const dim2 = AppState.dimensions.find((d) => d.id === marker2?.dimensionId);
    if (marker1 && marker2 && dim1 && dim2) {
      canvasManager.renderIntersection(intersection, marker1, marker2, dim1, dim2);
    }
  }
  function rerenderIntersectionsForMarker(markerId) {
    const intersections = AppState.intersections.filter((i) => i.hasMarker(markerId));
    intersections.forEach((i) => rerenderIntersection(i.id));
  }
  function rerenderAllIntersections() {
    AppState.intersections.forEach((i) => rerenderIntersection(i.id));
  }
  function rerenderPolygon(polygonId) {
    const polygon = AppState.polygons.find((p) => p.id === polygonId);
    if (!polygon) return;
    const markers = polygon.markerIds.map((id) => AppState.markers.find((m) => m.id === id)).filter(Boolean);
    const dimensions = markers.map((m) => AppState.dimensions.find((d) => d.id === m.dimensionId)).filter(Boolean);
    if (markers.length === polygon.markerIds.length && dimensions.length === polygon.markerIds.length) {
      canvasManager.renderPolygon(polygon, markers, dimensions);
    }
  }
  function rerenderAllPolygons() {
    AppState.polygons.forEach((polygon) => {
      rerenderPolygon(polygon.id);
    });
  }
  function saveToFile() {
    const data = {
      version: "1.0",
      metadata: {
        created: (/* @__PURE__ */ new Date()).toISOString(),
        modified: (/* @__PURE__ */ new Date()).toISOString()
      },
      dimensions: AppState.dimensions.map((d) => d.toJSON()),
      markers: AppState.markers.map((m) => m.toJSON()),
      connections: AppState.connections.map((c) => c.toJSON()),
      intersections: AppState.intersections.map((i) => i.toJSON()),
      polygons: AppState.polygons.map((p) => p.toJSON()),
      settings: {
        snapDistance: AppState.snapDistance
      }
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dimension-visualization-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log("File saved successfully");
  }
  function loadFromFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event2) => {
        try {
          const data = JSON.parse(event2.target.result);
          canvasManager.clear();
          AppState.dimensions = [];
          AppState.markers = [];
          AppState.connections = [];
          AppState.intersections = [];
          AppState.polygons = [];
          data.dimensions.forEach((dimData) => {
            const dim = Dimension.fromJSON(dimData);
            AppState.dimensions.push(dim);
            canvasManager.renderDimension(dim);
          });
          data.markers.forEach((markerData) => {
            const marker = Marker.fromJSON(markerData);
            AppState.markers.push(marker);
            const dim = AppState.dimensions.find((d) => d.id === marker.dimensionId);
            if (dim) {
              canvasManager.renderMarker(marker, dim);
            }
          });
          data.connections.forEach((connData) => {
            const conn = Connection.fromJSON(connData);
            AppState.connections.push(conn);
            rerenderConnection(conn.id);
          });
          if (data.intersections) {
            data.intersections.forEach((intData) => {
              const intersection = Intersection.fromJSON(intData);
              AppState.intersections.push(intersection);
              rerenderIntersection(intersection.id);
            });
          }
          if (data.polygons) {
            data.polygons.forEach((polyData) => {
              const poly = Polygon.fromJSON(polyData);
              AppState.polygons.push(poly);
              rerenderPolygon(poly.id);
            });
          }
          if (data.settings) {
            AppState.snapDistance = data.settings.snapDistance || 20;
          }
          updateStatusBar();
          console.log("File loaded successfully");
        } catch (error) {
          console.error("Error loading file:", error);
          alert("Fejl ved indl\xE6sning af fil");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }
  function exportSVG() {
    const svg = document.getElementById("canvas-svg");
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>
${svgString}`], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dimension-visualization-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    console.log("SVG exported successfully");
  }
  function exportPNG() {
    const svg = document.getElementById("canvas-svg");
    const svgString = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = svg.clientWidth || 1920;
      canvas.height = svg.clientHeight || 1080;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `dimension-visualization-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        URL.revokeObjectURL(pngUrl);
        console.log("PNG exported successfully");
      }, "image/png");
    };
    img.src = url;
  }
  window.exportGlobalState = function() {
    return {
      dimensions: AppState.dimensions.map((d) => d.toJSON()),
      markers: AppState.markers.map((m) => m.toJSON()),
      connections: AppState.connections.map((c) => c.toJSON()),
      intersections: AppState.intersections.map((i) => i.toJSON()),
      polygons: AppState.polygons.map((p) => p.toJSON()),
      settings: { snapDistance: AppState.snapDistance }
    };
  };
  window.importGlobalState = function(data) {
    if (!data) return;
    try {
      canvasManager.clear();
      AppState.dimensions = [];
      AppState.markers = [];
      AppState.connections = [];
      AppState.intersections = [];
      AppState.polygons = [];
      if (data.dimensions) data.dimensions.forEach((dimData) => {
        const dim = Dimension.fromJSON(dimData);
        AppState.dimensions.push(dim);
        canvasManager.renderDimension(dim);
      });
      if (data.markers) data.markers.forEach((markerData) => {
        const marker = Marker.fromJSON(markerData);
        AppState.markers.push(marker);
        const dim = AppState.dimensions.find((d) => d.id === marker.dimensionId);
        if (dim) canvasManager.renderMarker(marker, dim);
      });
      if (data.connections) data.connections.forEach((connData) => {
        const conn = Connection.fromJSON(connData);
        AppState.connections.push(conn);
        rerenderConnection(conn.id);
      });
      if (data.intersections) data.intersections.forEach((intData) => {
        const intersection = Intersection.fromJSON(intData);
        AppState.intersections.push(intersection);
        rerenderIntersection(intersection.id);
      });
      if (data.polygons) data.polygons.forEach((polyData) => {
        const poly = Polygon.fromJSON(polyData);
        AppState.polygons.push(poly);
        rerenderPolygon(poly.id);
      });
      if (data.settings) AppState.snapDistance = data.settings.snapDistance || 20;
      updateStatusBar();
    } catch (err) {
      console.error("importGlobalState parse error", err);
    }
  };
  document.addEventListener("DOMContentLoaded", init);
  window.AppState = AppState;
  window.canvasManager = canvasManager;
  window.interactionManager = interactionManager;
  window.snapManager = snapManager;
  window.polygonManager = polygonManager;
})();
