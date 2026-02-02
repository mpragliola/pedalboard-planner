# PedalboardFactory — User Manual

Plan guitar pedalboard layouts by placing boards and pedals on a canvas. All items use real-world dimensions (mm).
Export a prompt for an LLM to estimate prices.

---

## Overview

<!-- SCREENSHOT: Main app interface with catalog panel (left), canvas with a few pedals/board, zoom controls (right), and board menu. Capture the full layout. -->

The app has four main areas:

1. **Catalog panel** (left) — Add boards and devices, switch unit (mm/in), filter and search
2. **Canvas** (center) — Arrange and edit objects
3. **Zoom controls** (right) — Zoom, view options, measurement tools, component list
4. **Board menu** (bottom-right) — New, Load, Save

---

## Catalog Panel

### Mode switch

Toggle between **Boards** and **Devices**. Each mode shows its own filters and list.

### Unit

Switch between **mm** and **in** for all dimensions (canvas grid, rulers, selection info, size filters).

### Adding from the catalog

**Boards:**

- Use the **Browse** button (▦) to open a visual grid of boards with images
- Or pick from the dropdown list (filtered by brand, search, size)
- Click an item to add it to the canvas (placed in the visible area)

**Devices (pedals, multifx, power units, controllers):**

- Same as boards: Browse for images, or use the dropdown
- Filter by **Type** (Pedals, Multifx, Power units, Controllers) and **Brand**
- Use **Search** to filter by name, brand, or model

**Size filters:**

- Set min/max Width and Depth with sliders
- Values follow the current unit (mm or in)
- **Reset filters** clears all active filters

### Custom items

Create boards or devices with custom dimensions:

- Set **Width** and **Depth** (mm or in)
- Pick a **Color**
- Enter a **Name** (optional)
- Click **Create**

Custom items have no catalog image; they appear as colored rectangles.

---

## Canvas

### Mouse

| Action                        | Result                                  |
| ----------------------------- | --------------------------------------- |
| **Left drag on empty canvas** | Pan                                     |
| **Middle drag**               | Pan (works anywhere, even over objects) |
| **Left drag on object**       | Move object                             |
| **Left click on object**      | Select (shows toolbar and info)         |
| **Left click on empty**       | Deselect                                |

### Touch

- **Single-finger drag** on empty canvas: pan
- **Single-finger drag** on object: move object
- **Pinch (2 fingers)**: zoom

### Scroll wheel

- **Scroll** on canvas: zoom in/out (centered on cursor)

---

## Selection & Editing

When one object is selected:

- **Selection toolbar** appears above it: Rotate 90°, Send to back, Delete
- **Info popup** shows name, width, depth, height in the current unit

### Rotate 90°

Rotates the object 90° clockwise. Affects footprint (width/depth swap at 90° and 270°).

### Send to back

Moves the object behind all others. Useful for overlapping boards and pedals.

### Delete

Removes the object. A confirmation dialog appears. Connectors linked to that object are removed.

---

## Zoom & View

### Zoom buttons

- **+** / **−** — Zoom in and out
- **Center view** — Pans and zooms to fit all objects

### View options

- **Grid** — Toggle grid (spacing matches unit: 10 mm or 1 in)
- **X-ray** — Make all objects 50% transparent to see overlaps

### Measurement tools

**Ruler** (rectangle):

- Drag to draw a rectangle
- Shows Width, Depth, Diagonal in the current unit
- Click again to fix the rectangle
- Click once more (or press **Esc**) to exit ruler mode

**Line ruler** (polyline, for cable length):

- Click to add points
- **Double-click** or press **Esc** to finish
- Shows total length

---

## Component List

Opened from the **List** icon in the zoom controls.

- **Components table** — All boards and devices on the canvas; remove any from here (with confirmation)
- **Connectors** — Audio, MIDI, expression cables between devices
  - Requires at least 2 components
  - Click **+ Add connector**, choose Device A, Device B, type (audio/midi/expression), and connector kinds (TS, TRS,
    MIDI, XLR, etc.)
  - Edit or remove existing connectors

Connectors are used in the **GPT prompt** when “Include materials” is checked.

---

## GPT / Price Estimate Prompt

Opened from the **GPT** button in the catalog panel header.

Generates a prompt you can paste into ChatGPT, Claude, Gemini, etc. to estimate the total price of your pedalboard.

### Options

- **Include my location** — Adds your location for local prices and stores; can type it or use **Load from browser**
- **Include materials** — Adds cables, velcro, etc. (and connector list from Component list)
- **Include comments and tips** — Asks the LLM for suggestions and gotchas (e.g. obsolete or hard-to-find gear)

### Usage

1. Set options as needed
2. Edit the prompt in the text area if you want
3. Click **Copy to clipboard**
4. Paste into your LLM

The prompt instructs the LLM to search for recent prices. Results are estimates; always verify before purchasing.

---

## File Operations

### New

Clears the canvas and starts fresh. A confirmation dialog appears. Unsaved changes are lost.

### Load

Opens a file picker for `.json` files. Replaces the current layout with the loaded one. Supports layouts saved by
PedalboardFactory.

### Save

Downloads the current layout as a JSON file (e.g. `pedalboard-2025-02-02.json`). Includes objects, connectors, zoom,
pan, grid, and unit.

---

## Keyboard Shortcuts

| Shortcut                               | Action                       |
| -------------------------------------- | ---------------------------- |
| **Ctrl+Z** (Cmd+Z)                     | Undo                         |
| **Ctrl+Y** or **Ctrl+Shift+Z** (Cmd+…) | Redo                         |
| **Esc**                                | Exit ruler / line ruler mode |

---

## Auto-Save

Layout, zoom, pan, grid, unit, connectors, and undo history are saved automatically to your browser’s local storage. No
manual save needed unless you want a file backup.

---

## About

Use the **Info** (ℹ) button in the catalog header for app info, author, and disclaimers.

---

_All brands and product names are property of their respective owners. Dimensions and data may contain errors; verify
before relying on them._
