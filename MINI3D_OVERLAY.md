# Mini3D Overlay — Exhaustive Behavioral & Visual Specification

---

## 1. High-Level Overview

The Mini3D Overlay is a **pure CSS 3D** visualization of the user's pedalboard. It renders every canvas object (pedals, boards, power supplies, etc.) as a **colored cuboid** (rectangular box) floating in a perspective-projected 3D scene. The overlay appears as a semi-transparent floating panel pinned to the bottom-left corner of the viewport. It can be expanded to fullscreen. The user can rotate the scene by dragging.

There is **no WebGL, no `<canvas>`, no Three.js**. Everything is achieved with CSS `perspective`, `transform-style: preserve-3d`, `rotateX`/`rotateY`, and `translate3d` applied to plain `<div>` elements.

---

## 2. Activation & Mounting

### 2.1. Toggle Source

The 3D view is toggled via the "3D" button in the right-side toolbar (`SideControls`). This sets `showMini3d` in `UiContext`. When `showMini3d` becomes `true`, `App.tsx` sets a local `mini3dMounted` state to `true`, which mounts the `<Mini3DOverlay>` component. When the overlay finishes its close animation, it calls `onCloseComplete`, which sets `mini3dMounted` back to `false`, unmounting the component entirely.

### 2.2. Side Effects on Open

When `showMini3d` becomes `true`, `App.tsx` immediately:
- Hides all floating UI (`setFloatingUiVisible(false)`)
- Collapses the catalog panel (`setPanelExpanded(false)`)

This ensures the 3D overlay is not visually obstructed by other panels.

### 2.3. Internal Visibility

Internally, `Mini3DOverlay` maintains its own `isVisible` boolean. When `showMini3d` turns `true`, it sets `isVisible = true` (which triggers rendering). When the close animation completes, it sets `isVisible = false` (which returns `null` from the render). The component early-returns `null` when `isVisible` is `false`.

---

## 3. Lifecycle Phases

The overlay has a three-phase lifecycle managed by the `phase` state variable:

### 3.1. Phase: `"opening"`

- Triggered when `showMini3d` transitions from `false` to `true`.
- The overlay container fades in from `opacity: 0` to `opacity: 0.85` over **500ms** (`OPEN_FADE_MS`) with `ease` timing.
- Each cuboid plays its **convergence-in animation** (items fly inward from scattered positions to their correct 3D positions). The animation uses a **staggered delay**: the first item starts immediately, each subsequent item starts **40ms** later (`PER_COMPONENT_DELAY`).
- After the total convergence time elapses (800ms base + (N-1) × 40ms), phase transitions to `"open"`.

### 3.2. Phase: `"open"`

- The steady state. All cuboids are at rest in their correct positions.
- The auto-fit algorithm no longer pads for convergence animation offsets (convergencePad becomes 0), so the scene may subtly reframe itself.
- The user can rotate the scene freely. Overlay opacity is stable at 0.85.

### 3.3. Phase: `"closing"`

- Triggered when `showMini3d` transitions from `true` to `false`.
- Each cuboid plays its **convergence-out animation** (items fly outward from their positions to scattered offsets). Same staggered delay pattern.
- The overlay fades out from `opacity: 0.85` to `opacity: 0` over the total convergence time, using `linear` timing (not ease).
- After the convergence time elapses, `isVisible` is set to `false` and `onCloseComplete` is called.
- Fullscreen is disabled. Any active rotation drag is cancelled.

### 3.4. Convergence Total Time

```
convergenceTotal = 800ms + max(0, objectCount - 1) × 40ms
```

Examples:
- 1 object: 800ms
- 5 objects: 960ms
- 10 objects: 1160ms
- 20 objects: 1560ms

---

## 4. Visual Layout & Positioning

### 4.1. Default (Non-Fullscreen) Position

The overlay is positioned with `position: fixed`:
- **Left edge**: offset from the left viewport edge by `$floating-panel-offset` (a SCSS variable).
- **Bottom edge**: offset from the bottom viewport edge by `$floating-panel-offset`.
- **Width**: `clamp($mini3d-width-min, 50vw, $mini3d-width-max)` — responsive, between a minimum and maximum, preferring half the viewport width.
- **Height**: `clamp($mini3d-height-min, 50vh, $mini3d-height-max)` — responsive, between a minimum and maximum, preferring half the viewport height.
- The `top` is computed as `100vh - $floating-panel-offset - height`.
- `z-index`: `$z-mini3d` (a SCSS variable).
- `transform-origin`: `left bottom`.
- `cursor`: `pointer`.

### 4.2. Mobile (≤768px)

- **Left edge**: `$floating-panel-offset-sm` (smaller offset).
- **Width**: `clamp($mini3d-width-min-mobile, 35vw, $mini3d-width-max-mobile)` — smaller, preferring 35% of viewport width.
- **Height**: `clamp($mini3d-height-min-mobile, 35vh, $mini3d-height-max-mobile)` — smaller, preferring 35% of viewport height.
- **Top**: recalculated with mobile dimensions and offset.
- Instruction text: font-size drops from 12px to 11px; padding from 8px to 6px.

### 4.3. Fullscreen

When toggled to fullscreen:
- `top: 0; left: 0; width: 100vw; height: 100vh;`
- Background: `rgba(0, 0, 0, 0)` (transparent — the backdrop handles dimming).
- Cursor: `zoom-out`.
- Transition: the size/position change animates over **360ms** with `ease` timing (CSS transition on width, height, left, top).

### 4.4. Backdrop

A separate `<div class="mini3d-backdrop">` sits behind the overlay at `z-index: $z-mini3d - 1`. It is `position: fixed; inset: 0` covering the full viewport.
- Default: `opacity: 0; pointer-events: none` — invisible and non-interactive.
- When fullscreen AND (opening or open): `opacity: 1` — fully visible with `background: rgba(0, 0, 0, 0.69)`.
- When fullscreen AND closing: `opacity: 0` with linear timing matching the convergence total.
- The backdrop **never receives pointer events** (`pointer-events: none` always). All interaction goes through the overlay container.

### 4.5. Overlay Opacity

- Base overlay opacity: **0.85** (`BASE_OVERLAY_OPACITY`).
- Applied via CSS custom property `--mini3d-overlay-opacity`.
- During `opening` and `open` phases, the overlay's opacity is this value.
- During `closing` phase, opacity transitions to 0.
- The background of the overlay itself is `rgba(0, 0, 0, 0)` (fully transparent). The opacity is on the entire container, making the 3D content semi-transparent.

---

## 5. CSS 3D Rendering Architecture

### 5.1. DOM Hierarchy

```
div.mini3d-overlay                  ← fixed position, fades in/out
  div.mini3d-stage                  ← perspective container
    div.mini3d-world                ← scene transform (camera)
      div.mini3d-item-shift (×N)    ← convergence animation wrapper
        div.mini3d-box              ← object transform (position + rotation)
          div.mini3d-face--front    ← front face
          div.mini3d-face--back     ← back face
          div.mini3d-face--right    ← right face
          div.mini3d-face--left     ← left face
          div.mini3d-face--top      ← top face (may have image)
          div.mini3d-face--bottom   ← bottom face
  div.mini3d-instruction            ← text hint at bottom
```

### 5.2. Stage (Perspective Container)

- `position: absolute; inset: 0` — fills the overlay.
- `overflow: hidden` — clips any geometry that extends outside.
- `perspective`: dynamic, clamped between **60px** and **900px**, computed as `scene.maxDim × MINI3D_PERSPECTIVE_SCENE_FACTOR`. With drama knob at 1.0, the scene factor is `max(0.22, 1.9 - 1.0 × 1.35) = 0.55`.
- `perspective-origin: 50% 50%` — centered.
- `transform-style: preserve-3d`.

### 5.3. World (Camera Transform)

The world div is a zero-sized element centered in the stage (`left: 50%; top: 50%; width: 0; height: 0`). It carries `transform-style: preserve-3d` so its children exist in the same 3D space. Its transform is a chain of five operations applied via CSS custom properties:

```css
transform:
  translate3d(var(--mini3d-offset-x), var(--mini3d-offset-y), 0)   /* centering offset */
  translateZ(var(--mini3d-camera-z))                                /* camera pullback */
  scale(var(--mini3d-scale))                                        /* fit scale */
  rotateX(var(--mini3d-pitch))                                      /* tilt */
  rotateY(var(--mini3d-yaw));                                       /* orbit rotation */
```

- **offset-x, offset-y**: Pixel offsets to center the projected scene within the viewport. Computed by the auto-fit algorithm.
- **camera-z**: Negative value pulling the camera back. Clamped between -60px and -500px, computed as `-scene.maxDim × MINI3D_CAMERA_DISTANCE_SCENE_FACTOR`. With drama at 1.0, factor is `max(0.3, 1.15 - 1.0 × 0.57) = 0.58`.
- **scale**: Uniform scale to fit the scene. Found by binary search.
- **pitch**: Vertical tilt angle in radians. Base 0.35 rad plus user's pitch offset (initially 0.18 rad, so starting pitch = 0.53 rad ≈ 30°). Clamped to [0.15, 1.2] rad.
- **yaw**: Horizontal rotation angle in radians. Defaults to `-π/4` (−45°), giving an isometric-like angled view. Unbounded — user can rotate freely in either direction.

The world has `will-change: transform` for GPU acceleration.

---

## 6. Cuboid Construction (Per Object)

### 6.1. Dimensions

Each object is rendered as a rectangular box with:
- **Width** = object's width in mm (= pixels, since 1mm = 1px)
- **Depth** = object's depth in mm
- **Height** = object's height in mm (minimum 1px to ensure visibility)

These are set as CSS custom properties `--mini3d-width`, `--mini3d-depth`, `--mini3d-height` on the `.mini3d-box` element.

### 6.2. Positioning

The box is positioned in 3D space via `translate3d(centerX, centerY, centerZ)`:
- **centerX** = object's X position + half its width, minus the scene center X.
- **centerZ** = object's Y position (canvas Y maps to 3D Z) + half its depth, minus the scene center Y.
- **centerY** = `-(baseZ + height/2)` — negative because CSS Y-axis points down but "up" in the 3D scene is negative Y.

If the object has a rotation (0°, 90°, 180°, 270°), a `rotateY(rotation°)` is appended to the transform.

### 6.3. The Six Faces

Each face is a `<div>` with `position: absolute; left: 50%; top: 50%` (centered on the box origin). `backface-visibility: hidden` ensures only the outward-facing side is visible. Each face has a `1px solid rgba(0, 0, 0, 0.28)` border for edge definition. `box-sizing: border-box`.

| Face | Size | Transform |
|------|------|-----------|
| **Front** | width × height | `translate(-50%, -50%) translateZ(depth/2)` |
| **Back** | width × height | `translate(-50%, -50%) rotateY(180°) translateZ(depth/2)` |
| **Right** | depth × height | `translate(-50%, -50%) rotateY(90°) translateZ(width/2)` |
| **Left** | depth × height | `translate(-50%, -50%) rotateY(-90°) translateZ(width/2)` |
| **Top** | width × depth | `translate(-50%, -50%) rotateX(90°) translateZ(height/2)` |
| **Bottom** | width × depth | `translate(-50%, -50%) rotateX(-90°) translateZ(height/2)` |

---

## 7. Face Colors & Shading

### 7.1. Base Color

Each object's color is taken from `obj.color`, falling back to `DEFAULT_OBJECT_COLOR` if absent. The color is parsed into RGB using `parseColor()`, which handles:
- 3-digit hex (`#abc`)
- 6-digit hex (`#aabbcc`)
- `rgb(r, g, b)` / `rgba(r, g, b, a)` strings

If parsing fails, a fallback color of **RGB(72, 72, 82)** (dark grey-blue) is used.

### 7.2. Per-Face Shading

Each face receives a different brightness multiplier via the `shade()` function, which multiplies each RGB channel by a factor and clamps to 0–255. The result is formatted as `rgba(r, g, b, alpha)`.

| Face | Shade Factor | Alpha | Visual Effect |
|------|-------------|-------|---------------|
| **Top** | 1.05 | 0.96 | Slightly brighter than base (lit from above) |
| **Front** | 0.84 | 0.94 | Moderately shadowed |
| **Right** | 0.72 | 0.93 | More shadowed |
| **Left** | 0.64 | 0.93 | Darker still |
| **Back** | 0.58 | 0.92 | Very dark (facing away) |
| **Bottom** | 0.42 | 0.88 | Darkest, most transparent |

This creates a consistent directional lighting illusion: light comes from roughly above-front, faces away from the light are progressively darker. All faces are slightly translucent (alpha < 1.0), which gives the cuboids a subtle glass-like quality when objects overlap.

### 7.3. Top Face Image

If the object has an `image` property (a URL/path to a top-down photo), the top face displays it:
- `background-image: url("resolvedPath")`
- `background-position: center`
- `background-repeat: no-repeat`
- `background-size: cover`
- The image URL is resolved via `resolveImageSrc()`, which prepends `BASE_URL` for relative paths, or passes through absolute URLs, data URIs, and paths starting with `/`.

### 7.4. Top Face Lighting Overlay

The top face has a `::after` pseudo-element that adds a subtle gradient:
```css
background: linear-gradient(to bottom, rgba(255, 255, 255, 0.16), rgba(0, 0, 0, 0.14));
```
This simulates directional lighting across the top surface — slightly brighter at the "top" edge of the face, slightly darker at the "bottom" edge. The gradient is applied **on top of** both the solid color and any image, via `position: absolute; inset: 0; pointer-events: none`.

---

## 8. Object Stacking Algorithm

### 8.1. Purpose

When objects overlap in 2D (on the canvas), the 3D view stacks them vertically so they don't clip through each other. A pedal sitting on top of a pedalboard in the 2D canvas will appear physically resting on top of the board in 3D.

### 8.2. Algorithm

Objects are processed **in array order** (which corresponds to their z-order on canvas — earlier = below, later = above).

For each object:
1. Compute its 2D footprint as an axis-aligned bounding box (AABB), accounting for rotation (90° and 270° swap width/depth).
2. Initialize `baseZ = 0` (ground level).
3. Iterate through all previously placed objects. For each one whose footprint **overlaps** the current object's footprint (interior overlap, not edge-touching), set `baseZ = max(baseZ, previousObject.baseZ + previousObject.height)`.
4. Place the object at `baseZ`.

This means:
- Non-overlapping objects all sit at ground level (baseZ = 0).
- An object that overlaps one below it sits exactly on top of that object.
- An object overlapping multiple objects below it sits on top of the tallest one.
- Deeply nested stacking is supported (A on B on C).

### 8.3. Overlap Detection

Two axis-aligned rectangles overlap if and only if their interiors intersect. Edge-touching (sharing exactly an edge or corner) does **not** count as overlap. The check:

```
NOT (a.maxX ≤ b.minX OR a.minX ≥ b.maxX OR a.maxY ≤ b.minY OR a.minY ≥ b.maxY)
```

---

## 9. Scene Metrics & Auto-Fit

### 9.1. Scene Metrics

Computed from the stacked objects:
- **center**: The center point of the 2D bounding box enclosing all object footprints.
- **width**: Horizontal extent of the scene (X axis).
- **depth**: Vertical extent of the scene (Z axis, mapped from canvas Y).
- **maxZ**: The tallest point in the scene (highest baseZ + height of any object).
- **maxDim**: `max(width, depth, maxZ)` — used to scale perspective and camera distance.

If there are no objects, all metrics default to 1 (preventing division by zero).

### 9.2. Perspective & Camera Distance

Both are derived from `maxDim`:
- **Perspective** = `clamp(maxDim × 0.55, 60, 900)` px. Larger scenes get more perspective (less foreshortening per object, more natural look). Tiny scenes get at least 60px perspective. Capped at 900px.
- **Camera distance** = `-clamp(maxDim × 0.58, 60, 500)` px. Negative because the camera moves back along the Z axis. Larger scenes push the camera further back.

### 9.3. Auto-Fit Algorithm (Binary Search)

The goal: find the largest `scale` factor such that all 8 corners of the scene bounding box, when projected through the CSS perspective, fit within the available viewport area (minus padding).

**Available area**: `(containerWidth - 2 × VIEW_PADDING_PX) × (containerHeight - 2 × VIEW_PADDING_PX)`, where `VIEW_PADDING_PX = 6`.

**Bounding box corners**: The algorithm tests all 8 combinations of:
- X: `[-halfWidth - convergencePad, +halfWidth + convergencePad]`
- Y: `[-maxZ, 0]` (top of tallest object to ground)
- Z: `[-halfDepth - convergencePad, +halfDepth + convergencePad]`

Where `convergencePad` = 180 during opening/closing (to leave room for convergence animation offsets), and 0 during the `open` phase.

**Projection**: Each 3D corner is:
1. Rotated by the current yaw (Y-axis rotation).
2. Rotated by the current pitch (X-axis rotation).
3. Scaled by the candidate `scale`.
4. Translated by the camera distance along Z.
5. Perspective-projected: `screenX = x × (perspective / (perspective - z))`, same for Y.

**Binary search**:
1. Start with `low = 0.01`, `high = 0.12`.
2. Double `high` (×1.45) until the scene no longer fits, up to max 8.
3. Run 24 iterations of bisection between `low` and `high`.
4. Final scale = `low × 0.985` (slight safety margin), clamped to `[0.01, 8]`.

**Centering offset**: After finding the scale, project all corners one more time to find the projected bounding box center, then compute `offsetX` and `offsetY` to shift that center to the viewport center.

### 9.4. Fullscreen Scaling

When toggling to fullscreen:
1. The current (non-fullscreen) fit transform and container size are saved as `baseFit` and `baseSize`.
2. In fullscreen, the zoom scale is `min(fullscreenWidth / baseWidth, fullscreenHeight / baseHeight)`.
3. The base fit's scale and offsets are multiplied by this zoom scale.
4. This means the scene simply scales up proportionally to fill the larger area, without recomputing the fit from scratch.

---

## 10. Convergence Animation

### 10.1. Concept

When opening, each cuboid starts at a scattered position far from the center and animates inward to its correct position. When closing, the reverse happens — cuboids fly outward.

### 10.2. Offset Direction

Each object's convergence offset is computed based on its position relative to the scene center:
- `deltaX = objectCenterX - sceneCenterX`
- `deltaY = objectCenterY - sceneCenterY`
- The offset direction is this vector normalized, then scaled by **180** units (`CONVERGENCE_OFFSET_DISTANCE`).
- Objects near the top-left of the scene fly in from further top-left; objects near the bottom-right fly in from further bottom-right.
- If delta is (0,0), the direction defaults to magnitude 1 (preventing NaN).

### 10.3. CSS Keyframes

**`mini3d-converge-in`** (opening):
```
from: translate3d(offsetX, 0, offsetZ)   ← scattered position
to:   translate3d(0, 0, 0)               ← correct position
```

**`mini3d-converge-out`** (closing):
```
from: translate3d(0, 0, 0)               ← correct position
to:   translate3d(offsetX, 0, offsetZ)   ← scattered position
```

- Duration: **600ms**
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` — a smooth deceleration curve (ease-out-like).
- Fill mode: `both` (holds start state before delay, holds end state after).
- The Y component is always 0 — objects scatter horizontally (X and Z) only, not vertically.

### 10.4. Staggered Delay

Each item's delay is `index × PER_COMPONENT_DELAY` (40ms). This creates a cascade effect where objects appear to "rain in" one after another. The delay is set via `--mini3d-delay-ms` CSS custom property.

---

## 11. User Interaction

### 11.1. Orbit Rotation (Drag)

- **Trigger**: Pointer down (left button or touch) on the overlay.
- **Behavior**: Moving the pointer horizontally changes the yaw (orbit angle); moving vertically changes the pitch (tilt angle).
- **Sensitivity**: Both yaw and pitch use `0.006` radians per pixel of pointer movement (`ROTATE_DRAG_SENS`, `ROTATE_PITCH_SENS`).
- **Yaw**: Unbounded — the user can spin the scene freely in either direction. Defaults to `-π/4` (−45°).
- **Pitch**: Offset from a base of 0.35 rad. The pitch offset is clamped to `[-1.1, 1.1]` (`PITCH_OFFSET_MIN`, `PITCH_OFFSET_MAX`). With the base of 0.35, this gives an effective pitch range of `[0.15, 1.2]` radians (≈8.6° to ≈68.8°). You can look almost head-on or almost top-down, but never completely flat or completely vertical.
- **Initial pitch offset**: 0.18 rad, giving a starting effective pitch of 0.53 rad (≈30°).
- **Movement threshold**: The drag is not considered "moved" until the pointer travels ≥3px from the start. This is used internally to distinguish clicks from drags.
- **Pointer capture**: The overlay captures the pointer on drag start (`setPointerCapture`) and releases on drag end (`releasePointerCapture`). This prevents the drag from being interrupted if the pointer leaves the overlay bounds.
- **Right-click**: Ignored (button === 2 returns early).
- **Update mechanism**: During drag, `yawRef` and `pitchRef` are updated, then `syncCameraVars()` is called, which directly sets CSS custom properties on the world element. This bypasses React re-rendering for smooth 60fps updates.

### 11.2. Multi-Touch Rotation

When two fingers are on the overlay:
- The rotation pivot tracks the **center point** between the two fingers.
- The drag start position is reset to this center on the second finger down.
- Touch moves with ≥2 touches call `e.preventDefault()` to prevent browser scrolling/zooming.
- The rotation sensitivity is the same as single-pointer drag.

### 11.3. Double-Click / Double-Tap Fullscreen Toggle

- **Mouse**: Standard `onDoubleClick` event toggles fullscreen.
- **Touch**: Custom double-tap detection:
  - Time window: **320ms** (`DOUBLE_TAP_MS`) between taps.
  - Distance window: **24px** (`DOUBLE_TAP_DISTANCE`) maximum between tap positions.
  - Only fires when exactly 1 touch is active.
  - If double-tap is detected, the rotation drag is NOT started (returns early).

### 11.4. Instruction Text

When `showMini3d` is `true`, a text hint appears at the bottom of the overlay:

> "Click/tap and drag to rotate. Double click/tap to toggle fullscreen."

Styled as:
- Position: absolute, bottom-left corner with 8px inset (6px on mobile).
- Font: 12px (11px on mobile), line-height 1.3.
- Color: `#f5f5f5` (near-white), with `text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35)`.
- Background: `rgba(0, 0, 0, 0.45)` (semi-transparent black).
- Border-radius: 6px.
- `pointer-events: none` — clicks pass through to the overlay.

---

## 12. Transition & Animation Timing Summary

| Property | Duration | Easing | Context |
|----------|----------|--------|---------|
| Overlay opacity (opening) | 500ms | ease | Fade in |
| Overlay opacity (closing) | convergenceTotal | linear | Fade out |
| Backdrop opacity (opening) | 500ms | ease | Fade in (fullscreen only) |
| Backdrop opacity (closing) | convergenceTotal | linear | Fade out (fullscreen only) |
| Overlay size/position | 360ms | ease | Fullscreen toggle |
| Overlay background | 360ms | ease | Fullscreen toggle |
| Convergence animation | 600ms per item | cubic-bezier(0.22, 1, 0.36, 1) | Item fly-in/fly-out |
| Convergence delay | index × 40ms | — | Stagger |
| Box transform | 220ms | cubic-bezier(0.2, 0.9, 0.2, 1) | Cuboid repositioning |

---

## 13. Perspective Drama Knob

A single constant `MINI3D_PERSPECTIVE_DRAMA` (currently set to **1.0**) controls the overall "feel" of the 3D projection:

- **Range**: 0.0 (flat, orthographic-like) to 1.5 (very dramatic foreshortening).
- **Effect on perspective**: `perspectiveSceneFactor = max(0.22, 1.9 - drama × 1.35)`. At drama=0: factor=1.9 (huge perspective value → very flat). At drama=1: factor=0.55 (moderate perspective). At drama=1.5: factor=0.22 (tight perspective → strong foreshortening).
- **Effect on camera distance**: `cameraDistanceFactor = max(0.3, 1.15 - drama × 0.57)`. At drama=0: factor=1.15 (camera far back). At drama=1: factor=0.58 (camera closer). At drama=1.5: factor=0.30 (camera very close).
- The value is clamped to `[0, 1.5]` before use.

---

## 14. ResizeObserver

The overlay monitors its own size via `ResizeObserver`:
- Created when `isVisible` becomes true.
- Calls `getBoundingClientRect()` on each resize.
- Updates the `size` state (width, height) only if values actually changed (shallow equality check prevents unnecessary re-renders).
- Disconnected when the component unmounts or becomes invisible.
- Size is used by the auto-fit algorithm to determine available viewport area.

---

## 15. Edge Cases & Safety

### 15.1. Zero/Negative Dimensions

- Objects with width ≤ 0 or depth ≤ 0 are **skipped entirely** (not rendered in 3D).
- Height is clamped to `max(0, rawHeight)` in footprint computation, and then `max(1, height)` at render time — ensuring every rendered object has at least 1px of height (a wafer-thin disc rather than invisible).
- If there are no valid objects, scene metrics default to `{center: (0,0), width: 1, depth: 1, maxZ: 1, maxDim: 1}`.

### 15.2. Perspective Degenerate Cases

During projection, if `perspective - z ≤ 1`, the projection is considered degenerate (point is at or behind the camera). The `projectBounds` function returns `null`, and the `fits` function returns `false` for that scale. This prevents the binary search from choosing a scale that puts geometry behind the camera plane.

### 15.3. Re-open Before Close Completes

If `showMini3d` becomes `true` again before the close animation finishes:
- The close timer is cleared.
- `isVisible` is already `true` (never had a chance to become false).
- Phase transitions back to `"opening"`, and a new open timer starts.
- The `closeTimerRef` callback also checks `showMini3dRef.current` — if the overlay was re-opened, it skips the cleanup.

### 15.4. Component Unmount Cleanup

On unmount, all state is cleaned up:
- Rotation drag is stopped.
- Open and close timers are cleared.
- The ResizeObserver is disconnected.
- Touch event listeners are removed.

---

## 16. CSS Properties Reference

### 16.1. Custom Properties on `.mini3d-overlay`

| Property | Description | Source |
|----------|-------------|--------|
| `--mini3d-overlay-opacity` | Target opacity | `BASE_OVERLAY_OPACITY` (0.85) |
| `--mini3d-open-fade-ms` | Open fade duration | `OPEN_FADE_MS` (500ms) |
| `--mini3d-close-fade-ms` | Close fade duration | `convergenceTotal` |

### 16.2. Custom Properties on `.mini3d-stage`

| Property | Description |
|----------|-------------|
| `--mini3d-perspective` | CSS perspective value in px |

### 16.3. Custom Properties on `.mini3d-world`

| Property | Description |
|----------|-------------|
| `--mini3d-scale` | Uniform scene scale |
| `--mini3d-offset-x` | Horizontal centering offset in px |
| `--mini3d-offset-y` | Vertical centering offset in px |
| `--mini3d-camera-z` | Camera pullback distance (negative px) |
| `--mini3d-yaw` | Yaw rotation in rad |
| `--mini3d-pitch` | Pitch rotation in rad |

### 16.4. Custom Properties on `.mini3d-box`

| Property | Description |
|----------|-------------|
| `--mini3d-width` | Cuboid width in px |
| `--mini3d-depth` | Cuboid depth in px |
| `--mini3d-height` | Cuboid height in px |
| `--mini3d-top-color` | Top face rgba color |
| `--mini3d-front-color` | Front face rgba color |
| `--mini3d-back-color` | Back face rgba color |
| `--mini3d-right-color` | Right face rgba color |
| `--mini3d-left-color` | Left face rgba color |
| `--mini3d-bottom-color` | Bottom face rgba color |
| `--mini3d-top-image` | Top face background-image (url or none) |

### 16.5. Custom Properties on `.mini3d-item-shift`

| Property | Description |
|----------|-------------|
| `--mini3d-delay-ms` | Convergence animation delay |
| `--mini3d-conv-x` | Convergence X offset (unitless, multiplied by 1px in keyframes) |
| `--mini3d-conv-z` | Convergence Z offset (unitless, multiplied by 1px in keyframes) |

---

## 17. GPU Acceleration Hints

- `.mini3d-overlay`: `will-change: opacity`
- `.mini3d-world`: `will-change: transform`
- `.mini3d-box`: `will-change: transform`

These hints tell the browser to promote these elements to their own compositor layers for smoother animations. The `touch-action: none` on the overlay prevents the browser from intercepting touch gestures for scrolling or zooming.

---

## 18. What Is NOT Displayed

The 3D overlay does **not** show:
- Cables or cable routing
- Object labels or names
- Grid lines
- Rulers or measurements
- Selection highlights
- The canvas background texture
- Any interactive controls other than rotation and fullscreen toggle
- Object shadows (no drop shadows or ambient occlusion)
- Reflections or specular highlights (only diffuse shading via the shade factors)

It is purely a spatial visualization of object positions, sizes, and stacking relationships, with optional top-face images for object identification.
