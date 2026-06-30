/**
 * InteractionManager
 * Handles all user interactions: drag, rotate, select
 */

export class InteractionManager {
    constructor(svgElement, canvasManager, appState) {
        this.svg = svgElement;
        this.canvasManager = canvasManager;
        this.appState = appState;

        // Drag state
        this.isDragging = false;
        this.dragType = null; // 'dimension', 'marker', 'rotate'
        this.dragTarget = null; // ID of element being dragged
        this.dragStart = { x: 0, y: 0 };
        this.dragOffset = { x: 0, y: 0 };
        this.isPanning = false;
        this.panStartClient = { x: 0, y: 0 };
        this.didPan = false;
        this.panThreshold = 3;

        // Rotation state
        this.rotationPivot = null; // Pivot point for endpoint rotation
        this.rotationEndpointType = null; // 'start' or 'end'

        // Callbacks
        this.onDimensionMoved = null;
        this.onMarkerMoved = null;
        this.onDimensionRotated = null;
        this.snapManager = null; // Will be set externally

        this.setupEventListeners();
    }

    /**
     * Setup event listeners for interactions
     */
    setupEventListeners() {
        // Mouse events
        this.svg.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.svg.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.svg.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.svg.addEventListener('mouseleave', this.handleMouseUp.bind(this));

        // Touch events for mobile
        this.svg.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.svg.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.svg.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    /**
     * Handle mouse down event
     */
    handleMouseDown(e) {
        // Only handle left mouse button
        if (e.button !== 0) return;

        const target = e.target;
        const point = this.getSVGPoint(e.clientX, e.clientY);

        // Check what was clicked
        const rotationHandle = target.closest('.rotation-handle');
        const dimensionEndpoint = target.closest('.dimension-endpoint');
        const dimensionLine = target.closest('.dimension-line');
        const marker = target.closest('.marker');
        const clickedInteractiveElement = rotationHandle || dimensionEndpoint || dimensionLine || marker;

        if (!clickedInteractiveElement) {
            if (this.appState.mode === 'select') {
                this.startPan(e.clientX, e.clientY);
                e.preventDefault();
            }
            return;
        }

        // Don't handle object manipulation outside select mode
        if (this.appState.mode !== 'select') return;

        if (rotationHandle) {
            // Rotation handle clicked (legacy - keeping for backwards compatibility)
            const dimensionId = rotationHandle.getAttribute('data-dimension-id');
            this.startRotation(dimensionId, point);
            e.preventDefault();
        } else if (dimensionEndpoint) {
            // Dimension endpoint clicked - rotate around opposite endpoint
            const dimensionId = dimensionEndpoint.getAttribute('data-dimension-id');
            const endpointType = dimensionEndpoint.getAttribute('data-endpoint'); // 'start' or 'end'
            this.startRotationFromEndpoint(dimensionId, endpointType, point);
            e.preventDefault();
        } else if (marker) {
            // Marker clicked
            const markerId = marker.getAttribute('data-marker-id');
            this.startDragMarker(markerId, point);
            e.preventDefault();
        } else if (dimensionLine) {
            // Dimension line clicked
            const dimensionId = dimensionLine.getAttribute('data-dimension-id');
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

        if (this.dragType === 'dimension') {
            this.updateDragDimension(point);
        } else if (this.dragType === 'marker') {
            this.updateDragMarker(point);
        } else if (this.dragType === 'rotate') {
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

        if (this.dragType === 'dimension') {
            this.endDragDimension(point);
        } else if (this.dragType === 'marker') {
            this.endDragMarker(point);
        } else if (this.dragType === 'rotate') {
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
        const mouseEvent = new MouseEvent('mousedown', {
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
        const mouseEvent = new MouseEvent('mousemove', {
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
        const mouseEvent = new MouseEvent('mouseup', {
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
        this.svg.style.cursor = 'grabbing';
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
        this.svg.style.cursor = this.appState.mode === 'select' ? 'grab' : 'default';
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
        const dimension = this.appState.dimensions.find(d => d.id === dimensionId);
        if (!dimension) return;

        this.isDragging = true;
        this.dragType = 'dimension';
        this.dragTarget = dimensionId;
        this.dragStart = { ...point };
        this.dragOffset = {
            x: point.x - dimension.position.x,
            y: point.y - dimension.position.y
        };

        this.svg.style.cursor = 'grabbing';
    }

    /**
     * Get all dimensions connected to a dimension through snaps
     */
    getConnectedDimensions(dimensionId, visited = new Set()) {
        if (visited.has(dimensionId)) return [];
        visited.add(dimensionId);

        const connected = [dimensionId];

        if (!this.snapManager) return connected;

        // Get snap info for this dimension
        const snapInfo = this.snapManager.getSnapInfo(dimensionId);

        // Check start endpoint snap
        if (snapInfo.start) {
            const targetDimId = snapInfo.start.targetDimensionId;
            if (!visited.has(targetDimId)) {
                connected.push(...this.getConnectedDimensions(targetDimId, visited));
            }
        }

        // Check end endpoint snap
        if (snapInfo.end) {
            const targetDimId = snapInfo.end.targetDimensionId;
            if (!visited.has(targetDimId)) {
                connected.push(...this.getConnectedDimensions(targetDimId, visited));
            }
        }

        // Also check if other dimensions are snapped TO this dimension
        for (const dim of this.appState.dimensions) {
            if (visited.has(dim.id)) continue;

            const otherSnapInfo = this.snapManager.getSnapInfo(dim.id);
            if (otherSnapInfo.start?.targetDimensionId === dimensionId ||
                otherSnapInfo.end?.targetDimensionId === dimensionId) {
                connected.push(...this.getConnectedDimensions(dim.id, visited));
            }
        }

        return connected;
    }

    /**
     * Update dimension drag
     */
    updateDragDimension(point) {
        const dimension = this.appState.dimensions.find(d => d.id === this.dragTarget);
        if (!dimension) return;

        // Calculate movement offset
        const newX = point.x - this.dragOffset.x;
        const newY = point.y - this.dragOffset.y;
        const deltaX = newX - dimension.position.x;
        const deltaY = newY - dimension.position.y;

        // Get all connected dimensions (including this one)
        const connectedDimIds = this.getConnectedDimensions(dimension.id);

        // Move all connected dimensions together
        connectedDimIds.forEach(dimId => {
            const dim = this.appState.dimensions.find(d => d.id === dimId);
            if (!dim) return;

            dim.position.x += deltaX;
            dim.position.y += deltaY;

            // Re-render dimension
            this.canvasManager.renderDimension(dim);
            if (dim.id === dimension.id) {
                this.canvasManager.updateRotationHandles(dim);
            }

            // Re-render markers on this dimension
            const markers = this.appState.markers.filter(m => m.dimensionId === dim.id);
            markers.forEach(marker => {
                this.canvasManager.renderMarker(marker, dim);

                // Re-render connections involving this marker
                const connections = this.appState.connections.filter(c => c.hasMarker(marker.id));
                connections.forEach(conn => {
                    const marker1 = this.appState.markers.find(m => m.id === conn.marker1Id);
                    const marker2 = this.appState.markers.find(m => m.id === conn.marker2Id);
                    const dim1 = this.appState.dimensions.find(d => d.id === marker1?.dimensionId);
                    const dim2 = this.appState.dimensions.find(d => d.id === marker2?.dimensionId);
                    if (marker1 && marker2 && dim1 && dim2) {
                        this.canvasManager.renderConnection(conn, marker1, marker2, dim1, dim2);
                    }
                });
            });
        });

        // Update snap points for all moved dimensions
        if (this.snapManager) {
            connectedDimIds.forEach(dimId => {
                const dim = this.appState.dimensions.find(d => d.id === dimId);
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

            // Check for new snaps only for the dragged dimension
            this.snapManager.checkSnap(dimension, this.canvasManager);
        }
    }

    /**
     * End dimension drag
     */
    endDragDimension(point) {
        const dimension = this.appState.dimensions.find(d => d.id === this.dragTarget);
        if (!dimension) return;

        // Apply snap if available
        if (this.snapManager) {
            this.snapManager.applySnap(dimension, this.appState.dimensions, this.canvasManager);
        }

        // Callback
        if (this.onDimensionMoved) {
            this.onDimensionMoved(dimension);
        }

        this.svg.style.cursor = 'default';
        this.canvasManager.hideSnapIndicator();
    }

    /**
     * Start dragging a marker
     */
    startDragMarker(markerId, point) {
        const marker = this.appState.markers.find(m => m.id === markerId);
        if (!marker) return;

        this.isDragging = true;
        this.dragType = 'marker';
        this.dragTarget = markerId;
        this.dragStart = { ...point };

        this.svg.style.cursor = 'grabbing';
    }

    /**
     * Update marker drag
     */
    updateDragMarker(point) {
        const marker = this.appState.markers.find(m => m.id === this.dragTarget);
        if (!marker) return;

        const dimension = this.appState.dimensions.find(d => d.id === marker.dimensionId);
        if (!dimension) return;

        // Get closest point on dimension line
        const closestPoint = dimension.getClosestPointOnLine(point);
        marker.value = closestPoint.value;

        // Re-render marker
        this.canvasManager.renderMarker(marker, dimension);

        // Re-render all connections involving this marker
        const connections = this.appState.connections.filter(c => c.hasMarker(marker.id));
        connections.forEach(conn => {
            const marker1 = this.appState.markers.find(m => m.id === conn.marker1Id);
            const marker2 = this.appState.markers.find(m => m.id === conn.marker2Id);
            const dim1 = this.appState.dimensions.find(d => d.id === marker1?.dimensionId);
            const dim2 = this.appState.dimensions.find(d => d.id === marker2?.dimensionId);
            if (marker1 && marker2 && dim1 && dim2) {
                this.canvasManager.renderConnection(conn, marker1, marker2, dim1, dim2);
            }
        });
    }

    /**
     * End marker drag
     */
    endDragMarker(point) {
        const marker = this.appState.markers.find(m => m.id === this.dragTarget);
        if (!marker) return;

        // Callback
        if (this.onMarkerMoved) {
            this.onMarkerMoved(marker);
        }

        this.svg.style.cursor = 'default';
    }

    /**
     * Start rotation from endpoint (rotate around opposite endpoint)
     */
    startRotationFromEndpoint(dimensionId, endpointType, point) {
        const dimension = this.appState.dimensions.find(d => d.id === dimensionId);
        if (!dimension) return;

        // Get endpoints
        const endpoints = dimension.getEndpoints();

        // Determine pivot point (opposite endpoint)
        this.rotationPivot = endpointType === 'start' ? endpoints.end : endpoints.start;
        this.rotationEndpointType = endpointType;

        this.isDragging = true;
        this.dragType = 'rotate';
        this.dragTarget = dimensionId;
        this.dragStart = { ...point };

        this.svg.style.cursor = 'grabbing';
    }

    /**
     * Start rotation (legacy method - rotates around center)
     */
    startRotation(dimensionId, point) {
        const dimension = this.appState.dimensions.find(d => d.id === dimensionId);
        if (!dimension) return;

        this.isDragging = true;
        this.dragType = 'rotate';
        this.dragTarget = dimensionId;
        this.dragStart = { ...point };
        this.rotationPivot = null; // No pivot = rotate around center

        this.svg.style.cursor = 'grabbing';
    }

    /**
     * Snap angle to 5-degree increments
     */
    snapAngleToGrid(angle) {
        const increment = 5; // degrees
        return Math.round(angle / increment) * increment;
    }

    /**
     * Update rotation
     */
    updateRotation(point) {
        const dimension = this.appState.dimensions.find(d => d.id === this.dragTarget);
        if (!dimension) return;

        if (this.rotationPivot) {
            // Rotate around a fixed pivot point (endpoint rotation)
            const pivot = this.rotationPivot;

            // Calculate angle from pivot to current mouse position
            const dx = point.x - pivot.x;
            const dy = point.y - pivot.y;
            let angle = Math.atan2(dy, dx) * (180 / Math.PI);

            // Snap to 5-degree increments
            angle = this.snapAngleToGrid(angle);

            // Calculate new center position so that the pivot endpoint stays fixed
            const halfLength = dimension.length / 2;

            // The pivot should be at one end, so calculate center position
            if (this.rotationEndpointType === 'start') {
                // We're dragging the start endpoint, pivot is at end
                // The angle from pivot (end) to mouse gives the direction of the line from end to start
                // But dimension.rotation is defined as the angle from start to end
                // So dimension.rotation should be angle + 180
                dimension.rotation = this.snapAngleToGrid(angle + 180);

                // Center is halfway between pivot (end) and mouse (start)
                // From pivot, go in the angle direction by halfLength to get center
                const centerAngle = angle * Math.PI / 180;
                dimension.position.x = pivot.x + Math.cos(centerAngle) * halfLength;
                dimension.position.y = pivot.y + Math.sin(centerAngle) * halfLength;
            } else {
                // We're dragging the end endpoint, pivot is at start
                // The angle from pivot (start) to mouse gives the direction from start to end
                // This is exactly what dimension.rotation should be
                dimension.rotation = angle;

                // Center is halfway between pivot (start) and mouse (end)
                const centerAngle = angle * Math.PI / 180;
                dimension.position.x = pivot.x + Math.cos(centerAngle) * halfLength;
                dimension.position.y = pivot.y + Math.sin(centerAngle) * halfLength;
            }

        } else {
            // Legacy rotation around center
            const dx = point.x - dimension.position.x;
            const dy = point.y - dimension.position.y;
            let angle = Math.atan2(dy, dx) * (180 / Math.PI);

            // Snap to 5-degree increments
            angle = this.snapAngleToGrid(angle);

            dimension.rotation = angle;
        }

        // Re-render dimension
        this.canvasManager.renderDimension(dimension);
        this.canvasManager.updateRotationHandles(dimension);

        // Re-render markers on this dimension
        const markers = this.appState.markers.filter(m => m.dimensionId === dimension.id);
        markers.forEach(marker => {
            this.canvasManager.renderMarker(marker, dimension);

            // Re-render connections involving this marker
            const connections = this.appState.connections.filter(c => c.hasMarker(marker.id));
            connections.forEach(conn => {
                const marker1 = this.appState.markers.find(m => m.id === conn.marker1Id);
                const marker2 = this.appState.markers.find(m => m.id === conn.marker2Id);
                const dim1 = this.appState.dimensions.find(d => d.id === marker1?.dimensionId);
                const dim2 = this.appState.dimensions.find(d => d.id === marker2?.dimensionId);
                if (marker1 && marker2 && dim1 && dim2) {
                    this.canvasManager.renderConnection(conn, marker1, marker2, dim1, dim2);
                }
            });
        });

        // Maintain snap if snap manager is available
        if (this.snapManager) {
            this.snapManager.maintainSnap(dimension, this.appState.dimensions, this.canvasManager);
        }
    }

    /**
     * End rotation
     */
    endRotation(point) {
        const dimension = this.appState.dimensions.find(d => d.id === this.dragTarget);
        if (!dimension) return;

        // Callback
        if (this.onDimensionRotated) {
            this.onDimensionRotated(dimension);
        }

        // Clear rotation pivot
        this.rotationPivot = null;
        this.rotationEndpointType = null;

        this.svg.style.cursor = 'default';
    }

    /**
     * Enable interactions
     */
    enable() {
        this.svg.style.pointerEvents = 'auto';
        this.svg.style.cursor = this.appState.mode === 'select' ? 'grab' : 'default';
    }

    /**
     * Disable interactions
     */
    disable() {
        this.svg.style.pointerEvents = 'none';
        this.isDragging = false;
        this.isPanning = false;
    }
}
