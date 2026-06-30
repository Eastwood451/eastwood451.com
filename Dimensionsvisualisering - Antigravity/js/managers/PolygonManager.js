/**
 * PolygonManager
 * Detects and manages polygons formed by connected markers
 */

import { Polygon } from '../models/Polygon.js';

export class PolygonManager {
    constructor(appState, canvasManager) {
        this.appState = appState;
        this.canvasManager = canvasManager;
    }

    /**
     * Detect all polygons from connections
     * @returns {Array} Array of detected polygons
     */
    detectPolygons() {
        const { connections, markers } = this.appState;

        if (connections.length < 3) {
            return []; // Need at least 3 connections to form a polygon
        }

        // Build adjacency graph
        const graph = new Map();

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

        // Find all simple cycles
        const cycles = this.findAllCycles(graph);

        // Convert cycles to polygons
        const polygons = cycles.map(cycle => {
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
        const visited = new Set();

        // Try starting from each node
        for (const startNode of graph.keys()) {
            if (visited.has(startNode)) continue;

            const localCycles = this.findCyclesFromNode(graph, startNode, visited);
            cycles.push(...localCycles);
        }

        // Remove duplicate cycles
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
        const stack = [[startNode, [startNode], new Set([startNode])]];
        const maxDepth = 10; // Limit cycle depth to avoid infinite loops

        while (stack.length > 0) {
            const [node, path, localVisited] = stack.pop();
            const neighbors = graph.get(node) || [];

            for (const neighbor of neighbors) {
                // Check if we've completed a cycle
                if (neighbor === startNode && path.length >= 3) {
                    cycles.push([...path]);
                    globalVisited.add(...path);
                }
                // Continue exploring if not yet visited in this path
                else if (!localVisited.has(neighbor) && path.length < maxDepth) {
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
        const seen = new Set();

        for (const cycle of cycles) {
            // Create a normalized representation (sorted node IDs)
            const sorted = [...cycle].sort().join(',');

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

        // Get marker positions
        const positions = markerIds.map(id => {
            const marker = markers.find(m => m.id === id);
            if (!marker) return null;

            const dimension = dimensions.find(d => d.id === marker.dimensionId);
            if (!dimension) return null;

            const pos = marker.getAbsolutePosition(dimension);
            return { markerId: id, ...pos };
        }).filter(Boolean);

        if (positions.length < 3) return markerIds;

        // Calculate centroid
        const centroid = {
            x: positions.reduce((sum, p) => sum + p.x, 0) / positions.length,
            y: positions.reduce((sum, p) => sum + p.y, 0) / positions.length
        };

        // Calculate angle from centroid for each point
        const withAngles = positions.map(pos => ({
            markerId: pos.markerId,
            angle: Math.atan2(pos.y - centroid.y, pos.x - centroid.x)
        }));

        // Sort by angle
        withAngles.sort((a, b) => a.angle - b.angle);

        return withAngles.map(item => item.markerId);
    }

    /**
     * Update polygons based on current connections
     * Detects and renders all polygons
     */
    updatePolygons() {
        const { polygons: oldPolygons } = this.appState;

        // Detect new polygons
        const detectedPolygons = this.detectPolygons();

        // Remove old polygons that are no longer valid
        for (const oldPoly of oldPolygons) {
            const stillExists = detectedPolygons.some(newPoly =>
                this.areSamePolygon(oldPoly, newPoly)
            );

            if (!stillExists) {
                this.canvasManager.removePolygon(oldPoly.id);
            }
        }

        // Add or update polygons
        const newPolygons = [];
        for (const detectedPoly of detectedPolygons) {
            // Check if this polygon already exists
            const existing = oldPolygons.find(oldPoly =>
                this.areSamePolygon(oldPoly, detectedPoly)
            );

            if (existing) {
                // Keep existing polygon (preserves user settings like color)
                newPolygons.push(existing);
                this.renderPolygon(existing);
            } else {
                // Create new polygon
                newPolygons.push(detectedPoly);
                this.renderPolygon(detectedPoly);
            }
        }

        // Update app state
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

        const markerObjs = polygon.markerIds.map(id =>
            markers.find(m => m.id === id)
        ).filter(Boolean);

        const dimensionObjs = markerObjs.map(marker =>
            dimensions.find(d => d.id === marker.dimensionId)
        ).filter(Boolean);

        if (markerObjs.length === polygon.markerIds.length &&
            dimensionObjs.length === polygon.markerIds.length) {
            this.canvasManager.renderPolygon(polygon, markerObjs, dimensionObjs);
        }
    }

    /**
     * Remove a polygon
     * @param {string} polygonId - ID of polygon to remove
     */
    removePolygon(polygonId) {
        const index = this.appState.polygons.findIndex(p => p.id === polygonId);
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
}
