import {
  createSlice,
  createEntityAdapter,
  nanoid,
  PayloadAction,
  EntityState,
} from "@reduxjs/toolkit";
import type { Point } from "../viewport";

/**
 * SHAPES REDUX SLICE
 * 
 * This module manages the state for a design/drawing application canvas.
 * It handles various drawing tools, shape creation, selection, and manipulation.
 * 
 * Key Features:
 * - Multiple shape types (frames, rectangles, ellipses, text, etc.)
 * - Tool management (select, draw, erase)
 * - Shape selection and multi-selection
 * - Normalized state management using Entity Adapter
 * - Project save/load functionality
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Available drawing tools in the application
 * - select: Select and move existing shapes
 * - frame: Create container frames (like artboards)
 * - rect: Draw rectangles
 * - ellipse: Draw ellipses/circles
 * - freedraw: Freehand drawing with pen/mouse
 * - arrow: Draw arrows with arrowheads
 * - line: Draw straight lines
 * - text: Add text elements
 * - eraser: Remove parts of drawings
 */
export type Tool =
  | "select"
  | "frame"
  | "rect"
  | "ellipse"
  | "freedraw"
  | "arrow"
  | "line"
  | "text"
  | "eraser";

/**
 * Base properties shared by all shape types
 * These properties control the visual appearance of shapes
 */
export interface BaseShape {
  id: string;              // Unique identifier for the shape
  stroke: string;          // Border/outline color (hex or rgba)
  strokeWidth: number;     // Border thickness in pixels
  fill?: string | null;    // Optional fill color
}

/**
 * Frame Shape - Container for grouping other shapes
 * Similar to artboards in Figma or frames in design tools
 * Used to organize designs into separate screens or sections
 */
export interface FrameShape extends BaseShape {
  type: "frame";
  x: number;              // X position on canvas
  y: number;              // Y position on canvas
  w: number;              // Width in pixels
  h: number;              // Height in pixels
  frameNumber: number;    // Sequential number for ordering frames
}

/**
 * Rectangle Shape - Basic rectangular element
 */
export interface RectShape extends BaseShape {
  type: "rect";
  x: number;              // Top-left X position
  y: number;              // Top-left Y position
  w: number;              // Width
  h: number;              // Height
}

/**
 * Ellipse Shape - Circular or oval element
 * Width and height define the bounding box
 */
export interface EllipseShape extends BaseShape {
  type: "ellipse";
  x: number;              // Bounding box top-left X
  y: number;              // Bounding box top-left Y
  w: number;              // Bounding box width
  h: number;              // Bounding box height
}

/**
 * Free Draw Shape - Hand-drawn path
 * Stores an array of points that define the drawing path
 */
export interface FreeDrawShape extends BaseShape {
  type: "freedraw";
  points: Point[];        // Array of {x, y} coordinates
}

/**
 * Arrow Shape - Line with arrowhead at the end
 * Useful for diagrams and annotations
 */
export interface ArrowShape extends BaseShape {
  type: "arrow";
  startX: number;         // Arrow tail X position
  startY: number;         // Arrow tail Y position
  endX: number;           // Arrow head X position
  endY: number;           // Arrow head Y position
}

/**
 * Line Shape - Simple straight line
 */
export interface LineShape extends BaseShape {
  type: "line";
  startX: number;         // Line start X position
  startY: number;         // Line start Y position
  endX: number;           // Line end X position
  endY: number;           // Line end Y position
}

/**
 * Text Shape - Rich text element with full typography control
 * Supports various text styling options similar to design tools
 */
export interface TextShape extends BaseShape {
  type: "text";
  x: number;                                                      // Text position X
  y: number;                                                      // Text position Y
  text: string;                                                   // Text content
  fontSize: number;                                               // Font size in pixels
  fontFamily: string;                                             // Font family name
  fontWeight: number;                                             // Font weight (100-900)
  fontStyle: "normal" | "italic";                                 // Font style
  textAlign: "left" | "center" | "right";                         // Horizontal alignment
  textDecoration: "none" | "underline" | "line-through";          // Text decoration
  lineHeight: number;                                             // Line height multiplier
  letterSpacing: number;                                          // Letter spacing in pixels
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize"; // Text transformation
}

/**
 * Generated UI Shape - AI-generated user interface components
 * This special shape type stores HTML/UI specifications generated by AI
 * and can be rendered as interactive UI elements on the canvas
 */
export interface GeneratedUIShape extends BaseShape {
  type: "generatedui";
  x: number;                  // Position X
  y: number;                  // Position Y
  w: number;                  // Width
  h: number;                  // Height
  uiSpecData: string | null;  // HTML markup or UI specification as string
  sourceFrameId: string;      // ID of the frame this was generated from
  isWorkflowPage?: boolean;   // Flag to identify if this is a workflow page
}

/**
 * Union type of all possible shape types
 * This discriminated union allows TypeScript to narrow types based on the 'type' field
 */
export type Shape =
  | FrameShape
  | RectShape
  | EllipseShape
  | FreeDrawShape
  | ArrowShape
  | LineShape
  | TextShape
  | GeneratedUIShape;

// ============================================================================
// ENTITY ADAPTER SETUP
// ============================================================================

/**
 * Entity Adapter for normalized shape storage
 * 
 * Benefits of using Entity Adapter:
 * - Normalized data structure (prevents duplication)
 * - O(1) lookups by ID
 * - Built-in CRUD operations
 * - Automatic management of ids array and entities object
 * 
 * Structure created:
 * {
 *   ids: ['id1', 'id2', 'id3'],  // Array of all shape IDs
 *   entities: {                   // Object map for fast lookups
 *     'id1': {...shape1},
 *     'id2': {...shape2},
 *     'id3': {...shape3}
 *   }
 * }
 */
const shapesAdapter = createEntityAdapter<Shape, string>({
  selectId: (s) => s.id, // Tell adapter which field is the unique ID
});

/**
 * Selection Map - Tracks which shapes are currently selected
 * Using an object instead of array for O(1) lookup performance
 * Example: { 'shape-id-1': true, 'shape-id-2': true }
 */
type SelectionMap = Record<string, true>;

/**
 * Main state interface for the shapes slice
 */
interface ShapesState {
  tool: Tool;                            // Currently active drawing tool
  shapes: EntityState<Shape, string>;    // Normalized shape storage
  selected: SelectionMap;                // Currently selected shape IDs
  frameCounter: number;                  // Counter for auto-numbering frames
}

/**
 * Initial state when application starts
 */
const initialState: ShapesState = {
  tool: "select",                        // Start with select tool active
  shapes: shapesAdapter.getInitialState(), // Empty normalized state
  selected: {},                          // No shapes selected initially
  frameCounter: 0,                       // No frames created yet
};

// ============================================================================
// CONSTANTS AND DEFAULTS
// ============================================================================

/**
 * Default styling values for shapes
 * Applied when specific values are not provided
 */
const DEFAULTS = { 
  stroke: "#ffff",           // Default white stroke
  strokeWidth: 2 as const    // Default 2px stroke width
};

// ============================================================================
// SHAPE FACTORY FUNCTIONS
// ============================================================================

/**
 * Creates a new Frame shape with default values
 * Frames have transparent borders and a subtle fill by default
 * 
 * @param p - Frame parameters (position, size, styling)
 * @returns Fully configured FrameShape object
 */
const makeFrame = (p: {
  x: number;
  y: number;
  w: number;
  h: number;
  frameNumber: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
}): FrameShape => ({
  id: nanoid(),                          // Generate unique ID
  type: "frame",
  x: p.x,
  y: p.y,
  w: p.w,
  h: p.h,
  frameNumber: p.frameNumber,
  stroke: "transparent",                 // Frames have no visible border
  strokeWidth: 0,
  fill: p.fill ?? "rgba(255, 255, 255, 0.05)", // Subtle white overlay
});

/**
 * Creates a new Rectangle shape
 * 
 * @param p - Rectangle parameters
 * @returns Fully configured RectShape object
 */
const makeRect = (p: {
  x: number;
  y: number;
  w: number;
  h: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
}): RectShape => ({
  id: nanoid(),
  type: "rect",
  x: p.x,
  y: p.y,
  w: p.w,
  h: p.h,
  stroke: p.stroke ?? DEFAULTS.stroke,        // Use default if not provided
  strokeWidth: p.strokeWidth ?? DEFAULTS.strokeWidth,
  fill: p.fill ?? null,                       // No fill by default
});

/**
 * Creates a new Ellipse shape
 * 
 * @param p - Ellipse parameters
 * @returns Fully configured EllipseShape object
 */
const makeEllipse = (p: {
  x: number;
  y: number;
  w: number;
  h: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
}): EllipseShape => ({
  id: nanoid(),
  type: "ellipse",
  x: p.x,
  y: p.y,
  w: p.w,
  h: p.h,
  stroke: p.stroke ?? DEFAULTS.stroke,
  strokeWidth: p.strokeWidth ?? DEFAULTS.strokeWidth,
  fill: p.fill ?? null,
});

/**
 * Creates a new Free Draw shape from an array of points
 * 
 * @param p - Free draw parameters including points array
 * @returns Fully configured FreeDrawShape object
 */
const makeFree = (p: {
  points: Point[];
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
}): FreeDrawShape => ({
  id: nanoid(),
  type: "freedraw",
  points: p.points,                           // Store the drawing path
  stroke: p.stroke ?? DEFAULTS.stroke,
  strokeWidth: p.strokeWidth ?? DEFAULTS.strokeWidth,
  fill: p.fill ?? null,
});

/**
 * Creates a new Arrow shape
 * Arrow points from (startX, startY) to (endX, endY)
 * 
 * @param p - Arrow parameters (start and end coordinates)
 * @returns Fully configured ArrowShape object
 */
const makeArrow = (p: {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
}): ArrowShape => ({
  id: nanoid(),
  type: "arrow",
  startX: p.startX,
  startY: p.startY,
  endX: p.endX,
  endY: p.endY,
  stroke: p.stroke ?? DEFAULTS.stroke,
  strokeWidth: p.strokeWidth ?? DEFAULTS.strokeWidth,
  fill: p.fill ?? null,
});

/**
 * Creates a new Line shape
 * 
 * @param p - Line parameters (start and end coordinates)
 * @returns Fully configured LineShape object
 */
const makeLine = (p: {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
}): LineShape => ({
  id: nanoid(),
  type: "line",
  startX: p.startX,
  startY: p.startY,
  endX: p.endX,
  endY: p.endY,
  stroke: p.stroke ?? DEFAULTS.stroke,
  strokeWidth: p.strokeWidth ?? DEFAULTS.strokeWidth,
  fill: p.fill ?? null,
});

/**
 * Creates a new Text shape with comprehensive typography options
 * Includes sensible defaults for all text styling properties
 * 
 * @param p - Text parameters including content and styling
 * @returns Fully configured TextShape object
 */
const makeText = (p: {
  x: number;
  y: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  fontStyle?: "normal" | "italic";
  textAlign?: "left" | "center" | "right";
  textDecoration?: "none" | "underline" | "line-through";
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
}): TextShape => ({
  id: nanoid(),
  type: "text",
  x: p.x,
  y: p.y,
  text: p.text ?? "Type here...",              // Placeholder text
  fontSize: p.fontSize ?? 16,                   // 16px default size
  fontFamily: p.fontFamily ?? "Inter, sans-serif",
  fontWeight: p.fontWeight ?? 400,              // Normal weight
  fontStyle: p.fontStyle ?? "normal",
  textAlign: p.textAlign ?? "left",
  textDecoration: p.textDecoration ?? "none",
  lineHeight: p.lineHeight ?? 1.2,              // 1.2x line height
  letterSpacing: p.letterSpacing ?? 0,
  textTransform: p.textTransform ?? "none",
  stroke: p.stroke ?? DEFAULTS.stroke,
  strokeWidth: p.strokeWidth ?? DEFAULTS.strokeWidth,
  fill: p.fill ?? "#ffffff",                    // White text by default
});

/**
 * Creates a new Generated UI shape
 * This shape type stores AI-generated UI components as HTML/markup
 * Allows optional custom ID for regenerating existing UI shapes
 * 
 * @param p - Generated UI parameters including HTML spec data
 * @returns Fully configured GeneratedUIShape object
 */
const makeGeneratedUI = (p: {
  x: number;
  y: number;
  w: number;
  h: number;
  uiSpecData: string | null;        // HTML markup as string
  sourceFrameId: string;            // Reference to source frame
  id?: string;                      // Optional custom ID
  stroke?: string;
  strokeWidth?: number;
  fill?: string | null;
  isWorkflowPage?: boolean;         // Flag for workflow identification
}): GeneratedUIShape => ({
  id: p.id ?? nanoid(),              // Use provided ID or generate new one
  type: "generatedui",
  x: p.x,
  y: p.y,
  w: p.w,
  h: p.h,
  uiSpecData: p.uiSpecData,
  sourceFrameId: p.sourceFrameId,
  isWorkflowPage: p.isWorkflowPage,
  stroke: "transparent",             // No visible border for UI components
  strokeWidth: 0,
  fill: p.fill ?? null,
});

// ============================================================================
// REDUX SLICE DEFINITION
// ============================================================================

/**
 * Main Redux slice for shapes management
 * Contains all reducers (state update functions) for shape operations
 */
const shapesSlice = createSlice({
  name: "shapes",
  initialState,
  reducers: {
    // ------------------------------------------------------------------------
    // TOOL MANAGEMENT
    // ------------------------------------------------------------------------
    
    /**
     * Sets the currently active drawing tool
     * Automatically clears selection when switching from select tool to prevent
     * accidental modifications of selected shapes
     * 
     * @param action.payload - The tool to activate
     */
    setTool(state, action: PayloadAction<Tool>) {
      state.tool = action.payload;
      // Clear selection when switching to any tool except select
      if (action.payload !== "select") state.selected = {};
    },

    // ------------------------------------------------------------------------
    // SHAPE CREATION ACTIONS
    // ------------------------------------------------------------------------

    /**
     * Adds a new frame to the canvas
     * Automatically increments frame counter and assigns frame number
     * Frame numbers are used for organizing and sorting frames
     * 
     * @param action.payload - Frame parameters (without frameNumber)
     */
    addFrame(
      state,
      action: PayloadAction<
        Omit<Parameters<typeof makeFrame>[0], "frameNumber">
      >
    ) {
      state.frameCounter += 1;                   // Increment before using
      const frameWithNumber = {
        ...action.payload,
        frameNumber: state.frameCounter,         // Assign current counter value
      };
      shapesAdapter.addOne(state.shapes, makeFrame(frameWithNumber));
    },

    /**
     * Adds a new rectangle to the canvas
     * 
     * @param action.payload - Rectangle parameters
     */
    addRect(state, action: PayloadAction<Parameters<typeof makeRect>[0]>) {
      shapesAdapter.addOne(state.shapes, makeRect(action.payload));
    },

    /**
     * Adds a new ellipse to the canvas
     * 
     * @param action.payload - Ellipse parameters
     */
    addEllipse(
      state,
      action: PayloadAction<Parameters<typeof makeEllipse>[0]>
    ) {
      shapesAdapter.addOne(state.shapes, makeEllipse(action.payload));
    },

    /**
     * Adds a new free draw shape to the canvas
     * Validates that points array exists and is not empty before adding
     * 
     * @param action.payload - Free draw parameters including points
     */
    addFreeDrawShape(
      state,
      action: PayloadAction<Parameters<typeof makeFree>[0]>
    ) {
      const { points } = action.payload;
      // Don't add if there are no points to draw
      if (!points || points.length === 0) return;
      shapesAdapter.addOne(state.shapes, makeFree(action.payload));
    },

    /**
     * Adds a new arrow to the canvas
     * 
     * @param action.payload - Arrow parameters
     */
    addArrow(state, action: PayloadAction<Parameters<typeof makeArrow>[0]>) {
      shapesAdapter.addOne(state.shapes, makeArrow(action.payload));
    },

    /**
     * Adds a new line to the canvas
     * 
     * @param action.payload - Line parameters
     */
    addLine(state, action: PayloadAction<Parameters<typeof makeLine>[0]>) {
      shapesAdapter.addOne(state.shapes, makeLine(action.payload));
    },

    /**
     * Adds a new text element to the canvas
     * 
     * @param action.payload - Text parameters
     */
    addText(state, action: PayloadAction<Parameters<typeof makeText>[0]>) {
      shapesAdapter.addOne(state.shapes, makeText(action.payload));
    },

    /**
     * Adds a new generated UI component to the canvas
     * 
     * @param action.payload - Generated UI parameters
     */
    addGeneratedUI(
      state,
      action: PayloadAction<Parameters<typeof makeGeneratedUI>[0]>
    ) {
      shapesAdapter.addOne(state.shapes, makeGeneratedUI(action.payload));
    },

    // ------------------------------------------------------------------------
    // SHAPE MANIPULATION ACTIONS
    // ------------------------------------------------------------------------

    /**
     * Updates specific properties of an existing shape
     * Uses partial updates - only provided properties are changed
     * 
     * Example: updateShape({ id: 'abc', patch: { fill: '#ff0000' } })
     * 
     * @param action.payload.id - ID of shape to update
     * @param action.payload.patch - Partial shape object with properties to update
     */
    updateShape(
      state,
      action: PayloadAction<{ id: string; patch: Partial<Shape> }>
    ) {
      const { id, patch } = action.payload;
      shapesAdapter.updateOne(state.shapes, { id, changes: patch });
    },

    /**
     * Removes a shape from the canvas
     * Also removes it from selection if it was selected
     * If removing a frame, decrements the frame counter
     * 
     * @param action.payload - ID of shape to remove
     */
    removeShape(state, action: PayloadAction<string>) {
      const id = action.payload;
      const shape = state.shapes.entities[id];
      
      // Decrement frame counter if deleting a frame
      if (shape?.type === "frame") {
        state.frameCounter = Math.max(0, state.frameCounter - 1);
      }
      
      shapesAdapter.removeOne(state.shapes, id);
      delete state.selected[id];          // Remove from selection
    },

    /**
     * Clears all shapes from the canvas
     * Resets everything to initial state
     */
    clearAll(state) {
      shapesAdapter.removeAll(state.shapes);
      state.selected = {};
      state.frameCounter = 0;
    },

    // ------------------------------------------------------------------------
    // SELECTION MANAGEMENT ACTIONS
    // ------------------------------------------------------------------------

    /**
     * Adds a shape to the current selection
     * Allows multi-selection by keeping existing selections
     * 
     * @param action.payload - ID of shape to select
     */
    selectShape(state, action: PayloadAction<string>) {
      state.selected[action.payload] = true;
    },

    /**
     * Removes a shape from the current selection
     * 
     * @param action.payload - ID of shape to deselect
     */
    deselectShape(state, action: PayloadAction<string>) {
      delete state.selected[action.payload];
    },

    /**
     * Clears all shape selections
     */
    clearSelection(state) {
      state.selected = {};
    },

    /**
     * Selects all shapes on the canvas
     * Useful for bulk operations like moving or styling all shapes
     */
    selectAll(state) {
      const ids = state.shapes.ids as string[];
      // Convert array of IDs to selection map: ['id1', 'id2'] -> { id1: true, id2: true }
      state.selected = Object.fromEntries(ids.map((id) => [id, true]));
    },

    /**
     * Deletes all currently selected shapes
     * Clears selection after deletion
     */
    deleteSelected(state) {
      const ids = Object.keys(state.selected);
      if (ids.length) shapesAdapter.removeMany(state.shapes, ids);
      state.selected = {};
    },

    // ------------------------------------------------------------------------
    // PROJECT MANAGEMENT ACTIONS
    // ------------------------------------------------------------------------

    /**
     * Loads a complete project state
     * Used when opening saved projects or restoring from backup
     * Replaces entire current state with loaded data
     * 
     * @param action.payload - Complete shapes state to load
     */
    loadProject(
      state,
      action: PayloadAction<{
        shapes: EntityState<Shape, string>;
        tool: Tool;
        selected: SelectionMap;
        frameCounter: number;
      }>
    ) {
      // Replace all state with loaded project data
      state.shapes = action.payload.shapes;
      state.tool = action.payload.tool;
      state.selected = action.payload.selected;
      state.frameCounter = action.payload.frameCounter;
    },
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Export all action creators
 * These are used by components to dispatch state changes
 * Example: dispatch(addRect({ x: 0, y: 0, w: 100, h: 100 }))
 */
export const {
  setTool,
  addFrame,
  addRect,
  addEllipse,
  addFreeDrawShape,
  addArrow,
  addLine,
  addText,
  addGeneratedUI,
  updateShape,
  removeShape,
  clearAll,
  selectShape,
  deselectShape,
  clearSelection,
  selectAll,
  deleteSelected,
  loadProject,
} = shapesSlice.actions;

/**
 * Export the reducer to be included in the Redux store
 */
export default shapesSlice.reducer;