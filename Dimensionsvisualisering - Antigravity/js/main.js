/**
 * Main Application Entry Point
 * Initializes the dimension visualization app
 */

import { Dimension } from './models/Dimension.js';
import { Marker } from './models/Marker.js';
import { Connection } from './models/Connection.js';
import { Intersection } from './models/Intersection.js';
import { Polygon } from './models/Polygon.js';
import { CanvasManager } from './managers/CanvasManager.js';
import { InteractionManager } from './managers/InteractionManager.js';
import { SnapManager } from './managers/SnapManager.js';
import { PolygonManager } from './managers/PolygonManager.js';

// Application State
const AppState = {
    dimensions: [],
    markers: [],
    connections: [],
    intersections: [],
    polygons: [],
    selectedElement: null,
    selectedType: null,
    mode: 'select', // 'select', 'addDimension', 'addMarker', 'connect', 'addIntersection'
    snapDistance: 20,

    // Temporary state for multi-step operations
    tempFirstMarker: null, // For connection mode
    tempFirstIntersectionMarker: null, // For intersection mode
};

// Managers
let canvasManager;
let interactionManager;
let snapManager;
let polygonManager;

/**
 * Initialize the application
 */
function init() {
    console.log('Initializing Dimension Visualization App...');

    // Get SVG element
    const svgElement = document.getElementById('canvas-svg');
    if (!svgElement) {
        console.error('SVG canvas element not found!');
        return;
    }

    // Initialize canvas manager
    canvasManager = new CanvasManager(svgElement);

    // Initialize interaction manager
    interactionManager = new InteractionManager(svgElement, canvasManager, AppState);

    // Initialize snap manager
    snapManager = new SnapManager(AppState.snapDistance);

    // Initialize polygon manager
    polygonManager = new PolygonManager(AppState, canvasManager);

    // Link managers
    interactionManager.snapManager = snapManager;
    interactionManager.onDimensionMoved = () => {
        rerenderAllPolygons();
        updateStatusBar();
    };
    interactionManager.onMarkerMoved = () => {
        polygonManager.updatePolygons();
        AppState.markers.forEach(m => rerenderIntersectionsForMarker(m.id));
        updateStatusBar();
    };
    interactionManager.onDimensionRotated = () => {
        rerenderAllPolygons();
        AppState.markers.forEach(m => rerenderIntersectionsForMarker(m.id));
        updateStatusBar();
    };

    // Setup UI event listeners
    setupToolbarEvents();
    setupCanvasEvents();
    setupPropertyPanelEvents();

    // Update UI
    updateStatusBar();
    updateModeDisplay();

    console.log('App initialized successfully!');
}

/**
 * Setup toolbar button event listeners
 */
function setupToolbarEvents() {
    // File menu
    const btnFile = document.getElementById('btn-file');
    const fileMenu = document.getElementById('file-menu');

    if (btnFile && fileMenu) {
        btnFile.addEventListener('click', (e) => {
            e.stopPropagation();
            fileMenu.classList.toggle('hidden');
        });

        // Close menu when clicking outside
        document.addEventListener('click', () => {
            fileMenu.classList.add('hidden');
        });
    }

    // Save button
    const btnSave = document.getElementById('btn-save');
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            saveToFile();
        });
    }

    // Load button
    const btnLoad = document.getElementById('btn-load');
    if (btnLoad) {
        btnLoad.addEventListener('click', () => {
            loadFromFile();
        });
    }

    // Export SVG button
    const btnExportSvg = document.getElementById('btn-export-svg');
    if (btnExportSvg) {
        btnExportSvg.addEventListener('click', () => {
            exportSVG();
        });
    }

    // Export PNG button
    const btnExportPng = document.getElementById('btn-export-png');
    if (btnExportPng) {
        btnExportPng.addEventListener('click', () => {
            exportPNG();
        });
    }

    // Add Dimension button
    const btnAddDimension = document.getElementById('btn-add-dimension');
    if (btnAddDimension) {
        btnAddDimension.addEventListener('click', () => {
            setMode('addDimension');
        });
    }

    // Add Marker button
    const btnAddMarker = document.getElementById('btn-add-marker');
    if (btnAddMarker) {
        btnAddMarker.addEventListener('click', () => {
            setMode('addMarker');
        });
    }

    // Connect button
    const btnConnect = document.getElementById('btn-connect');
    if (btnConnect) {
        btnConnect.addEventListener('click', () => {
            setMode('connect');
        });
    }

    // Intersection button
    const btnIntersection = document.getElementById('btn-intersection');
    if (btnIntersection) {
        btnIntersection.addEventListener('click', () => {
            setMode('addIntersection');
        });
    }
}

/**
 * Setup canvas event listeners
 */
function setupCanvasEvents() {
    const svg = document.getElementById('canvas-svg');
    if (!svg) return;

    svg.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomDelta = e.deltaY < 0 ? 1.1 : 1 / 1.1;
        canvasManager.zoomAtPoint(e.clientX, e.clientY, zoomDelta);
    }, { passive: false });

    // Click event
    svg.addEventListener('click', (e) => {
        if (interactionManager.consumeDidPan()) {
            return;
        }
        handleCanvasClick(e);
    });

    // Right-click (context menu) event for unsnapping
    svg.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        handleCanvasRightClick(e);
    });

    // Double click to deselect
    svg.addEventListener('dblclick', (e) => {
        if (interactionManager.consumeDidPan()) {
            return;
        }
        if (e.target === svg) {
            setMode('select');
            canvasManager.clearSelection();
            updatePropertyPanel();
        }
    });

    window.addEventListener('resize', () => {
        canvasManager.handleResize();
    });
}

/**
 * Setup property panel event listeners
 */
function setupPropertyPanelEvents() {
    // Property panel events will be set up dynamically when an element is selected
}

/**
 * Handle canvas click events
 */
function handleCanvasClick(e) {
    const target = e.target;

    switch (AppState.mode) {
        case 'addDimension':
            addDimensionAtPoint(e.clientX, e.clientY);
            setMode('select');
            break;

        case 'addMarker':
            handleAddMarkerClick(target);
            break;

        case 'connect':
            handleConnectClick(target);
            break;

        case 'addIntersection':
            handleAddIntersectionClick(target);
            break;

        case 'select':
            handleSelectClick(target);
            break;
    }
}

/**
 * Add a dimension at a specific point
 */
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

    // Create a marker at the midpoint (value 50)
    const midpointMarker = new Marker(dimension.id, {
        value: 50,
        name: `Markør ${AppState.markers.length + 1}`,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    });

    AppState.markers.push(midpointMarker);
    dimension.addMarker(midpointMarker.id);
    canvasManager.renderMarker(midpointMarker, dimension);

    // Select the new dimension
    canvasManager.selectElement(dimension.id, 'dimension');
    AppState.selectedElement = dimension.id;
    AppState.selectedType = 'dimension';

    updatePropertyPanel();
    updateStatusBar();

    console.log(`Dimension ${dimension.id} created at (${x}, ${y}) with midpoint marker ${midpointMarker.id}`);
}

/**
 * Handle add marker click
 */
function handleAddMarkerClick(target) {
    const dimensionId = target.getAttribute('data-dimension-id');
    if (!dimensionId) {
        alert('Klik på en dimension for at tilføje en markør');
        return;
    }

    const dimension = AppState.dimensions.find(d => d.id === dimensionId);
    if (!dimension) return;

    // Get click position
    const svg = document.getElementById('canvas-svg');
    const rect = svg.getBoundingClientRect();
    const clickPoint = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };

    // Get closest point on dimension line
    const closestPoint = dimension.getClosestPointOnLine(clickPoint);

    // Create marker
    const marker = new Marker(dimensionId, {
        value: closestPoint.value,
        name: `Markør ${AppState.markers.length + 1}`,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    });

    AppState.markers.push(marker);
    dimension.addMarker(marker.id);
    canvasManager.renderMarker(marker, dimension);

    // Select the new marker
    canvasManager.selectElement(marker.id, 'marker');
    AppState.selectedElement = marker.id;
    AppState.selectedType = 'marker';

    updatePropertyPanel();
    updateStatusBar();
    setMode('select');

    console.log(`Marker ${marker.id} created on dimension ${dimensionId}`);
}

/**
 * Handle connect mode click
 */
function handleConnectClick(target) {
    const markerId = target.getAttribute('data-marker-id');
    if (!markerId) {
        alert('Klik på en markør for at forbinde');
        return;
    }

    if (!AppState.tempFirstMarker) {
        // First marker selected
        AppState.tempFirstMarker = markerId;
        console.log(`First marker selected: ${markerId}`);

        // Visual feedback - highlight marker
        const markerEl = canvasManager.markerElements.get(markerId);
        if (markerEl) {
            markerEl.querySelector('.marker').classList.add('selected');
        }
    } else {
        // Second marker selected - create connection
        const marker2Id = markerId;
        const marker1Id = AppState.tempFirstMarker;

        if (marker1Id === marker2Id) {
            alert('Kan ikke forbinde en markør til sig selv');
            AppState.tempFirstMarker = null;
            canvasManager.clearSelection();
            return;
        }

        // Check if connection already exists
        const exists = AppState.connections.some(c =>
            (c.marker1Id === marker1Id && c.marker2Id === marker2Id) ||
            (c.marker1Id === marker2Id && c.marker2Id === marker1Id)
        );

        if (exists) {
            alert('Forbindelse findes allerede');
            AppState.tempFirstMarker = null;
            canvasManager.clearSelection();
            return;
        }

        // Create connection
        const connection = new Connection(marker1Id, marker2Id);
        AppState.connections.push(connection);

        // Get markers and dimensions for rendering
        const marker1 = AppState.markers.find(m => m.id === marker1Id);
        const marker2 = AppState.markers.find(m => m.id === marker2Id);
        const dim1 = AppState.dimensions.find(d => d.id === marker1.dimensionId);
        const dim2 = AppState.dimensions.find(d => d.id === marker2.dimensionId);

        canvasManager.renderConnection(connection, marker1, marker2, dim1, dim2);

        console.log(`Connection ${connection.id} created between ${marker1Id} and ${marker2Id}`);

        // Update polygons
        polygonManager.updatePolygons();

        // Reset temp state
        AppState.tempFirstMarker = null;
        canvasManager.clearSelection();
        updateStatusBar();
        setMode('select');
    }
}

/**
 * Handle add intersection mode click
 */
function handleAddIntersectionClick(target) {
    const markerId = target.getAttribute('data-marker-id');
    if (!markerId) {
        alert('Klik på en markør for at vælge første punkt i fællespunktet');
        return;
    }

    if (!AppState.tempFirstIntersectionMarker) {
        // First marker selected
        AppState.tempFirstIntersectionMarker = markerId;
        console.log(`First marker selected for intersection: ${markerId}`);

        // Visual feedback - highlight marker
        const markerEl = canvasManager.markerElements.get(markerId);
        if (markerEl) {
            markerEl.querySelector('.marker').classList.add('selected');
        }
    } else {
        // Second marker selected - create intersection
        const marker2Id = markerId;
        const marker1Id = AppState.tempFirstIntersectionMarker;

        if (marker1Id === marker2Id) {
            alert('Kan ikke lave et fællespunkt mellem en markør og sig selv');
            AppState.tempFirstIntersectionMarker = null;
            canvasManager.clearSelection();
            return;
        }

        const marker1 = AppState.markers.find(m => m.id === marker1Id);
        const marker2 = AppState.markers.find(m => m.id === marker2Id);

        if (marker1.dimensionId === marker2.dimensionId) {
            alert('Markørerne skal være på forskellige dimensioner for at finde et fællespunkt');
            AppState.tempFirstIntersectionMarker = null;
            canvasManager.clearSelection();
            return;
        }

        // Check if intersection already exists
        const exists = AppState.intersections.some(i =>
            (i.marker1Id === marker1Id && i.marker2Id === marker2Id) ||
            (i.marker1Id === marker2Id && i.marker2Id === marker1Id)
        );

        if (exists) {
            alert('Fællespunkt findes allerede');
            AppState.tempFirstIntersectionMarker = null;
            canvasManager.clearSelection();
            return;
        }

        // Create intersection
        const intersection = new Intersection(marker1Id, marker2Id);
        AppState.intersections.push(intersection);

        // Render it
        const dim1 = AppState.dimensions.find(d => d.id === marker1.dimensionId);
        const dim2 = AppState.dimensions.find(d => d.id === marker2.dimensionId);

        canvasManager.renderIntersection(intersection, marker1, marker2, dim1, dim2);

        console.log(`Intersection ${intersection.id} created between ${marker1Id} and ${marker2Id}`);

        // Reset temp state
        AppState.tempFirstIntersectionMarker = null;
        canvasManager.clearSelection();
        updateStatusBar();
        setMode('select');
    }
}

/**
 * Handle select mode click
 */
function handleSelectClick(target) {
    // Check what was clicked
    const dimensionId = target.getAttribute('data-dimension-id');
    const markerId = target.getAttribute('data-marker-id');
    const connectionId = target.getAttribute('data-connection-id');
    const intersectionId = target.getAttribute('data-intersection-id');
    const polygonId = target.getAttribute('data-polygon-id');

    if (markerId) {
        // Marker clicked
        canvasManager.selectElement(markerId, 'marker');
        AppState.selectedElement = markerId;
        AppState.selectedType = 'marker';
        updatePropertyPanel();
    } else if (dimensionId) {
        // Dimension clicked
        canvasManager.selectElement(dimensionId, 'dimension');
        AppState.selectedElement = dimensionId;
        AppState.selectedType = 'dimension';

        // Show rotation handles
        const dimension = AppState.dimensions.find(d => d.id === dimensionId);
        if (dimension) {
            canvasManager.showRotationHandles(dimension);
        }

        updatePropertyPanel();
    } else if (connectionId) {
        // Connection clicked
        canvasManager.selectElement(connectionId, 'connection');
        AppState.selectedElement = connectionId;
        AppState.selectedType = 'connection';
        updatePropertyPanel();
    } else if (intersectionId) {
        // Intersection clicked
        canvasManager.selectElement(intersectionId, 'intersection');
        AppState.selectedElement = intersectionId;
        AppState.selectedType = 'intersection';
        updatePropertyPanel();
    } else if (polygonId) {
        // Polygon clicked
        canvasManager.selectElement(polygonId, 'polygon');
        AppState.selectedElement = polygonId;
        AppState.selectedType = 'polygon';
        updatePropertyPanel();
    } else {
        // Nothing clicked - deselect
        canvasManager.clearSelection();
        AppState.selectedElement = null;
        AppState.selectedType = null;
        updatePropertyPanel();
    }
}

/**
 * Handle right-click (context menu) on canvas
 */
function handleCanvasRightClick(e) {
    const target = e.target;

    // Check if an endpoint was right-clicked
    const endpoint = target.closest('.dimension-endpoint');
    if (endpoint) {
        const dimensionId = endpoint.getAttribute('data-dimension-id');
        const endpointType = endpoint.getAttribute('data-endpoint');

        if (dimensionId && endpointType) {
            // Check if this endpoint has any snaps
            const hasSnaps = snapManager && snapManager.isSnapped(dimensionId);

            if (hasSnaps) {
                showUnsnapModal(dimensionId, endpointType);
            }
        }
    }
}

/**
 * Show modal to unsnap dimensions
 */
function showUnsnapModal(dimensionId, endpointType) {
    const dimension = AppState.dimensions.find(d => d.id === dimensionId);
    if (!dimension) return;

    // Get all dimensions connected to this endpoint
    const snapInfo = snapManager.getSnapInfo(dimensionId);
    const endpointSnap = endpointType === 'start' ? snapInfo.start : snapInfo.end;

    if (!endpointSnap) return;

    // Find all dimensions at this snap point
    const connectedAtPoint = [];

    // The dimension we clicked on
    connectedAtPoint.push({
        id: dimensionId,
        label: dimension.label,
        endpoint: endpointType
    });

    // Find other dimensions snapped to the same point
    for (const dim of AppState.dimensions) {
        if (dim.id === dimensionId) continue;

        const otherSnapInfo = snapManager.getSnapInfo(dim.id);

        // Check if start endpoint is at this point
        if (otherSnapInfo.start) {
            const isSamePoint =
                (otherSnapInfo.start.targetDimensionId === dimensionId &&
                    otherSnapInfo.start.targetEndpoint === endpointType) ||
                (dimensionId === otherSnapInfo.start.targetDimensionId);

            if (isSamePoint ||
                (otherSnapInfo.start.targetDimensionId === endpointSnap.targetDimensionId &&
                    otherSnapInfo.start.targetEndpoint === endpointSnap.targetEndpoint)) {
                connectedAtPoint.push({
                    id: dim.id,
                    label: dim.label,
                    endpoint: 'start'
                });
            }
        }

        // Check if end endpoint is at this point
        if (otherSnapInfo.end) {
            const isSamePoint =
                (otherSnapInfo.end.targetDimensionId === dimensionId &&
                    otherSnapInfo.end.targetEndpoint === endpointType) ||
                (dimensionId === otherSnapInfo.end.targetDimensionId);

            if (isSamePoint ||
                (otherSnapInfo.end.targetDimensionId === endpointSnap.targetDimensionId &&
                    otherSnapInfo.end.targetEndpoint === endpointSnap.targetEndpoint)) {
                connectedAtPoint.push({
                    id: dim.id,
                    label: dim.label,
                    endpoint: 'end'
                });
            }
        }
    }

    // Remove duplicates
    const uniqueDimensions = Array.from(new Map(
        connectedAtPoint.map(item => [item.id, item])
    ).values());

    if (uniqueDimensions.length === 0) return;

    // Populate modal
    const unsnapList = document.getElementById('unsnap-list');
    if (!unsnapList) return;

    unsnapList.innerHTML = '';

    uniqueDimensions.forEach(dim => {
        const item = document.createElement('div');
        item.classList.add('unsnap-item');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `unsnap-${dim.id}-${dim.endpoint}`;
        checkbox.value = `${dim.id}|${dim.endpoint}`;

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = `${dim.label} (${dim.endpoint === 'start' ? 'Start' : 'Slut'} endepunkt)`;

        item.appendChild(checkbox);
        item.appendChild(label);
        unsnapList.appendChild(item);
    });

    // Show modal
    const modal = document.getElementById('unsnap-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }

    // Setup modal button handlers
    setupUnsnapModalHandlers();
}

/**
 * Setup unsnap modal button handlers
 */
function setupUnsnapModalHandlers() {
    const confirmBtn = document.getElementById('unsnap-confirm');
    const cancelBtn = document.getElementById('unsnap-cancel');
    const modal = document.getElementById('unsnap-modal');

    // Remove old listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    // Cancel button
    newCancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Click outside modal to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    // Confirm button
    newConfirmBtn.addEventListener('click', () => {
        // Get selected checkboxes
        const checkboxes = document.querySelectorAll('#unsnap-list input[type="checkbox"]:checked');

        checkboxes.forEach(checkbox => {
            const [dimId, endpoint] = checkbox.value.split('|');

            // Remove snap for this dimension endpoint
            if (snapManager) {
                snapManager.snappedPairs.delete(`${dimId}-${endpoint}`);
                console.log(`Unsnapped ${dimId} ${endpoint}`);
            }
        });

        // Re-render all dimensions to reflect changes
        AppState.dimensions.forEach(dim => {
            canvasManager.renderDimension(dim);
        });

        rerenderAllMarkersAndConnections();
        rerenderAllPolygons();

        modal.classList.add('hidden');
    });
}

/**
 * Set application mode
 */
function setMode(mode) {
    AppState.mode = mode;
    updateModeDisplay();

    // Update cursor
    const svg = document.getElementById('canvas-svg');
    svg.className = `mode-${mode}`;
    svg.style.cursor = mode === 'select' ? 'grab' : '';

    // Update toolbar buttons
    document.querySelectorAll('.toolbar-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    if (mode === 'addDimension') {
        document.getElementById('btn-add-dimension')?.classList.add('active');
    } else if (mode === 'addMarker') {
        document.getElementById('btn-add-marker')?.classList.add('active');
    } else if (mode === 'connect') {
        document.getElementById('btn-connect')?.classList.add('active');
    } else if (mode === 'addIntersection') {
        document.getElementById('btn-intersection')?.classList.add('active');
    }

    // Clear temporary state
    AppState.tempFirstMarker = null;
    AppState.tempFirstIntersectionMarker = null;
    if (mode !== 'connect' && mode !== 'addIntersection') {
        canvasManager.clearSelection();
    }
}

/**
 * Update mode display
 */
function updateModeDisplay() {
    const modeDisplay = document.getElementById('mode-display');
    if (!modeDisplay) return;

    const modeNames = {
        select: 'Select',
        addDimension: 'Tilføj Dimension',
        addMarker: 'Tilføj Markør',
        connect: 'Forbind Markører',
        addIntersection: 'Tilføj Fællespunkt'
    };

    modeDisplay.textContent = `Mode: ${modeNames[AppState.mode] || AppState.mode}`;
}

/**
 * Update status bar
 */
function updateStatusBar() {
    const statusText = document.getElementById('status-text');
    if (!statusText) return;

    statusText.textContent = `${AppState.dimensions.length} dimensioner • ${AppState.markers.length} markører • ${AppState.connections.length} forbindelser • ${AppState.intersections.length} fællespunkter • ${AppState.polygons.length} polygoner`;
}

/**
 * Update property panel based on selected element
 */
function updatePropertyPanel() {
    const propsContent = document.querySelector('.props-content');
    if (!propsContent) return;

    if (!AppState.selectedElement || !AppState.selectedType) {
        propsContent.innerHTML = '<p class="props-empty">Vælg et element</p>';
        return;
    }

    // Build property panel based on type
    switch (AppState.selectedType) {
        case 'dimension':
            updateDimensionProperties(propsContent);
            break;
        case 'marker':
            updateMarkerProperties(propsContent);
            break;
        case 'connection':
            updateConnectionProperties(propsContent);
            break;
        case 'intersection':
            updateIntersectionProperties(propsContent);
            break;
        case 'polygon':
            updatePolygonProperties(propsContent);
            break;
    }
}

/**
 * Update dimension properties panel
 */
function updateDimensionProperties(container) {
    const dimension = AppState.dimensions.find(d => d.id === AppState.selectedElement);
    if (!dimension) return;

    container.innerHTML = `
        <div class="prop-group">
            <label>Navn</label>
            <input type="text" id="prop-dim-label" value="${dimension.label}">
        </div>
        <div class="prop-group">
            <label>Min Værdi</label>
            <input type="number" id="prop-dim-min" value="${dimension.minValue}">
        </div>
        <div class="prop-group">
            <label>Max Værdi</label>
            <input type="number" id="prop-dim-max" value="${dimension.maxValue}">
        </div>
        <div class="prop-group">
            <label>Længde (pixels)</label>
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

    // Add event listeners
    document.getElementById('prop-dim-label').addEventListener('input', (e) => {
        dimension.label = e.target.value;
        canvasManager.renderDimension(dimension);
    });

    document.getElementById('prop-dim-min').addEventListener('input', (e) => {
        dimension.minValue = parseFloat(e.target.value);
        canvasManager.renderDimension(dimension);
    });

    document.getElementById('prop-dim-max').addEventListener('input', (e) => {
        dimension.maxValue = parseFloat(e.target.value);
        canvasManager.renderDimension(dimension);
    });

    document.getElementById('prop-dim-length').addEventListener('input', (e) => {
        dimension.length = parseFloat(e.target.value);
        canvasManager.renderDimension(dimension);
        canvasManager.showRotationHandles(dimension);
        rerenderAllMarkersAndConnections();
        rerenderAllIntersections();
        rerenderAllPolygons();
    });

    document.getElementById('prop-dim-rotation').addEventListener('input', (e) => {
        dimension.rotation = parseFloat(e.target.value) % 360;
        canvasManager.renderDimension(dimension);
        canvasManager.updateRotationHandles(dimension);
        rerenderAllMarkersAndConnections();
        rerenderAllIntersections();
        rerenderAllPolygons();
    });

    document.getElementById('btn-delete-dimension').addEventListener('click', () => {
        deleteDimension(dimension.id);
    });
}

/**
 * Update marker properties panel
 */
function updateMarkerProperties(container) {
    const marker = AppState.markers.find(m => m.id === AppState.selectedElement);
    if (!marker) return;

    const dimension = AppState.dimensions.find(d => d.id === marker.dimensionId);

    container.innerHTML = `
        <div class="prop-group">
            <label>Navn</label>
            <input type="text" id="prop-marker-name" value="${marker.name}">
        </div>
        <div class="prop-group">
            <label>Værdi</label>
            <input type="number" id="prop-marker-value" value="${marker.value}"
                   min="${dimension?.minValue || 0}" max="${dimension?.maxValue || 100}">
        </div>
        <div class="prop-group">
            <label>Farve</label>
            <input type="color" id="prop-marker-color" value="${marker.color}">
        </div>
        <div class="prop-group">
            <label>Størrelse</label>
            <input type="number" id="prop-marker-radius" value="${marker.radius}" min="4" max="20">
        </div>
        <div class="prop-group">
            <button id="btn-delete-marker">Slet Markør</button>
        </div>
    `;

    // Add event listeners
    document.getElementById('prop-marker-name').addEventListener('input', (e) => {
        marker.name = e.target.value;
        if (dimension) canvasManager.renderMarker(marker, dimension);
    });

    document.getElementById('prop-marker-value').addEventListener('input', (e) => {
        marker.value = parseFloat(e.target.value);
        if (dimension) {
            canvasManager.renderMarker(marker, dimension);
            rerenderConnectionsForMarker(marker.id);
            rerenderIntersectionsForMarker(marker.id);
            rerenderAllPolygons();
        }
    });

    document.getElementById('prop-marker-color').addEventListener('input', (e) => {
        marker.color = e.target.value;
        if (dimension) canvasManager.renderMarker(marker, dimension);
    });

    document.getElementById('prop-marker-radius').addEventListener('input', (e) => {
        marker.radius = parseFloat(e.target.value);
        if (dimension) canvasManager.renderMarker(marker, dimension);
    });

    document.getElementById('btn-delete-marker').addEventListener('click', () => {
        deleteMarker(marker.id);
    });
}

/**
 * Update connection properties panel
 */
function updateConnectionProperties(container) {
    const connection = AppState.connections.find(c => c.id === AppState.selectedElement);
    if (!connection) return;

    container.innerHTML = `
        <div class="prop-group">
            <label>Linje Style</label>
            <select id="prop-conn-style">
                <option value="solid" ${connection.style === 'solid' ? 'selected' : ''}>Hel linje</option>
                <option value="dashed" ${connection.style === 'dashed' ? 'selected' : ''}>Stiplet linje</option>
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

    // Add event listeners
    document.getElementById('prop-conn-style').addEventListener('change', (e) => {
        connection.style = e.target.value;
        rerenderConnection(connection.id);
    });

    document.getElementById('prop-conn-color').addEventListener('input', (e) => {
        connection.color = e.target.value;
        rerenderConnection(connection.id);
    });

    document.getElementById('prop-conn-width').addEventListener('input', (e) => {
        connection.width = parseFloat(e.target.value);
        rerenderConnection(connection.id);
    });

    document.getElementById('btn-delete-connection').addEventListener('click', () => {
        deleteConnection(connection.id);
    });
}

/**
 * Update intersection properties panel
 */
function updateIntersectionProperties(container) {
    const intersection = AppState.intersections.find(i => i.id === AppState.selectedElement);
    if (!intersection) return;

    container.innerHTML = `
        <div class="prop-group">
            <label>Punkt Farve</label>
            <input type="color" id="prop-int-point-color" value="${intersection.pointColor}">
        </div>
        <div class="prop-group">
            <label>Punkt Størrelse</label>
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
                <option value="solid" ${intersection.lineStyle === 'solid' ? 'selected' : ''}>Hel linje</option>
                <option value="dashed" ${intersection.lineStyle === 'dashed' ? 'selected' : ''}>Stiplet linje</option>
            </select>
        </div>
        <div class="prop-group">
            <button id="btn-delete-intersection">Slet Fællespunkt</button>
        </div>
    `;

    document.getElementById('prop-int-point-color').addEventListener('input', (e) => {
        intersection.pointColor = e.target.value;
        rerenderIntersection(intersection.id);
    });

    document.getElementById('prop-int-point-radius').addEventListener('input', (e) => {
        intersection.pointRadius = parseFloat(e.target.value);
        rerenderIntersection(intersection.id);
    });

    document.getElementById('prop-int-line-color').addEventListener('input', (e) => {
        intersection.lineColor = e.target.value;
        rerenderIntersection(intersection.id);
    });

    document.getElementById('prop-int-line-width').addEventListener('input', (e) => {
        intersection.lineWidth = parseFloat(e.target.value);
        rerenderIntersection(intersection.id);
    });

    document.getElementById('prop-int-line-style').addEventListener('change', (e) => {
        intersection.lineStyle = e.target.value;
        rerenderIntersection(intersection.id);
    });

    document.getElementById('btn-delete-intersection').addEventListener('click', () => {
        deleteIntersection(intersection.id);
    });
}

/**
 * Update polygon properties panel
 */
function updatePolygonProperties(container) {
    const polygon = AppState.polygons.find(p => p.id === AppState.selectedElement);
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

    // Add event listeners
    document.getElementById('prop-poly-color').addEventListener('input', (e) => {
        polygon.fillColor = e.target.value;
        rerenderPolygon(polygon.id);
    });

    document.getElementById('prop-poly-opacity').addEventListener('input', (e) => {
        polygon.fillOpacity = parseFloat(e.target.value);
        rerenderPolygon(polygon.id);
    });

    document.getElementById('btn-delete-polygon').addEventListener('click', () => {
        deletePolygon(polygon.id);
    });
}

/**
 * Delete dimension
 */
function deleteDimension(dimensionId) {
    if (!confirm('Slet denne dimension? Alle tilhørende markører vil også blive slettet.')) {
        return;
    }

    // Find and delete all markers on this dimension
    const markersToDelete = AppState.markers.filter(m => m.dimensionId === dimensionId);
    markersToDelete.forEach(marker => {
        deleteMarker(marker.id, false);
    });

    // Remove snaps for this dimension
    if (snapManager) {
        snapManager.removeSnap(dimensionId);
    }

    // Remove dimension
    const index = AppState.dimensions.findIndex(d => d.id === dimensionId);
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

/**
 * Delete marker
 */
function deleteMarker(markerId, confirm = true) {
    if (confirm && !window.confirm('Slet denne markør? Alle forbindelser vil også blive slettet.')) {
        return;
    }

    // Find and delete all connections involving this marker
    const connectionsToDelete = AppState.connections.filter(c => c.hasMarker(markerId));
    connectionsToDelete.forEach(conn => {
        deleteConnection(conn.id, false);
    });

    // Find and delete all intersections involving this marker
    const intersectionsToDelete = AppState.intersections.filter(i => i.hasMarker(markerId));
    intersectionsToDelete.forEach(i => {
        deleteIntersection(i.id, false);
    });

    // Remove marker from dimension
    const marker = AppState.markers.find(m => m.id === markerId);
    if (marker) {
        const dimension = AppState.dimensions.find(d => d.id === marker.dimensionId);
        if (dimension) {
            dimension.removeMarker(markerId);
        }
    }

    // Remove marker
    const index = AppState.markers.findIndex(m => m.id === markerId);
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

/**
 * Delete connection
 */
function deleteConnection(connectionId, confirm = true) {
    if (confirm && !window.confirm('Slet denne forbindelse?')) {
        return;
    }

    const index = AppState.connections.findIndex(c => c.id === connectionId);
    if (index > -1) {
        AppState.connections.splice(index, 1);
    }

    canvasManager.removeConnection(connectionId);

    // Update polygons after connection deletion
    polygonManager.updatePolygons();

    if (AppState.selectedElement === connectionId) {
        canvasManager.clearSelection();
        AppState.selectedElement = null;
        AppState.selectedType = null;
        updatePropertyPanel();
    }

    updateStatusBar();
}

/**
 * Delete intersection
 */
function deleteIntersection(intersectionId, confirm = true) {
    if (confirm && !window.confirm('Slet dette fællespunkt?')) {
        return;
    }

    const index = AppState.intersections.findIndex(i => i.id === intersectionId);
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

/**
 * Delete polygon
 */
function deletePolygon(polygonId) {
    const index = AppState.polygons.findIndex(p => p.id === polygonId);
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

/**
 * Rerender a connection
 */
function rerenderConnection(connectionId) {
    const connection = AppState.connections.find(c => c.id === connectionId);
    if (!connection) return;

    const marker1 = AppState.markers.find(m => m.id === connection.marker1Id);
    const marker2 = AppState.markers.find(m => m.id === connection.marker2Id);
    const dim1 = AppState.dimensions.find(d => d.id === marker1?.dimensionId);
    const dim2 = AppState.dimensions.find(d => d.id === marker2?.dimensionId);

    if (marker1 && marker2 && dim1 && dim2) {
        canvasManager.renderConnection(connection, marker1, marker2, dim1, dim2);
    }
}

/**
 * Rerender all connections for a marker
 */
function rerenderConnectionsForMarker(markerId) {
    const connections = AppState.connections.filter(c => c.hasMarker(markerId));
    connections.forEach(conn => rerenderConnection(conn.id));
}

/**
 * Rerender all markers and connections
 */
function rerenderAllMarkersAndConnections() {
    // Rerender all markers
    AppState.markers.forEach(marker => {
        const dimension = AppState.dimensions.find(d => d.id === marker.dimensionId);
        if (dimension) {
            canvasManager.renderMarker(marker, dimension);
        }
    });

    // Rerender all connections
    AppState.connections.forEach(conn => rerenderConnection(conn.id));
}

/**
 * Rerender an intersection
 */
function rerenderIntersection(intersectionId) {
    const intersection = AppState.intersections.find(i => i.id === intersectionId);
    if (!intersection) return;

    const marker1 = AppState.markers.find(m => m.id === intersection.marker1Id);
    const marker2 = AppState.markers.find(m => m.id === intersection.marker2Id);
    const dim1 = AppState.dimensions.find(d => d.id === marker1?.dimensionId);
    const dim2 = AppState.dimensions.find(d => d.id === marker2?.dimensionId);

    if (marker1 && marker2 && dim1 && dim2) {
        canvasManager.renderIntersection(intersection, marker1, marker2, dim1, dim2);
    }
}

/**
 * Rerender all intersections for a marker
 */
function rerenderIntersectionsForMarker(markerId) {
    const intersections = AppState.intersections.filter(i => i.hasMarker(markerId));
    intersections.forEach(i => rerenderIntersection(i.id));
}

/**
 * Rerender all intersections
 */
function rerenderAllIntersections() {
    AppState.intersections.forEach(i => rerenderIntersection(i.id));
}

/**
 * Rerender a polygon
 */
function rerenderPolygon(polygonId) {
    const polygon = AppState.polygons.find(p => p.id === polygonId);
    if (!polygon) return;

    const markers = polygon.markerIds.map(id => AppState.markers.find(m => m.id === id)).filter(Boolean);
    const dimensions = markers.map(m => AppState.dimensions.find(d => d.id === m.dimensionId)).filter(Boolean);

    if (markers.length === polygon.markerIds.length && dimensions.length === polygon.markerIds.length) {
        canvasManager.renderPolygon(polygon, markers, dimensions);
    }
}

/**
 * Rerender all polygons
 */
function rerenderAllPolygons() {
    AppState.polygons.forEach(polygon => {
        rerenderPolygon(polygon.id);
    });
}

/**
 * Save to JSON file
 */
function saveToFile() {
    const data = {
        version: '1.0',
        metadata: {
            created: new Date().toISOString(),
            modified: new Date().toISOString()
        },
        dimensions: AppState.dimensions.map(d => d.toJSON()),
        markers: AppState.markers.map(m => m.toJSON()),
        connections: AppState.connections.map(c => c.toJSON()),
        intersections: AppState.intersections.map(i => i.toJSON()),
        polygons: AppState.polygons.map(p => p.toJSON()),
        settings: {
            snapDistance: AppState.snapDistance
        }
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `dimension-visualization-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
    console.log('File saved successfully');
}

/**
 * Load from JSON file
 */
function loadFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);

                // Clear current state
                canvasManager.clear();
                AppState.dimensions = [];
                AppState.markers = [];
                AppState.connections = [];
                AppState.intersections = [];
                AppState.polygons = [];

                // Load dimensions
                data.dimensions.forEach(dimData => {
                    const dim = Dimension.fromJSON(dimData);
                    AppState.dimensions.push(dim);
                    canvasManager.renderDimension(dim);
                });

                // Load markers
                data.markers.forEach(markerData => {
                    const marker = Marker.fromJSON(markerData);
                    AppState.markers.push(marker);

                    const dim = AppState.dimensions.find(d => d.id === marker.dimensionId);
                    if (dim) {
                        canvasManager.renderMarker(marker, dim);
                    }
                });

                // Load connections
                data.connections.forEach(connData => {
                    const conn = Connection.fromJSON(connData);
                    AppState.connections.push(conn);
                    rerenderConnection(conn.id);
                });

                // Load intersections
                if (data.intersections) {
                    data.intersections.forEach(intData => {
                        const intersection = Intersection.fromJSON(intData);
                        AppState.intersections.push(intersection);
                        rerenderIntersection(intersection.id);
                    });
                }

                // Load polygons
                if (data.polygons) {
                    data.polygons.forEach(polyData => {
                        const poly = Polygon.fromJSON(polyData);
                        AppState.polygons.push(poly);
                        rerenderPolygon(poly.id);
                    });
                }

                // Load settings
                if (data.settings) {
                    AppState.snapDistance = data.settings.snapDistance || 20;
                }

                updateStatusBar();
                console.log('File loaded successfully');

            } catch (error) {
                console.error('Error loading file:', error);
                alert('Fejl ved indlæsning af fil');
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

/**
 * Export to SVG
 */
function exportSVG() {
    const svg = document.getElementById('canvas-svg');
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `dimension-visualization-${Date.now()}.svg`;
    a.click();

    URL.revokeObjectURL(url);
    console.log('SVG exported successfully');
}

/**
 * Export to PNG
 */
function exportPNG() {
    const svg = document.getElementById('canvas-svg');
    const svgString = new XMLSerializer().serializeToString(svg);

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = svg.clientWidth || 1920;
        canvas.height = svg.clientHeight || 1080;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
            const pngUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = `dimension-visualization-${Date.now()}.png`;
            a.click();

            URL.revokeObjectURL(url);
            URL.revokeObjectURL(pngUrl);
            console.log('PNG exported successfully');
        }, 'image/png');
    };

    img.src = url;
}

// Expose for global Save/Load system in the Omnibus SUITE
window.exportGlobalState = function () {
    return {
        dimensions: AppState.dimensions.map(d => d.toJSON()),
        markers: AppState.markers.map(m => m.toJSON()),
        connections: AppState.connections.map(c => c.toJSON()),
        intersections: AppState.intersections.map(i => i.toJSON()),
        polygons: AppState.polygons.map(p => p.toJSON()),
        settings: { snapDistance: AppState.snapDistance }
    };
};

window.importGlobalState = function (data) {
    if (!data) return;
    try {
        canvasManager.clear();
        AppState.dimensions = [];
        AppState.markers = [];
        AppState.connections = [];
        AppState.intersections = [];
        AppState.polygons = [];

        if (data.dimensions) data.dimensions.forEach(dimData => {
            const dim = Dimension.fromJSON(dimData);
            AppState.dimensions.push(dim);
            canvasManager.renderDimension(dim);
        });

        if (data.markers) data.markers.forEach(markerData => {
            const marker = Marker.fromJSON(markerData);
            AppState.markers.push(marker);
            const dim = AppState.dimensions.find(d => d.id === marker.dimensionId);
            if (dim) canvasManager.renderMarker(marker, dim);
        });

        if (data.connections) data.connections.forEach(connData => {
            const conn = Connection.fromJSON(connData);
            AppState.connections.push(conn);
            rerenderConnection(conn.id);
        });

        if (data.intersections) data.intersections.forEach(intData => {
            const intersection = Intersection.fromJSON(intData);
            AppState.intersections.push(intersection);
            rerenderIntersection(intersection.id);
        });

        if (data.polygons) data.polygons.forEach(polyData => {
            const poly = Polygon.fromJSON(polyData);
            AppState.polygons.push(poly);
            rerenderPolygon(poly.id);
        });

        if (data.settings) AppState.snapDistance = data.settings.snapDistance || 20;
        updateStatusBar();
    } catch (err) {
        console.error('importGlobalState parse error', err);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Export for debugging
window.AppState = AppState;
window.canvasManager = canvasManager;
window.interactionManager = interactionManager;
window.snapManager = snapManager;
window.polygonManager = polygonManager;
