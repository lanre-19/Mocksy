import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * VIEWPORT REDUX SLICE
 * 
 * This module manages the viewport state for a zoomable, pannable canvas.
 * Think of it like Google Maps - you can zoom in/out and pan around.
 * 
 * Key Concepts:
 * - World Coordinates: The actual coordinates of objects on the canvas (e.g., a shape at x=100, y=100)
 * - Screen Coordinates: Pixel positions on the user's screen (e.g., mouse position)
 * - Scale: Zoom level (1 = 100%, 2 = 200%, 0.5 = 50%)
 * - Translate: How much the canvas has been panned (offset from origin)
 * 
 * Features:
 * - Smooth zooming with mouse wheel
 * - Pan by dragging
 * - Zoom to fit content
 * - Center on specific points
 * - Keyboard shortcuts (space bar for hand tool)
 * - Touch/trackpad support
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * A point in 2D space with x and y coordinates
 * Used for both screen and world coordinates
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * A rectangle defined by position and dimensions
 * Used for bounding boxes and viewport dimensions
 */
export interface Rect {
  x: number;        // Top-left x coordinate
  y: number;        // Top-left y coordinate
  width: number;    // Width in pixels
  height: number;   // Height in pixels
}

/**
 * Current interaction mode of the viewport
 * - idle: No interaction happening
 * - panning: User is actively dragging to pan (mouse/touch)
 * - shiftPanning: User is holding space bar for temporary hand tool
 */
export type ViewportMode = "idle" | "panning" | "shiftPanning";

/**
 * Viewport state interface
 * Contains all information about the current view of the canvas
 */
interface ViewportState {
  // Core viewport properties
  scale: number;              // Current zoom level (1 = 100%)
  minScale: number;           // Minimum allowed zoom (e.g., 0.1 = 10%)
  maxScale: number;           // Maximum allowed zoom (e.g., 8 = 800%)
  translate: Point;           // Pan offset from origin
  mode: ViewportMode;         // Current interaction mode

  // Pan tracking - stores state during drag operations
  panStartScreen: Point | null;      // Mouse position when pan started
  panStartTranslate: Point | null;   // Translate value when pan started

  // Tunables - adjustable parameters for user experience
  wheelPanSpeed: number;      // How fast trackpad/shift+wheel pans
  zoomStep: number;           // Zoom multiplier per wheel notch
}

/**
 * Initial viewport state
 * Canvas starts at 100% zoom, centered at origin, ready for interaction
 */
const initialState: ViewportState = {
  scale: 1,                   // Start at 100% zoom
  minScale: 0.1,              // Can zoom out to 10%
  maxScale: 8,                // Can zoom in to 800%
  translate: { x: 0, y: 0 },  // Start at origin
  mode: "idle",               // Not interacting

  panStartScreen: null,       // No pan in progress
  panStartTranslate: null,

  wheelPanSpeed: 0.5,         // Moderate pan speed
  zoomStep: 1.06,             // ~6% zoom per wheel notch (feels smooth)
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Clamps a value between min and max bounds
 * Ensures zoom levels stay within allowed range
 * 
 * @param v - Value to clamp
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Clamped value
 * 
 * Example: clamp(15, 0, 10) => 10
 */
export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/**
 * Converts screen coordinates to world coordinates
 * Used to find what canvas position the mouse is pointing at
 * 
 * Formula: worldX = (screenX - translateX) / scale
 * 
 * @param screen - Screen position (e.g., mouse cursor)
 * @param translate - Current canvas pan offset
 * @param scale - Current zoom level
 * @returns World coordinates
 * 
 * Example: If screen is at (100, 100), translate is (50, 50), scale is 2:
 * world = ((100 - 50) / 2, (100 - 50) / 2) = (25, 25)
 */
export const screenToWorld = (
  screen: Point,
  translate: Point,
  scale: number
): Point => ({
  x: (screen.x - translate.x) / scale,
  y: (screen.y - translate.y) / scale,
});

/**
 * Converts world coordinates to screen coordinates
 * Used to render canvas objects at the correct screen position
 * 
 * Formula: screenX = worldX * scale + translateX
 * 
 * @param world - World position (e.g., shape position)
 * @param translate - Current canvas pan offset
 * @param scale - Current zoom level
 * @returns Screen coordinates
 * 
 * Example: If world is at (25, 25), translate is (50, 50), scale is 2:
 * screen = (25 * 2 + 50, 25 * 2 + 50) = (100, 100)
 */
export const worldToScreen = (
  world: Point,
  translate: Point,
  scale: number
): Point => ({
  x: world.x * scale + translate.x,
  y: world.y * scale + translate.y,
});

/**
 * Calculates the new translate needed to zoom around a specific screen point
 * This is the key to smooth zooming - it keeps the point under your cursor
 * stationary while everything else zooms in/out around it
 * 
 * Process:
 * 1. Find what world point is currently at the origin screen position
 * 2. Calculate new translate so that same world point stays at origin after scaling
 * 
 * @param originScreen - Screen point to zoom around (typically mouse position)
 * @param newScale - Target zoom level
 * @param currentTranslate - Current pan offset
 * @param currentScale - Current zoom level
 * @returns New translate value to maintain the origin point
 * 
 * Example: Zooming in on your mouse cursor position - the content under
 * your cursor stays in place while everything zooms around it
 */
export const zoomAroundScreenPoint = (
  originScreen: Point,
  newScale: number,
  currentTranslate: Point,
  currentScale: number
): Point => {
  // Find what world point is currently at the origin screen position
  const worldAtOrigin = screenToWorld(
    originScreen,
    currentTranslate,
    currentScale
  );
  
  // Calculate translate that keeps that world point at the same screen position
  return {
    x: originScreen.x - worldAtOrigin.x * newScale,
    y: originScreen.y - worldAtOrigin.y * newScale,
  };
};

/**
 * Calculates Euclidean distance between two points
 * Used for gesture recognition (pinch-to-zoom detection)
 * 
 * @param a - First point
 * @param b - Second point
 * @returns Distance in pixels
 */
export const distance = (a: Point, b: Point) =>
  Math.hypot(b.x - a.x, b.y - a.y);

/**
 * Calculates the midpoint between two points
 * Used to find center point for pinch-to-zoom gestures
 * 
 * @param a - First point
 * @param b - Second point
 * @returns Midpoint coordinates
 */
export const midpoint = (a: Point, b: Point): Point => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

// ============================================================================
// REDUX SLICE DEFINITION
// ============================================================================

/**
 * Main Redux slice for viewport management
 * Contains all reducers for viewport manipulation
 */
const viewportSlice = createSlice({
  name: "viewport",
  initialState,
  reducers: {
    // ------------------------------------------------------------------------
    // BASIC VIEWPORT MANIPULATION
    // ------------------------------------------------------------------------

    /**
     * Directly sets the pan offset
     * Used for programmatic viewport control
     * 
     * @param action.payload - New translate coordinates
     */
    setTranslate(state, action: PayloadAction<Point>) {
      state.translate.x = action.payload.x;
      state.translate.y = action.payload.y;
    },

    /**
     * Sets the zoom level with optional origin point
     * If origin is provided, zooms around that point (keeps it stationary)
     * If no origin, zooms from center/current position
     * 
     * @param action.payload.scale - New zoom level
     * @param action.payload.originScreen - Optional point to zoom around
     */
    setScale(
      state,
      action: PayloadAction<{ scale: number; originScreen?: Point }>
    ) {
      const { scale, originScreen } = action.payload;
      const clamped = clamp(scale, state.minScale, state.maxScale);
      
      // If origin provided, adjust translate to keep that point stationary
      if (originScreen) {
        const t = zoomAroundScreenPoint(
          originScreen,
          clamped,
          state.translate,
          state.scale
        );
        state.translate.x = t.x;
        state.translate.y = t.y;
      }
      
      state.scale = clamped;
    },

    // ------------------------------------------------------------------------
    // ZOOM OPERATIONS
    // ------------------------------------------------------------------------

    /**
     * Zooms by a relative factor around a screen point
     * Used for zoom buttons (zoom in 2x, zoom out 0.5x)
     * 
     * @param action.payload.factor - Zoom multiplier (e.g., 2 = zoom in 2x, 0.5 = zoom out 2x)
     * @param action.payload.originScreen - Point to zoom around
     * 
     * Example: zoomBy({ factor: 2, originScreen: mousePos })
     */
    zoomBy(
      state,
      action: PayloadAction<{ factor: number; originScreen: Point }>
    ) {
      const { factor, originScreen } = action.payload;
      const next = clamp(state.scale * factor, state.minScale, state.maxScale);
      
      const t = zoomAroundScreenPoint(
        originScreen,
        next,
        state.translate,
        state.scale
      );
      state.translate.x = t.x;
      state.translate.y = t.y;
      state.scale = next;
    },

    /**
     * Handles mouse wheel zoom events
     * Zooms around the cursor position with smooth incremental steps
     * 
     * The formula converts wheel deltaY to a smooth zoom factor:
     * - Dividing by 53 normalizes different mouse wheel sensitivities
     * - Negative sign inverts direction (wheel up = zoom in)
     * - Math.pow creates smooth exponential zoom
     * 
     * @param action.payload.deltaY - Mouse wheel delta (positive = wheel down)
     * @param action.payload.originScreen - Mouse cursor position
     */
    wheelZoom(
      state,
      action: PayloadAction<{ deltaY: number; originScreen: Point }>
    ) {
      const { deltaY, originScreen } = action.payload;
      
      // Convert wheel delta to smooth zoom factor
      // Example: deltaY=-53 (one notch up) => factor=1.06 (6% zoom in)
      const factor = Math.pow(state.zoomStep, -deltaY / 53);
      const next = clamp(state.scale * factor, state.minScale, state.maxScale);
      
      const t = zoomAroundScreenPoint(
        originScreen,
        next,
        state.translate,
        state.scale
      );
      state.translate.x = t.x;
      state.translate.y = t.y;
      state.scale = next;
    },

    // ------------------------------------------------------------------------
    // PAN OPERATIONS
    // ------------------------------------------------------------------------

    /**
     * Pans the viewport using mouse wheel (trackpad two-finger scroll)
     * Typically triggered by shift+wheel or horizontal wheel events
     * Speed is controlled by wheelPanSpeed tunable
     * 
     * @param action.payload.dx - Horizontal pan delta
     * @param action.payload.dy - Vertical pan delta
     */
    wheelPan(state, action: PayloadAction<{ dx: number; dy: number }>) {
      state.translate.x += action.payload.dx * state.wheelPanSpeed;
      state.translate.y += action.payload.dy * state.wheelPanSpeed;
    },

    /**
     * Starts a pan operation (mouse/touch drag)
     * Records the starting position for calculating drag delta
     * 
     * @param action.payload.screen - Initial cursor/touch position
     * @param action.payload.mode - Optional mode (defaults to "panning")
     * 
     * Modes:
     * - "panning": Regular drag to pan
     * - "shiftPanning": Temporary hand tool (space bar held)
     */
    panStart(
      state,
      action: PayloadAction<{ screen: Point; mode?: ViewportMode }>
    ) {
      state.mode = action.payload.mode ?? "panning";
      state.panStartScreen = action.payload.screen;
      // Save current translate to calculate relative movement
      state.panStartTranslate = { x: state.translate.x, y: state.translate.y };
    },

    /**
     * Updates viewport during pan drag
     * Calculates how far the cursor has moved and updates translate accordingly
     * Only works if pan operation is active
     * 
     * @param action.payload - Current cursor/touch position
     */
    panMove(state, action: PayloadAction<Point>) {
      // Only process if currently panning
      if (!(state.mode === "panning" || state.mode === "shiftPanning")) return;
      if (!state.panStartScreen || !state.panStartTranslate) return;
      
      // Calculate how far cursor moved from start
      const dx = action.payload.x - state.panStartScreen.x;
      const dy = action.payload.y - state.panStartScreen.y;
      
      // Apply delta to original translate position
      state.translate.x = state.panStartTranslate.x + dx;
      state.translate.y = state.panStartTranslate.y + dy;
    },

    /**
     * Ends pan operation (mouse up, touch end)
     * Clears pan tracking state and returns to idle mode
     */
    panEnd(state) {
      state.mode = "idle";
      state.panStartScreen = null;
      state.panStartTranslate = null;
    },

    // ------------------------------------------------------------------------
    // HAND TOOL (SPACE BAR) OPERATIONS
    // ------------------------------------------------------------------------

    /**
     * Enables hand tool mode (space bar pressed)
     * Only activates if viewport is idle (not already panning)
     * Changes cursor to hand icon, allows click-drag to pan
     */
    handToolEnable(state) {
      if (state.mode === "idle") state.mode = "shiftPanning";
    },

    /**
     * Disables hand tool mode (space bar released)
     * Returns to idle mode if currently in hand tool mode
     * If user was actively dragging, this gets handled by panEnd instead
     */
    handToolDisable(state) {
      if (state.mode === "shiftPanning") state.mode = "idle";
    },

    // ------------------------------------------------------------------------
    // VIEWPORT POSITIONING HELPERS
    // ------------------------------------------------------------------------

    /**
     * Centers the viewport on a specific world coordinate
     * Optionally maps it to a custom screen position (defaults to top-left)
     * 
     * @param action.payload.world - World coordinates to center on
     * @param action.payload.toScreen - Optional screen position to map to (default: origin)
     * 
     * Example: Center canvas object at (100, 100) in the middle of screen
     * centerOnWorld({ world: {x: 100, y: 100}, toScreen: {x: screenWidth/2, y: screenHeight/2} })
     */
    centerOnWorld(
      state,
      action: PayloadAction<{ world: Point; toScreen?: Point }>
    ) {
      const { world, toScreen = { x: 0, y: 0 } } = action.payload;
      
      // Calculate translate that places world point at desired screen position
      state.translate.x = toScreen.x - world.x * state.scale;
      state.translate.y = toScreen.y - world.y * state.scale;
    },

    /**
     * Zooms and pans to fit a bounding box in the viewport
     * Similar to "Zoom to Fit" or "Frame All" in design tools
     * Calculates optimal zoom level and centers content with padding
     * 
     * @param action.payload.bounds - Bounding box to fit (world coordinates)
     * @param action.payload.viewportPx - Viewport size in pixels
     * @param action.payload.padding - Optional padding around content (default: 50px)
     * 
     * Example: Zoom to fit all selected shapes
     * zoomToFit({ bounds: selectionBounds, viewportPx: {width: 1920, height: 1080}, padding: 50 })
     */
    zoomToFit(
      state,
      action: PayloadAction<{
        bounds: Rect;
        viewportPx: { width: number; height: number };
        padding?: number;
      }>
    ) {
      const { bounds, viewportPx, padding = 50 } = action.payload;
      
      // Calculate available space (viewport minus padding on both sides)
      const aw = Math.max(1, viewportPx.width - padding * 2);
      const ah = Math.max(1, viewportPx.height - padding * 2);
      
      // Ensure bounds have minimum size to prevent division by zero
      const bw = Math.max(1e-6, bounds.width);
      const bh = Math.max(1e-6, bounds.height);

      // Calculate scale needed to fit width and height separately
      const scaleX = aw / bw;
      const scaleY = ah / bh;
      
      // Use the smaller scale to ensure everything fits (letterbox/pillarbox)
      const next = clamp(
        Math.min(scaleX, scaleY),
        state.minScale,
        state.maxScale
      );

      // Calculate center points
      const centerX = viewportPx.width / 2;
      const centerY = viewportPx.height / 2;
      const boundsCenterX = bounds.x + bounds.width / 2;
      const boundsCenterY = bounds.y + bounds.height / 2;

      // Apply new scale and center the bounds
      state.scale = next;
      state.translate.x = centerX - boundsCenterX * next;
      state.translate.y = centerY - boundsCenterY * next;
    },

    // ------------------------------------------------------------------------
    // STATE MANAGEMENT
    // ------------------------------------------------------------------------

    /**
     * Resets viewport to initial state
     * Returns to 100% zoom, centered at origin, clears any active interactions
     * Useful for "Reset View" button or keyboard shortcut
     */
    resetView(state) {
      state.scale = 1;
      state.translate.x = 0;
      state.translate.y = 0;
      state.mode = "idle";
      state.panStartScreen = null;
      state.panStartTranslate = null;
    },

    /**
     * Restores viewport from saved state (project load, undo/redo)
     * Applies saved scale and translate while resetting interaction state
     * Clamps scale to ensure it's within valid bounds
     * 
     * @param action.payload.scale - Saved zoom level
     * @param action.payload.translate - Saved pan offset
     */
    restoreViewport(
      state,
      action: PayloadAction<{ scale: number; translate: Point }>
    ) {
      const { scale, translate } = action.payload;
      
      // Apply saved values with bounds checking
      state.scale = clamp(scale, state.minScale, state.maxScale);
      state.translate.x = translate.x;
      state.translate.y = translate.y;
      
      // Reset interaction state (user not mid-pan when loading)
      state.mode = "idle";
      state.panStartScreen = null;
      state.panStartTranslate = null;
    },
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Export all action creators for use in components
 * 
 * Usage examples:
 * - dispatch(wheelZoom({ deltaY: -53, originScreen: mousePos }))
 * - dispatch(panStart({ screen: mousePos }))
 * - dispatch(zoomToFit({ bounds: contentBounds, viewportPx: { width: 1920, height: 1080 } }))
 */
export const {
  setTranslate,
  setScale,
  zoomBy,
  wheelZoom,
  wheelPan,
  panStart,
  panMove,
  panEnd,
  handToolEnable,
  handToolDisable,
  centerOnWorld,
  zoomToFit,
  resetView,
  restoreViewport,
} = viewportSlice.actions;

/**
 * Export the reducer to be included in the Redux store
 */
export default viewportSlice.reducer;