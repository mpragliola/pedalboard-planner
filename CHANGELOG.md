# Changelog

All notable changes to this project are documented in this file. Entries are grouped by date (newest first).

## 2026-02-01

- Update project branding from "Pedalboard Planner" to "PedalboardFactory"
- Refactor device templates to modularize brand-specific data (devices-brands/)
- Add brand-specific board templates for improved modularity (boards-brands/)
- Add confirmation dialogs for critical actions (new pedalboard, delete device)
- Make pinch zoom and selection/drag mutually exclusive on touch devices
- Enhance catalog layout: 20% wider on large screens, full-width internal elements, larger device list font
- Style browse catalog button like GPT button (borderless)
- Fix zoom toolbar drop shadows cropped on secondary elements
- Update catalog z-index so it appears above app title/footer
- Save pedalboard to file: exclude undo/redo history, round coordinates to 2 decimals
- Refactor AppContext for improved state management and cleanup
- Enhance ZoomControls with expandable view and measurement tool groups
- Fix zoom toolbar overflow for drop shadows when expanded
- Enhance DropdownsPanel and catalog component styles for responsiveness
- Update App.css layout handling and fix double scrollbar
- Refactor ComponentListModal: replace cancelEdit with startAdd for consecutive edits
- Enhance LineRulerOverlay and usePolylineDraw interaction (onPointerUp, segment commitment)
- Update font-family across components and add inheritance for form elements
- Use FontAwesome for icons throughout the app
- Add BoardMenu component for new/load/save pedalboard
- Implement smooth zoom and pan transitions in Canvas

## 2026-01-31

- Enhance polyline path generation with improved corner handling (variable arc radius so arc spans turn angle; no semicircle at 180°)
- Refactor ruler components and introduce new hooks for improved functionality (polylinePath, rulerFormat, useCanvasCoords, usePolylineDraw)
- Enhance GptModal prompt instructions and add disclaimer
- Add comments and tips option in GptModal and update prompt builder
- Update font styles and improve table layout in ComponentListModal (Roboto for cells, Open Sans for headers, alternating row colors, vertical lines, row hover, icon buttons for Edit/Remove)
- Update connector icon paths to use BASE_URL (fix SVGs not loading with Vite base path)
- Add custom board and device creation functionality in DropdownsPanel (Custom board / Custom device: width, depth, color, name, Create button)
- Refactor LineRulerOverlay for improved segment management and interaction (click + move instead of click-drag; orange preview line; rounded joins)
- Add connector management features and update UI components (connectors in component list, connector icons)
- Update wheel event listener in useCanvasZoomPan to use capture phase
- Implement ruler and line ruler features in Canvas (rectangle ruler: drag to draw, click to fix, click again to exit; polyline ruler)

## 2026-01-30

- Add connector icons and update connector types in the application
- Add center view functionality to ZoomControls and AppContext
- Add x-ray functionality to Canvas and CanvasObject components
- Enhance mobile layout for CatalogModal
- Add font family to CatalogModeSwitch styles
- Enhance mobile responsiveness and layout for catalog components
- Update .gitignore to exclude temporary device images
- Remove legacy image processing script and update PowerShell script to support AVIF format
- Revert "Enhance canvas zooming functionality and update styles"
- Enhance canvas zooming functionality and update styles
- Add InfoButton and InfoModal components for user information display
- Add default object color and update components to use it
- Refactor CatalogModal and GptModal to use createPortal for rendering
- Add GPT functionality with modal and button integration
- Enhance object ID management in templateHelpers and update AppContext for state restoration
- Update AppContext to set default showGrid state to false
- Enhance DropdownsPanel button styles for improved visual feedback
- Refactor catalog components and add CatalogModal for improved item selection
- Refactor Grid component and update Canvas for improved grid rendering
- Update AppContext to reset selected board and device after object creation
- Refactor and reorganize components for catalog functionality
- Implement responsive scaling for selection toolbar and update styles for mobile devices
- Enhance CanvasObject to support canvas reference for improved drag handling
- Enhance DropdownsPanel for mobile responsiveness and update styles
- Add responsive viewport scaling for mobile devices in index.html
- Add catalog panel with toggle functionality for DropdownsPanel
- Add script to list unlinked images in public/images/devices
- Implement localStorage persistence for canvas state in AppContext
- Add new device images and update device templates
- Add wdh transformation script and update board/device templates to use wdh dimensions
- Refactor canvas interaction to use pointer events for improved touch support; implement pinch-to-zoom functionality and prevent default touch actions during dragging
- Update color property in templates to be optional when an image is present
- Enhance DropdownsPanel to support unit switching by adding dynamic labels and formatting for width and depth values based on selected units (mm/in)
- Add Google Fonts integration and update styles in App.css for improved UI consistency

## 2026-01-29

- Add copyright footer to App component and style it in App.css for improved branding and attribution
- Increase history depth in useHistory hook and AppContext from 50 to 200 for enhanced undo/redo functionality
- Remove initial objects from constants.ts, clearing the array for future use
- Add HistoryControls component for undo/redo functionality and integrate with AppContext; update styles for history controls in App.css
- Update dimensions for Boss SY-1000 device in device templates for improved accuracy
- Add script to verify device images, checking for broken links in the public directory against defined paths in devices.ts
- Add new images for various Dunlop devices and update device and board templates with corresponding image paths
- Add image processing scripts to verify, convert, and manage image assets for devices, including checks for missing images and orphaned files, along with a PowerShell script for background removal and trimming
- Add new images for various Boss devices and update device templates with corresponding image paths
- Remove outdated images for various devices, including Boss, MXR, and Dunlop, from the repository
- Update Boss device entries in device templates to set image paths to null for improved consistency
- Update tile size calculation in useCanvasZoomPan hook and replace floorboards image with a new version for improved quality
- Add gh-pages deployment support and update homepage in package.json; adjust base path in vite.config.js for deployment
- Revise README.md to enhance project description, update features, and improve installation instructions for the PedalBoard Builder application
- Update MXR device dimensions and ensure consistent formatting for Dookie Drive models in device templates
- Update device data for Dunlop pedals to correct image paths and ensure consistent branding with registered trademarks
- Add SelectionInfoPopup component to display details of selected objects, including dimensions; update App to include the new popup and enhance styling in App.css
- Add new images for various MXR and Dunlop devices, and update device data with corresponding image paths
- Add new padded images for various Boss devices to enhance visual assets
- Add new Boss device images and update device data; remove outdated images
- Update Pedaltrain board images with new versions for improved quality and consistency
- Refactor App structure to use context for state management; consolidate state and handlers in AppProvider, and update components to utilize context values
- Add Pedaltrain board images and update board data with image paths
- Refactor object reordering to simplify functionality; rename handler to 'sendToBack' and update related components accordingly
- Refactor board and device selection handlers to set selected IDs and remove unnecessary dependencies
- Implement object reordering functionality and update z-index handling in canvas components
- Initial commit
