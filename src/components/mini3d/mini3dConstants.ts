import { TILE_SIZE_BASE } from "../../constants";

// -----------------------------------------------------------------------------
// Camera Orbit Defaults
// -----------------------------------------------------------------------------
// Initial horizontal orbit angle (radians) when overlay opens.
export const DEFAULT_YAW = -Math.PI / 4;
// Initial vertical orbit tilt (radians) when overlay opens.
export const DEFAULT_PITCH = 0.55;
// Minimum allowed orbit pitch (radians) to avoid flipping under the floor.
export const MIN_PITCH = 0.2;
// Maximum allowed orbit pitch (radians) to avoid near-top-down clipping.
export const MAX_PITCH = 1.35;
// Minimum baseline orbit distance for empty/small scenes.
export const MIN_ORBIT_DISTANCE = 6.5;

// -----------------------------------------------------------------------------
// Interaction Tuning
// -----------------------------------------------------------------------------
// Pointer drag sensitivity for yaw/pitch orbit updates.
export const DRAG_SENSITIVITY = 0.006;
// Wheel zoom sensitivity (larger value means faster zoom per wheel tick).
// Uses exponential scaling in Mini3DOverlay.
export const CAMERA_DISTANCE_WHEEL_SENSITIVITY = 0.0007;
// Default camera distance scale multiplier.
export const CAMERA_DISTANCE_SCALE_DEFAULT = 1;
// Minimum camera distance scale multiplier (zoom in limit).
export const CAMERA_DISTANCE_SCALE_MIN = 0.3;
// Maximum camera distance scale multiplier (zoom out limit).
export const CAMERA_DISTANCE_SCALE_MAX = 1.15;

// -----------------------------------------------------------------------------
// Overlay and Convergence Animation
// -----------------------------------------------------------------------------
// Overlay fade-in duration in milliseconds.
export const OPEN_FADE_MS = 500;
// Final overlay opacity when open.
export const OVERLAY_OPACITY = 0.85;
// Per-object convergence move duration in milliseconds.
export const CONVERGENCE_ANIMATION_MS = 600;
// Stagger delay between object convergence starts in milliseconds.
export const PER_COMPONENT_DELAY_MS = 40;
// Base close/open window for convergence timing in milliseconds.
export const CONVERGENCE_BASE_TOTAL_MS = 800;

// -----------------------------------------------------------------------------
// Scene Units and Ground
// -----------------------------------------------------------------------------
// Converts canvas millimeters into mini3d world units.
export const WORLD_SCALE = 0.01;
// Distance each object starts from/returns to during convergence.
export const CONVERGENCE_OFFSET_DISTANCE = 180 * WORLD_SCALE;
// Minimum rendered box height (world units) to keep thin objects visible.
export const MIN_BOX_HEIGHT = 0.12;
// Y position of the floor plane in world space.
export const GROUND_Y = -1.01;
// Floor mesh size (world units).
export const GROUND_PLANE_SIZE = 5000;
// Match 2D canvas background tile size (TILE_SIZE_BASE * 0.5) at zoom=1.
export const GROUND_TILE_WORLD_SIZE = (TILE_SIZE_BASE * 0.5) * WORLD_SCALE;

// -----------------------------------------------------------------------------
// Camera Auto-Fit and Smoothing
// -----------------------------------------------------------------------------
// Padding from viewport edges when fitting content (pixels).
export const FIT_PADDING_PX = 24;
// Hard cap for camera distance used by fit and render cameras.
export const FIT_MAX_DISTANCE = 4000;
// Per-frame lerp factor for smooth distance convergence.
export const DISTANCE_LERP = 0.12;
// Max distance change per frame to avoid large camera jumps.
export const MAX_DISTANCE_STEP = 0.35;

// -----------------------------------------------------------------------------
// Box Motion and Texture Fallback
// -----------------------------------------------------------------------------
// Position/rotation transition duration for layout updates (milliseconds).
export const BOX_TRANSITION_MS = 220;
// Epsilon threshold for deciding if a box transform actually changed.
export const BOX_TRANSITION_EPSILON = 0.0001;
// 1x1 transparent texture fallback to satisfy loader when no image exists.
export const EMPTY_IMAGE_DATA_URI = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

// -----------------------------------------------------------------------------
// Material Tuning: Devices
// -----------------------------------------------------------------------------
// Base roughness for device box side faces.
export const DEVICE_ROUGHNESS = 0.28;
// Base metalness for device box side faces.
export const DEVICE_METALNESS = 0.72;
// Roughness for device top face when using image texture.
export const DEVICE_TOP_IMAGE_ROUGHNESS = 0.36;
// Metalness for device top face when using image texture.
export const DEVICE_TOP_IMAGE_METALNESS = 0.14;

// -----------------------------------------------------------------------------
// Material Tuning: Boards
// -----------------------------------------------------------------------------
// Base roughness for board box side faces.
export const BOARD_ROUGHNESS = 0.22;
// Base metalness for board box side faces.
export const BOARD_METALNESS = 0.66;
// Roughness for board top face when using image texture.
export const BOARD_TOP_IMAGE_ROUGHNESS = 0.66;
// Metalness for board top face when using image texture.
export const BOARD_TOP_IMAGE_METALNESS = 0.14;

// -----------------------------------------------------------------------------
// Color Fallbacks
// -----------------------------------------------------------------------------
// Default CSS color for devices when source object has no color.
export const MINI3D_DEFAULT_DEVICE_COLOR = "rgb(108, 116, 132)";
// Parsed RGB fallback if color parsing fails.
export const MINI3D_PARSE_FALLBACK_COLOR = { r: 108, g: 116, b: 132 } as const;
