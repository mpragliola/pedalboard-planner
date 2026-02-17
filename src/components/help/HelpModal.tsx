import { useEffect, useMemo, useState } from "react";
import { BASE_URL } from "../../constants";
import { Modal } from "../common/Modal";
import "./HelpModal.scss";

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

interface HelpSection {
  heading: string;
  points: string[];
}

interface HelpPage {
  id: string;
  title: string;
  subtitle: string;
  screenshotPath?: string;
  screenshotAlt?: string;
  screenshotCaption?: string;
  sections: HelpSection[];
}

const HELP_PAGES: HelpPage[] = [
  {
    id: "overview",
    title: "Software Overview",
    subtitle: "What this app is and who it is for.",
    sections: [
      {
        heading: "What Is PedalboardFactory?",
        points: [
          "PedalboardFactory is a pedalboard planner for guitar and bass rigs.",
          "It helps you design board layouts, route cables, and check clearances before buying or assembling gear.",
          "You can place boards and pedals to scale, measure distances, inspect in 3D, and export project data for planning and budgeting.",
        ],
      },
    ],
  },
  {
    id: "layout-description",
    title: "Layout Description",
    subtitle: "Where each part of the interface is located and what it controls.",
    screenshotPath: "assets/help/01-overview.svg",
    screenshotAlt: "Main interface zones: catalog, canvas, side controls, bottom controls, and board menu.",
    screenshotCaption: "Use this map to quickly locate tools in the interface.",
    sections: [
      {
        heading: "Interface Areas",
        points: [
          "Catalog on the left for boards, devices, and custom items.",
          "Canvas in the center for placement, alignment, and cable routing.",
          "Side controls for cables, 3D, view toggles, and measurement tools.",
          "Board menu for files, GPT prompt, info, settings, and help/manual.",
        ],
      },
    ],
  },
  {
    id: "canvas-navigation",
    title: "Canvas Navigation",
    subtitle: "Move around the board quickly and safely.",
    screenshotPath: "assets/help/01-overview.svg",
    screenshotAlt: "Canvas interaction area with placed gear.",
    screenshotCaption: "Zoom, pan, and clear selections from the canvas area.",
    sections: [
      {
        heading: "Navigation Basics",
        points: [
          "Click empty canvas to clear the current selection.",
          "Drag empty space to pan the view.",
          "Use mouse wheel or pinch to zoom in and out.",
        ],
      },
    ],
  },
  {
    id: "catalog-browsing",
    title: "Catalog Browsing",
    subtitle: "Find boards and devices with filters and search.",
    screenshotPath: "assets/help/02-catalog.svg",
    screenshotAlt: "Catalog panel with board/device switch and filters.",
    screenshotCaption: "Use board/device mode, unit, search, and filters to narrow results.",
    sections: [
      {
        heading: "Browse Workflow",
        points: [
          "Switch between Boards and Devices.",
          "Set unit to mm or inches before comparing sizes.",
          "Use search, brand/type, and size filters to narrow the list.",
          "Click an item to place it in the visible canvas area.",
        ],
      },
    ],
  },
  {
    id: "custom-items",
    title: "Custom Items",
    subtitle: "Create your own board or device entries.",
    screenshotPath: "assets/help/02-catalog.svg",
    screenshotAlt: "Catalog custom item area for manual dimensions and colors.",
    screenshotCaption: "Custom entries let you design a layout even when a model is not in the database.",
    sections: [
      {
        heading: "Custom Workflow",
        points: [
          "Set width, depth, and color for a new custom item.",
          "Add an optional name to identify it in the list.",
          "If no image is provided, the custom item is rendered as a colored rectangle.",
        ],
      },
    ],
  },
  {
    id: "object-editing",
    title: "Object Editing",
    subtitle: "Refine placement order and orientation.",
    screenshotPath: "assets/help/03-canvas-cables.svg",
    screenshotAlt: "Canvas with selected pedals and object toolbar actions.",
    screenshotCaption: "Select an object to move, rotate, reorder, or delete it.",
    sections: [
      {
        heading: "Object Actions",
        points: [
          "Drag an object to reposition it.",
          "Use rotate controls for orientation changes.",
          "Use send back/front to adjust stacking order.",
          "Delete removes the selected object from the board.",
        ],
      },
    ],
  },
  {
    id: "cable-drawing",
    title: "Cable Drawing",
    subtitle: "Create cable routes point by point.",
    screenshotPath: "assets/help/03-canvas-cables.svg",
    screenshotAlt: "Cable drawing mode with route points and snapping behavior.",
    screenshotCaption: "Add cable mode creates routed paths across your board.",
    sections: [
      {
        heading: "Cable Drawing",
        points: [
          "Enable Add cable mode from side controls.",
          "Click or tap to add route points.",
          "Double-click or double-tap to finish the route.",
          "Hold Shift to disable snapping or hold Ctrl to constrain to 45 degrees.",
        ],
      },
    ],
  },
  {
    id: "cable-editing",
    title: "Cable Editing",
    subtitle: "Adjust cable metadata and shape after drawing.",
    screenshotPath: "assets/help/03-canvas-cables.svg",
    screenshotAlt: "Cable editing view with handles, labels, and connector options.",
    screenshotCaption: "Edit connectors, labels, and geometry for each routed cable.",
    sections: [
      {
        heading: "Cable Editing",
        points: [
          "Change cable color and connector types for side A and side B.",
          "Use cable templates to prefill common connector pairs and Swap connectors when needed.",
          "Drag vertices to reshape the cable path.",
          "Double-click or double-tap a segment to insert a vertex, or long-press a middle vertex to remove it.",
        ],
      },
    ],
  },
  {
    id: "view-controls",
    title: "View Controls",
    subtitle: "Inspect layout clarity and cable visibility.",
    screenshotPath: "assets/help/04-view-and-tools.svg",
    screenshotAlt: "View control buttons for centering, grid, x-ray, and cable visibility.",
    screenshotCaption: "Use view tools to inspect overlap, spacing, and cable readability.",
    sections: [
      {
        heading: "Display Tools",
        points: [
          "Center view fits your layout in the viewport.",
          "Grid overlay helps alignment and spacing.",
          "X-ray improves visibility when objects overlap.",
          "Cable visibility cycles between On, Dim, and Off.",
        ],
      },
    ],
  },
  {
    id: "mini-3d",
    title: "Mini 3D",
    subtitle: "Inspect board and objects in perspective.",
    screenshotPath: "assets/help/04-view-and-tools.svg",
    screenshotAlt: "Mini 3D controls and rendered board preview.",
    screenshotCaption: "3D view provides floor, shadows, bump, and specular visual options.",
    sections: [
      {
        heading: "3D Interaction",
        points: [
          "Open mini 3D from side controls.",
          "Drag to orbit and use wheel/pinch to change camera distance.",
          "Toggle floor, shadow, bump, and specular effects.",
        ],
      },
    ],
  },
  {
    id: "rectangle-ruler",
    title: "Rectangle Ruler",
    subtitle: "Measure width, depth, and diagonal of a rectangular area.",
    screenshotPath: "assets/help/04-view-and-tools.svg",
    screenshotAlt: "Rectangle ruler in measurement tools.",
    screenshotCaption: "Use rectangle ruler for fast footprint and clearance checks.",
    sections: [
      {
        heading: "Rectangle Ruler",
        points: [
          "Use rectangle ruler to read width, depth, and diagonal.",
          "Drag between two corners to size a rectangular area quickly.",
          "Press Esc at any time to exit measurement mode.",
        ],
      },
    ],
  },
  {
    id: "polyline-ruler",
    title: "Polyline Ruler",
    subtitle: "Measure routed distance across multiple connected segments.",
    screenshotPath: "assets/help/04-view-and-tools.svg",
    screenshotAlt: "Polyline ruler in measurement tools.",
    screenshotCaption: "Use polyline ruler for cable-run and path-length estimates.",
    sections: [
      {
        heading: "Polyline Ruler",
        points: [
          "Use polyline ruler to measure routed distance across multiple segments.",
          "Add points along turns to follow realistic cable paths.",
          "Press Esc at any time to exit measurement mode.",
        ],
      },
    ],
  },
  {
    id: "board-files",
    title: "Board Files",
    subtitle: "Start new projects and save/load board state.",
    screenshotPath: "assets/help/05-files-and-gpt.svg",
    screenshotAlt: "Board menu file actions for new, load, and save.",
    screenshotCaption: "Use board file actions to persist and restore your pedalboard project.",
    sections: [
      {
        heading: "Board Files",
        points: [
          "New clears current board after confirmation.",
          "Load imports a saved JSON pedalboard file.",
          "Save exports the current board to JSON.",
        ],
      },
    ],
  },
  {
    id: "component-list",
    title: "Component List",
    subtitle: "Review parts and export a CSV bill-style list.",
    screenshotPath: "assets/help/05-files-and-gpt.svg",
    screenshotAlt: "Component list with export controls.",
    screenshotCaption: "Use component list for quick inventory and planning exports.",
    sections: [
      {
        heading: "Component List",
        points: [
          "Open component list from side controls.",
          "Review devices and cables with measured lengths.",
          "Export the list to CSV.",
        ],
      },
    ],
  },
  {
    id: "gpt-prompt",
    title: "GPT Prompt Builder",
    subtitle: "While Pedalboard Factory has no native AI features, the GPT prompt builder helps "
      + "you create detailed prompts for use in external LLMs like ChatGPT, Claude, or Gemini, with "
      + "all the information needed to ask your LLM for price estimates, gear recommendations, or other "
      + "pedalboard-related advice.",
    screenshotPath: "assets/help/05-files-and-gpt.svg",
    screenshotAlt: "Price estimate prompt dialog with optional settings.",
    screenshotCaption: "Build, edit, and copy a prompt for ChatGPT, Claude, Gemini, or similar tools.",
    sections: [
      {
        heading: "Prompt Builder",
        points: [
          "Open the GPT action from the board menu.",
          "Optionally include location, materials, and comments/tips.",
          "Edit the generated prompt text if needed.",
          "Copy and paste it into your preferred LLM.",
        ],
      },
    ],
  },
];

function helpAssetPath(path: string): string {
  const base = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
  return `${base}${path.replace(/^\/+/, "")}`;
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    if (open) setPageIndex(0);
  }, [open]);

  const page = useMemo(() => HELP_PAGES[pageIndex] ?? HELP_PAGES[0], [pageIndex]);
  const canGoPrev = pageIndex > 0;
  const canGoNext = pageIndex < HELP_PAGES.length - 1;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Help & Manual"
      className="help-modal modal-dialog--compact-close"
      ariaLabel="Help and manual"
    >
      <div className="help-modal-shell">
        <nav className="help-modal-page-nav" aria-label="Manual pages">
          {HELP_PAGES.map((entry, idx) => (
            <button
              key={entry.id}
              type="button"
              className={`help-modal-page-tab${idx === pageIndex ? " is-active" : ""}`}
              onClick={() => setPageIndex(idx)}
              aria-current={idx === pageIndex ? "page" : undefined}
            >
              <span className="help-modal-page-main">
                <span className="help-modal-page-number">{idx + 1}</span>
                <span className="help-modal-page-label">{entry.title}</span>
              </span>
              {entry.sections.length > 1 ? (
                <span className="help-modal-page-subchapters" aria-hidden="true">
                  {entry.sections.map((section) => (
                    <span key={section.heading} className="help-modal-page-subchapter">
                      {section.heading}
                    </span>
                  ))}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <section className="help-modal-page" aria-live="polite">
          <header className="help-modal-page-head">
            <h3 className="help-modal-page-title">{page.title}</h3>
            <p className="help-modal-page-subtitle">{page.subtitle}</p>
          </header>

          {page.screenshotPath ? (
            <figure className="help-modal-shot">
              <img src={helpAssetPath(page.screenshotPath)} alt={page.screenshotAlt ?? "Manual screenshot"} loading="lazy" />
              {page.screenshotCaption ? <figcaption>{page.screenshotCaption}</figcaption> : null}
            </figure>
          ) : null}

          <div className="help-modal-sections">
            {page.sections.map((section) => (
              <section key={section.heading} className="help-modal-section">
                <h4>{section.heading}</h4>
                <ul>
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </section>
      </div>

      <div className="help-modal-actions">
        <button
          type="button"
          className="help-modal-btn help-modal-btn-secondary"
          onClick={() => setPageIndex((idx) => Math.max(0, idx - 1))}
          disabled={!canGoPrev}
        >
          Previous
        </button>

        <span className="help-modal-progress" aria-label="Current manual page">
          {pageIndex + 1} / {HELP_PAGES.length}
        </span>

        <button
          type="button"
          className="help-modal-btn help-modal-btn-secondary"
          onClick={() => setPageIndex((idx) => Math.min(HELP_PAGES.length - 1, idx + 1))}
          disabled={!canGoNext}
        >
          Next
        </button>

        <button type="button" className="help-modal-btn help-modal-btn-primary" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}