/**
 * CanvasManager
 * Manages SVG rendering for all elements (dimensions, markers, connections, polygons)
 */

export class CanvasManager {
    constructor(svgElement) {
        this.svg = svgElement;
        this.dimensionsLayer = svgElement.querySelector('#dimensions-layer');
        this.markersLayer = svgElement.querySelector('#markers-layer');
        this.connectionsLayer = svgElement.querySelector('#connections-layer');
        this.intersectionsLayer = svgElement.querySelector('#intersections-layer');
        this.polygonsLayer = svgElement.querySelector('#polygons-layer');
        this.handlesLayer = svgElement.querySelector('#handles-layer');

        // Store references to SVG elements
        this.dimensionElements = new Map(); // dimensionId -> group element
        this.markerElements = new Map(); // markerId -> circle element
        this.connectionElements = new Map(); // connectionId -> line element
        this.intersectionElements = new Map(); // intersectionId -> group element
        this.polygonElements = new Map(); // polygonId -> polygon element
        this.handleElements = new Map(); // dimensionId -> handle elements

        // State
        this.selectedElement = null;
        this.selectedType = null; // 'dimension', 'marker', 'connection', 'intersection', 'polygon'
        this.viewport = null;
        this.zoomLevel = 1;
        this.minZoom = 0.25;
        this.maxZoom = 4;

        this.initializeViewport();
    }

    initializeViewport() {
        const rect = this.svg.getBoundingClientRect();
        const width = rect.width || this.svg.clientWidth || 1000;
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
        this.svg.setAttribute(
            'viewBox',
            `${this.viewport.x} ${this.viewport.y} ${this.viewport.width} ${this.viewport.height}`
        );
    }

    clientToWorld(clientX, clientY) {
        const rect = this.svg.getBoundingClientRect();
        if (!rect.width || !rect.height || !this.viewport) {
            return { x: clientX, y: clientY };
        }

        return {
            x: this.viewport.x + ((clientX - rect.left) / rect.width) * this.viewport.width,
            y: this.viewport.y + ((clientY - rect.top) / rect.height) * this.viewport.height
        };
    }

    zoomAtPoint(clientX, clientY, zoomDelta) {
        if (!this.viewport) return false;

        const nextZoom = Math.min(this.maxZoom, Math.max(this.minZoom, this.zoomLevel * zoomDelta));
        if (Math.abs(nextZoom - this.zoomLevel) < 0.0001) return false;

        const rect = this.svg.getBoundingClientRect();
        if (!rect.width || !rect.height) return false;

        const focus = this.clientToWorld(clientX, clientY);
        const ratioX = (clientX - rect.left) / rect.width;
        const ratioY = (clientY - rect.top) / rect.height;
        const centerX = this.viewport.x + this.viewport.width / 2;
        const centerY = this.viewport.y + this.viewport.height / 2;

        this.zoomLevel = nextZoom;
        this.viewport.width = rect.width / this.zoomLevel;
        this.viewport.height = rect.height / this.zoomLevel;
        this.viewport.x = focus.x - ratioX * this.viewport.width;
        this.viewport.y = focus.y - ratioY * this.viewport.height;

        this.updateViewBox();
        return {
            zoomLevel: this.zoomLevel,
            centerX,
            centerY
        };
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
        // Check if dimension already has an element
        let group = this.dimensionElements.get(dimension.id);

        if (!group) {
            // Create new group for dimension
            group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('data-dimension-id', dimension.id);
            group.classList.add('dimension-group');
            this.dimensionsLayer.appendChild(group);
            this.dimensionElements.set(dimension.id, group);
        } else {
            // Clear existing content
            group.innerHTML = '';
        }

        const endpoints = dimension.getEndpoints();

        // Create invisible hit area (thick line for easier clicking)
        const hitArea = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        hitArea.setAttribute('x1', endpoints.start.x);
        hitArea.setAttribute('y1', endpoints.start.y);
        hitArea.setAttribute('x2', endpoints.end.x);
        hitArea.setAttribute('y2', endpoints.end.y);
        hitArea.setAttribute('stroke', 'transparent');
        hitArea.setAttribute('stroke-width', '20'); // Much thicker for easier clicking
        hitArea.classList.add('dimension-line');
        hitArea.setAttribute('data-dimension-id', dimension.id);
        hitArea.style.cursor = 'move';
        group.appendChild(hitArea);

        // Create visible dimension line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', endpoints.start.x);
        line.setAttribute('y1', endpoints.start.y);
        line.setAttribute('x2', endpoints.end.x);
        line.setAttribute('y2', endpoints.end.y);
        line.classList.add('dimension-line-visible');
        line.setAttribute('stroke', '#333');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('fill', 'none');
        line.style.pointerEvents = 'none'; // Visual only, hit area handles clicks
        group.appendChild(line);

        // Create endpoint markers
        const startCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        startCircle.setAttribute('cx', endpoints.start.x);
        startCircle.setAttribute('cy', endpoints.start.y);
        startCircle.setAttribute('r', '5');
        startCircle.classList.add('dimension-endpoint');
        startCircle.setAttribute('data-dimension-id', dimension.id);
        startCircle.setAttribute('data-endpoint', 'start');
        group.appendChild(startCircle);

        const endCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        endCircle.setAttribute('cx', endpoints.end.x);
        endCircle.setAttribute('cy', endpoints.end.y);
        endCircle.setAttribute('r', '5');
        endCircle.classList.add('dimension-endpoint');
        endCircle.setAttribute('data-dimension-id', dimension.id);
        endCircle.setAttribute('data-endpoint', 'end');
        group.appendChild(endCircle);

        // Create label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', dimension.position.x);
        label.setAttribute('y', dimension.position.y - 15);
        label.setAttribute('text-anchor', 'middle');
        label.classList.add('dimension-label');
        label.textContent = dimension.label;
        group.appendChild(label);

        // Create scale text (min and max values)
        const minText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        minText.setAttribute('x', endpoints.start.x);
        minText.setAttribute('y', endpoints.start.y + 20);
        minText.setAttribute('text-anchor', 'middle');
        minText.classList.add('dimension-scale-text');
        minText.textContent = dimension.minValue;
        group.appendChild(minText);

        const maxText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        maxText.setAttribute('x', endpoints.end.x);
        maxText.setAttribute('y', endpoints.end.y + 20);
        maxText.setAttribute('text-anchor', 'middle');
        maxText.classList.add('dimension-scale-text');
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

        // Check if marker already has an element
        let group = this.markerElements.get(marker.id);

        if (!group) {
            // Create new group for marker
            group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('data-marker-id', marker.id);
            group.classList.add('marker-group');
            this.markersLayer.appendChild(group);
            this.markerElements.set(marker.id, group);
        } else {
            // Clear existing content
            group.innerHTML = '';
        }

        // Create invisible hit area for easier clicking
        const hitArea = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        hitArea.setAttribute('cx', position.x);
        hitArea.setAttribute('cy', position.y);
        hitArea.setAttribute('r', Math.max(marker.radius + 8, 16)); // Larger hit area
        hitArea.setAttribute('fill', 'transparent');
        hitArea.classList.add('marker');
        hitArea.setAttribute('data-marker-id', marker.id);
        hitArea.style.cursor = 'move';
        group.appendChild(hitArea);

        // Create visible marker circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', position.x);
        circle.setAttribute('cy', position.y);
        circle.setAttribute('r', marker.radius);
        circle.setAttribute('fill', marker.color);
        circle.setAttribute('stroke', 'white');
        circle.setAttribute('stroke-width', '2');
        circle.classList.add('marker-visible');
        circle.style.pointerEvents = 'none'; // Visual only
        group.appendChild(circle);

        // Create marker label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', position.x);
        label.setAttribute('y', position.y - marker.radius - 5);
        label.setAttribute('text-anchor', 'middle');
        label.classList.add('marker-label');
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

        // Check if connection already has an element
        let line = this.connectionElements.get(connection.id);

        if (!line) {
            // Create new line
            line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('data-connection-id', connection.id);
            line.classList.add('connection');
            this.connectionsLayer.appendChild(line);
            this.connectionElements.set(connection.id, line);
        }

        // Update line attributes
        line.setAttribute('x1', pos1.x);
        line.setAttribute('y1', pos1.y);
        line.setAttribute('x2', pos2.x);
        line.setAttribute('y2', pos2.y);
        line.setAttribute('stroke', connection.color);
        line.setAttribute('stroke-width', connection.width);

        // Update style class
        line.classList.remove('solid', 'dashed');
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
        // Calculate intersection point of the orthogonal lines
        const mathPoint = this.calculateOrthogonalIntersection(marker1, marker2, dim1, dim2);

        // If lines are parallel or overlap, they might not intersect gracefully, 
        // calculateOrthogonalIntersection should handle that by returning null.
        if (!mathPoint) {
            this.removeIntersection(intersection.id);
            return;
        }

        const pos1 = marker1.getAbsolutePosition(dim1);
        const pos2 = marker2.getAbsolutePosition(dim2);

        let group = this.intersectionElements.get(intersection.id);

        if (!group) {
            group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('data-intersection-id', intersection.id);
            group.classList.add('intersection-group');
            this.intersectionsLayer.appendChild(group);
            this.intersectionElements.set(intersection.id, group);
        } else {
            group.innerHTML = '';
        }

        // Draw dashed line from marker 1 to intersection
        const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line1.setAttribute('x1', pos1.x);
        line1.setAttribute('y1', pos1.y);
        line1.setAttribute('x2', mathPoint.x);
        line1.setAttribute('y2', mathPoint.y);
        line1.setAttribute('stroke', intersection.lineColor);
        line1.setAttribute('stroke-width', intersection.lineWidth);
        if (intersection.lineStyle === 'dashed') {
            line1.setAttribute('stroke-dasharray', '5,5');
        }
        line1.style.pointerEvents = 'none';
        group.appendChild(line1);

        // Draw dashed line from marker 2 to intersection
        const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line2.setAttribute('x1', pos2.x);
        line2.setAttribute('y1', pos2.y);
        line2.setAttribute('x2', mathPoint.x);
        line2.setAttribute('y2', mathPoint.y);
        line2.setAttribute('stroke', intersection.lineColor);
        line2.setAttribute('stroke-width', intersection.lineWidth);
        if (intersection.lineStyle === 'dashed') {
            line2.setAttribute('stroke-dasharray', '5,5');
        }
        line2.style.pointerEvents = 'none';
        group.appendChild(line2);

        // Create invisible hit area for the point itself
        const hitArea = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        hitArea.setAttribute('cx', mathPoint.x);
        hitArea.setAttribute('cy', mathPoint.y);
        hitArea.setAttribute('r', Math.max(intersection.pointRadius + 10, 16));
        hitArea.setAttribute('fill', 'transparent');
        hitArea.classList.add('intersection');
        hitArea.setAttribute('data-intersection-id', intersection.id);
        hitArea.style.cursor = 'pointer';
        group.appendChild(hitArea);

        // Draw point
        const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        point.setAttribute('cx', mathPoint.x);
        point.setAttribute('cy', mathPoint.y);
        point.setAttribute('r', intersection.pointRadius);
        point.setAttribute('fill', intersection.pointColor);
        point.classList.add('intersection-visible');
        point.style.pointerEvents = 'none';
        group.appendChild(point);
    }

    /**
     * Calculates intersection point of two lines orthogonal to dim1 and dim2 passing through marker1 and marker2 respectively.
     */
    calculateOrthogonalIntersection(marker1, marker2, dim1, dim2) {
        const p1 = marker1.getAbsolutePosition(dim1);
        const p2 = marker2.getAbsolutePosition(dim2);

        // Direction vectors for dimensions
        const d1_endpts = dim1.getEndpoints();
        const v1x = d1_endpts.end.x - d1_endpts.start.x;
        const v1y = d1_endpts.end.y - d1_endpts.start.y;

        const d2_endpts = dim2.getEndpoints();
        const v2x = d2_endpts.end.x - d2_endpts.start.x;
        const v2y = d2_endpts.end.y - d2_endpts.start.y;

        // Orthogonal vectors
        const orth1x = -v1y;
        const orth1y = v1x;

        const orth2x = -v2y;
        const orth2y = v2x;

        // Line 1: p1 + t1 * orth1
        // Line 2: p2 + t2 * orth2
        // Intersection where p1x + t1*orth1x = p2x + t2*orth2x and p1y + t1*orth1y = p2y + t2*orth2y
        //
        // t1*orth1x - t2*orth2x = p2x - p1x
        // t1*orth1y - t2*orth2y = p2y - p1y
        // Using Cramer's rule
        const det = orth1x * (-orth2y) - orth1y * (-orth2x);

        // If lines are parallel
        if (Math.abs(det) < 1e-6) {
            return null;
        }

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;

        const t1 = (dx * (-orth2y) - dy * (-orth2x)) / det;

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
        // Get positions for all markers
        const points = markers.map((marker, index) => {
            const pos = marker.getAbsolutePosition(dimensions[index]);
            return `${pos.x},${pos.y}`;
        }).join(' ');

        // Check if polygon already has an element
        let polygonEl = this.polygonElements.get(polygon.id);

        if (!polygonEl) {
            // Create new polygon
            polygonEl = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygonEl.setAttribute('data-polygon-id', polygon.id);
            polygonEl.classList.add('polygon-fill');
            this.polygonsLayer.appendChild(polygonEl);
            this.polygonElements.set(polygon.id, polygonEl);
        }

        // Update polygon attributes
        polygonEl.setAttribute('points', points);
        polygonEl.setAttribute('fill', polygon.fillColor);
        polygonEl.setAttribute('fill-opacity', polygon.fillOpacity);
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

        // Remove handles if they exist
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
        // Remove selected class from all elements
        this.svg.querySelectorAll('.selected').forEach(el => {
            el.classList.remove('selected');
        });

        this.selectedElement = null;
        this.selectedType = null;

        // Hide all rotation handles
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

        // Add selected class to element
        let element;
        switch (type) {
            case 'dimension':
                element = this.dimensionElements.get(id);
                if (element) {
                    element.classList.add('selected');
                }
                break;
            case 'marker':
                element = this.markerElements.get(id);
                if (element) {
                    element.querySelector('.marker').classList.add('selected');
                }
                break;
            case 'connection':
                element = this.connectionElements.get(id);
                if (element) {
                    element.classList.add('selected');
                }
                break;
            case 'intersection':
                element = this.intersectionElements.get(id);
                if (element) {
                    const circle = element.querySelector('.intersection-visible');
                    if (circle) circle.classList.add('selected');
                }
                break;
            case 'polygon':
                element = this.polygonElements.get(id);
                if (element) {
                    element.classList.add('selected');
                }
                break;
        }
    }

    /**
     * Hide all rotation handles
     */
    hideAllHandles() {
        this.handlesLayer.innerHTML = '';
        this.handleElements.clear();
    }

    /**
     * Show rotation handles for a dimension
     * @param {Dimension} dimension - Dimension to show handles for
     */
    showRotationHandles(dimension) {
        this.hideAllHandles();

        const endpoints = dimension.getEndpoints();
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('data-dimension-id', dimension.id);

        // Create rotation handle at end point
        const handle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        handle.setAttribute('cx', endpoints.end.x);
        handle.setAttribute('cy', endpoints.end.y);
        handle.setAttribute('r', '10');
        handle.classList.add('rotation-handle');
        handle.setAttribute('data-dimension-id', dimension.id);
        group.appendChild(handle);

        // Create rotation line from center to handle
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', dimension.position.x);
        line.setAttribute('y1', dimension.position.y);
        line.setAttribute('x2', endpoints.end.x);
        line.setAttribute('y2', endpoints.end.y);
        line.classList.add('rotation-line');
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

        // Update handle position
        const handle = group.querySelector('.rotation-handle');
        if (handle) {
            handle.setAttribute('cx', endpoints.end.x);
            handle.setAttribute('cy', endpoints.end.y);
        }

        // Update rotation line
        const line = group.querySelector('.rotation-line');
        if (line) {
            line.setAttribute('x1', dimension.position.x);
            line.setAttribute('y1', dimension.position.y);
            line.setAttribute('x2', endpoints.end.x);
            line.setAttribute('y2', endpoints.end.y);
        }
    }

    /**
     * Show snap indicator at a position
     * @param {Object} position - { x, y } position to show indicator
     */
    showSnapIndicator(position) {
        const indicator = this.svg.querySelector('#snap-indicator');
        if (indicator) {
            indicator.setAttribute('cx', position.x);
            indicator.setAttribute('cy', position.y);
            indicator.style.display = 'block';
        }
    }

    /**
     * Hide snap indicator
     */
    hideSnapIndicator() {
        const indicator = this.svg.querySelector('#snap-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    /**
     * Clear entire canvas
     */
    clear() {
        this.dimensionsLayer.innerHTML = '';
        this.markersLayer.innerHTML = '';
        this.connectionsLayer.innerHTML = '';
        this.intersectionsLayer.innerHTML = '';
        this.polygonsLayer.innerHTML = '';
        this.handlesLayer.innerHTML = '';

        this.dimensionElements.clear();
        this.markerElements.clear();
        this.connectionElements.clear();
        this.intersectionElements.clear();
        this.polygonElements.clear();
        this.handleElements.clear();

        this.selectedElement = null;
        this.selectedType = null;
    }
}
