/**
 * SnapManager
 * Handles magnetic endpoint snapping between dimensions
 */

export class SnapManager {
    constructor(snapDistance = 20) {
        this.snapDistance = snapDistance;
        this.snappedPairs = new Map(); // Maps "dimensionId-endpoint" to {targetDimensionId, targetEndpoint, point}
        this.tempSnapTarget = null; // Temporary snap target during drag
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

            // Check start endpoint
            const distStart = this.distance(endpoint, endpoints.start);
            if (distStart < minDistance) {
                minDistance = distStart;
                closestTarget = {
                    dimensionId: dim.id,
                    endpoint: 'start',
                    point: endpoints.start,
                    distance: distStart
                };
            }

            // Check end endpoint
            const distEnd = this.distance(endpoint, endpoints.end);
            if (distEnd < minDistance) {
                minDistance = distEnd;
                closestTarget = {
                    dimensionId: dim.id,
                    endpoint: 'end',
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
    checkSnap(dimension, canvasManager) {
        const endpoints = dimension.getEndpoints();

        // Check start endpoint
        const startTarget = this.findSnapTarget(endpoints.start, dimension.id,
            canvasManager.svg.ownerDocument.defaultView.AppState.dimensions, 'start');

        // Check end endpoint
        const endTarget = this.findSnapTarget(endpoints.end, dimension.id,
            canvasManager.svg.ownerDocument.defaultView.AppState.dimensions, 'end');

        // Choose closest
        let target = null;
        if (startTarget && endTarget) {
            target = startTarget.distance < endTarget.distance ? startTarget : endTarget;
        } else {
            target = startTarget || endTarget;
        }

        if (target) {
            // Show snap indicator
            canvasManager.showSnapIndicator(target.point);
            this.tempSnapTarget = target;
        } else {
            // Hide snap indicator
            canvasManager.hideSnapIndicator();
            this.tempSnapTarget = null;
        }
    }

    /**
     * Apply snap after drag ends
     */
    applySnap(dimension, allDimensions, canvasManager) {
        if (!this.tempSnapTarget) {
            canvasManager.hideSnapIndicator();
            return;
        }

        const target = this.tempSnapTarget;
        const endpoints = dimension.getEndpoints();

        // Determine which endpoint to snap
        const distStart = this.distance(endpoints.start, target.point);
        const distEnd = this.distance(endpoints.end, target.point);
        const snapEndpoint = distStart < distEnd ? 'start' : 'end';

        // Calculate offset needed to snap
        const currentEndpoint = snapEndpoint === 'start' ? endpoints.start : endpoints.end;
        const offset = {
            x: target.point.x - currentEndpoint.x,
            y: target.point.y - currentEndpoint.y
        };

        // Move dimension
        dimension.position.x += offset.x;
        dimension.position.y += offset.y;

        // Record the snap
        const key = `${dimension.id}-${snapEndpoint}`;
        this.snappedPairs.set(key, {
            targetDimensionId: target.dimensionId,
            targetEndpoint: target.endpoint,
            point: { ...target.point }
        });

        console.log(`Snapped ${dimension.id} ${snapEndpoint} to ${target.dimensionId} ${target.endpoint}`);

        // Re-render
        canvasManager.renderDimension(dimension);
        canvasManager.updateRotationHandles(dimension);

        // Re-render markers
        const markers = window.AppState.markers.filter(m => m.dimensionId === dimension.id);
        markers.forEach(marker => {
            canvasManager.renderMarker(marker, dimension);
        });

        canvasManager.hideSnapIndicator();
        this.tempSnapTarget = null;
    }

    /**
     * Maintain snap during rotation
     */
    maintainSnap(dimension, allDimensions, canvasManager) {
        // Check if this dimension has any snapped endpoints
        const startSnap = this.snappedPairs.get(`${dimension.id}-start`);
        const endSnap = this.snappedPairs.get(`${dimension.id}-end`);

        if (!startSnap && !endSnap) return;

        // Get current endpoints
        const endpoints = dimension.getEndpoints();

        // Choose which endpoint to maintain (prefer start if both are snapped)
        const snapToMaintain = startSnap || endSnap;
        const endpointType = startSnap ? 'start' : 'end';
        const currentEndpoint = endpointType === 'start' ? endpoints.start : endpoints.end;

        // Find target dimension
        const targetDim = allDimensions.find(d => d.id === snapToMaintain.targetDimensionId);
        if (!targetDim) {
            // Target dimension no longer exists, remove snap
            this.snappedPairs.delete(`${dimension.id}-${endpointType}`);
            return;
        }

        // Get target endpoint position
        const targetEndpoints = targetDim.getEndpoints();
        const targetPoint = snapToMaintain.targetEndpoint === 'start'
            ? targetEndpoints.start
            : targetEndpoints.end;

        // Calculate offset needed to maintain snap
        const offset = {
            x: targetPoint.x - currentEndpoint.x,
            y: targetPoint.y - currentEndpoint.y
        };

        // Only apply if offset is significant (prevents jitter)
        const offsetDist = Math.sqrt(offset.x * offset.x + offset.y * offset.y);
        if (offsetDist > 0.5) {
            dimension.position.x += offset.x;
            dimension.position.y += offset.y;

            // Update snap point
            snapToMaintain.point = { ...targetPoint };

            // Re-render
            canvasManager.renderDimension(dimension);
            canvasManager.updateRotationHandles(dimension);

            // Re-render markers
            const markers = window.AppState.markers.filter(m => m.dimensionId === dimension.id);
            markers.forEach(marker => {
                canvasManager.renderMarker(marker, dimension);
            });
        }
    }

    /**
     * Remove snap for a dimension
     */
    removeSnap(dimensionId) {
        // Remove this dimension's snaps
        this.snappedPairs.delete(`${dimensionId}-start`);
        this.snappedPairs.delete(`${dimensionId}-end`);

        // Remove snaps from other dimensions that point to this dimension
        const keysToDelete = [];
        for (const [key, snapInfo] of this.snappedPairs.entries()) {
            if (snapInfo.targetDimensionId === dimensionId) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.snappedPairs.delete(key));
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
        return this.snappedPairs.has(`${dimensionId}-start`) ||
               this.snappedPairs.has(`${dimensionId}-end`);
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
}
