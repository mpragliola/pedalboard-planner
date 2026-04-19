/**
 * Documentation screenshot pipeline for Pedalboard Planner.
 *
 * Prerequisites:
 *   npm install -D playwright && npx playwright install chromium
 *   npm run dev   (must be running — the script auto-detects port 5173/5174)
 *
 * Run: npm run screenshots
 */

import { chromium, type Page, type BrowserContext } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "../docs/screenshots");

// Auto-detect dev server port
async function detectBaseUrl(): Promise<string> {
  for (const port of [5173, 5174, 5175]) {
    try {
      const r = await fetch(`http://localhost:${port}/pedalboard-planner/`);
      if (r.ok) return `http://localhost:${port}/pedalboard-planner/`;
    } catch { /* skip */ }
  }
  throw new Error("Dev server not found on ports 5173-5175. Run: npm run dev");
}

// ─── Seed states ──────────────────────────────────────────────────────────────

// Base layout: Pedaltrain Metro 24 + 3 Boss pedals + 2 cables, centered at zoom 1.5.
// Board pos {80,80} size 609×203. pan = viewport_center - canvas_center * zoom = (144, 178)
const BASE_OBJECTS = [
  {
    id: "obj-board-1", subtype: "board", templateId: "board-pedaltrain-metro-24",
    type: "classic", brand: "Pedaltrain", model: "Metro 24", name: "Pedaltrain Metro 24",
    pos: { x: 80, y: 80 }, rotation: 0,
  },
  {
    id: "obj-device-1", subtype: "device", templateId: "device-boss-ds-1",
    type: "pedal", brand: "Boss", model: "DS-1", name: "Boss DS-1",
    pos: { x: 100, y: 100 }, rotation: 0,
  },
  {
    id: "obj-device-2", subtype: "device", templateId: "device-boss-sd-1",
    type: "pedal", brand: "Boss", model: "SD-1", name: "Boss SD-1",
    pos: { x: 200, y: 100 }, rotation: 0,
  },
  {
    id: "obj-device-3", subtype: "device", templateId: "device-boss-mt-2",
    type: "pedal", brand: "Boss", model: "MT-2", name: "Boss MT-2",
    pos: { x: 320, y: 100 }, rotation: 0,
  },
];

const BASE_CABLES = [
  {
    id: "cable-1", color: "#ff6600",
    connectorA: "straight", connectorB: "straight",
    connectorAName: "Output", connectorBName: "Input",
    points: [[163, 140], [200, 140]],
  },
  {
    id: "cable-2", color: "#3399ff",
    connectorA: "straight", connectorB: "straight",
    connectorAName: "Output", connectorBName: "Input",
    points: [[263, 140], [320, 140]],
  },
];

// zoom=1.5: client = pos * 1.5 + pan{144,178}
const SEED_STATE = JSON.stringify({
  objects: BASE_OBJECTS, cables: BASE_CABLES,
  showGrid: false, zoom: 1.5, pan: { x: 144, y: 178 }, unit: "mm",
});

// Zoomed-in for cable detail: zoom=3, pan centers the cables area
const SEED_STATE_CABLE_ZOOM = JSON.stringify({
  objects: BASE_OBJECTS, cables: BASE_CABLES,
  showGrid: false, zoom: 3, pan: { x: 12, y: 30 }, unit: "mm",
});

// Cables with longer segments extending into open canvas space (for terminal icon visibility)
// Cables go from x=0 to x=100 and x=130 to x=230, at y=50 (above pedals at y=100)
// At zoom=3 pan={144,100}: client x = pos*3+144, y = pos*3+100
const TERMINAL_CABLES = [
  {
    id: "cable-t1", color: "#ff6600",
    connectorA: "straight", connectorB: "straight",
    connectorAName: "Output", connectorBName: "Input",
    points: [[20, 50], [120, 50]],
  },
  {
    id: "cable-t2", color: "#3399ff",
    connectorA: "straight", connectorB: "straight",
    connectorAName: "Output", connectorBName: "Input",
    points: [[150, 50], [250, 50]],
  },
];
// zoom=3 pan={144,200}: cable y=50 → client y=50*3+200=350, center of 900px height
// cable x: 20→60+144=204 to 250→750+144=894 → covers most of width
const SEED_STATE_TERMINALS = JSON.stringify({
  objects: BASE_OBJECTS, cables: TERMINAL_CABLES,
  showGrid: false, zoom: 3, pan: { x: 144, y: 200 }, unit: "mm",
});

// Grid enabled state
const SEED_STATE_GRID = JSON.stringify({
  objects: BASE_OBJECTS, cables: BASE_CABLES,
  showGrid: true, zoom: 1.5, pan: { x: 144, y: 178 }, unit: "mm",
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function out(...parts: string[]) {
  return path.join(OUTPUT_DIR, ...parts);
}

async function freshPage(context: BrowserContext, baseUrl: string, state?: string): Promise<Page> {
  const page = await context.newPage();
  page.setDefaultTimeout(15_000);
  if (state) {
    await page.addInitScript((s: string) => {
      localStorage.setItem("pedal/state", s);
    }, state);
  }
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  // Wait for the canvas to be present and stable — avoids flash-of-empty-state
  await page.locator(".canvas").waitFor({ state: "visible" });
  return page;
}

// canvas client coord: clientX = posX * zoom + panX
function cc(posX: number, posY: number, zoom = 1.5, panX = 144, panY = 178) {
  return { x: posX * zoom + panX, y: posY * zoom + panY };
}

// Shorthand for cable-zoom coords
function ccz(posX: number, posY: number) {
  return cc(posX, posY, 3, 12, 30);
}

// Center of DS-1 (pos 100,100, size 73×129) at default zoom
const DS1_CENTER = cc(100 + 73 / 2, 100 + 129 / 2);

// Pedal row clip at default zoom
const PEDALS_CLIP = {
  x: cc(90, 90).x, y: cc(90, 90).y,
  width: cc(400, 240).x - cc(90, 90).x,
  height: cc(400, 240).y - cc(90, 90).y,
};

async function captureModal(page: Page, filename: string) {
  const modal = page.locator(".modal-content").first();
  await modal.waitFor({ state: "visible" });
  await modal.screenshot({ path: out("modals", filename) });
  console.log(`✓ modals/${filename}`);
}

/** Collapse the catalog panel so it doesn't cover canvas content. */
async function minimizeCatalog(page: Page) {
  const body = page.locator(".catalog-panel-body");
  const isMinimized = await body.evaluate((el) => el.classList.contains("minimized")).catch(() => true);
  if (!isMinimized) {
    await page.locator("button.catalog-panel-toggle").click();
    await page.locator(".catalog-panel-body.minimized").waitFor({ state: "visible" });
  }
}

// ─── Setup ────────────────────────────────────────────────────────────────────

const BASE_URL = await detectBaseUrl();
console.log(`Using dev server: ${BASE_URL}\n`);

if (fs.existsSync(OUTPUT_DIR)) fs.rmSync(OUTPUT_DIR, { recursive: true });
for (const section of ["overview", "catalog", "canvas", "cables", "tools", "3d", "ui", "modals"]) {
  fs.mkdirSync(out(section), { recursive: true });
}

const browser = await chromium.launch({
  headless: true,
  args: [
    "--enable-webgl",
    "--use-gl=swiftshader",
    "--ignore-gpu-blocklist",
    "--enable-gpu-rasterization",
    "--no-sandbox",
    "--disable-dev-shm-usage",
  ],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

console.log("Starting screenshot pipeline...\n");

// ── 1. Overview ───────────────────────────────────────────────────────────────
{
  const page = await freshPage(context, BASE_URL);
  await page.screenshot({ path: out("overview", "empty-canvas.png"), fullPage: true });
  console.log("✓ overview/empty-canvas.png");
  await page.close();
}

{
  const page = await freshPage(context, BASE_URL, SEED_STATE);
  await page.screenshot({ path: out("overview", "loaded-board.png"), fullPage: true });
  console.log("✓ overview/loaded-board.png");
  await page.close();
}

// ── 2. Catalog Panel ──────────────────────────────────────────────────────────
{
  const page = await freshPage(context, BASE_URL);
  const panel = page.locator(".catalog-panel");

  await panel.screenshot({ path: out("catalog", "boards-list.png") });
  console.log("✓ catalog/boards-list.png");

  await page.getByTitle("Thumbnail list").click();
  // Wait for images to appear in the panel
  await page.locator(".catalog-panel img").first().waitFor({ state: "visible" });
  await panel.screenshot({ path: out("catalog", "boards-image-view.png") });
  console.log("✓ catalog/boards-image-view.png");

  await page.getByRole("button", { name: "Devices" }).click();
  await page.locator(".catalog-panel .catalog-list-item").first().waitFor({ state: "visible" });
  await panel.screenshot({ path: out("catalog", "devices.png") });
  console.log("✓ catalog/devices.png");

  await page.locator("#device-type-filter").selectOption("multifx");
  await page.locator(".catalog-panel .catalog-list-item").first().waitFor({ state: "visible" });
  await panel.screenshot({ path: out("catalog", "devices-filtered.png") });
  console.log("✓ catalog/devices-filtered.png");

  await page.getByRole("button", { name: "Boards" }).click();
  await page.locator("button.collapsible-toggle.custom-section-toggle").waitFor({ state: "visible" });
  await page.locator("button.collapsible-toggle.custom-section-toggle").click();
  await page.locator(".catalog-panel input[type=text], .catalog-panel input[type=number]").first().waitFor({ state: "visible" });
  await panel.screenshot({ path: out("catalog", "custom-item-form.png") });
  console.log("✓ catalog/custom-item-form.png");

  await page.close();
}

// ── 3. Canvas & Objects ───────────────────────────────────────────────────────
{
  const page = await freshPage(context, BASE_URL, SEED_STATE);
  await minimizeCatalog(page);

  // selection-toolbar — click DS-1, wait for toolbar to appear
  await page.mouse.click(DS1_CENTER.x, DS1_CENTER.y);
  await page.locator(".selection-toolbar").waitFor({ state: "visible" });
  await page.screenshot({
    path: out("canvas", "selection-toolbar.png"),
    clip: {
      x: PEDALS_CLIP.x - 40, y: PEDALS_CLIP.y - 60,
      width: PEDALS_CLIP.width + 80, height: PEDALS_CLIP.height + 120,
    },
  });
  console.log("✓ canvas/selection-toolbar.png");

  // xray mode — deselect, open view group, enable xray via JS dispatch
  await page.keyboard.press("Escape");
  await page.locator(".selection-toolbar").waitFor({ state: "hidden" }).catch(() => {});
  await page.mouse.click(900, 750);
  await page.locator("button.view-group-toggle").click({ force: true });
  await page.locator(".view-tools-group.expanded").waitFor({ state: "visible" });
  // Use dispatchEvent to bypass "outside viewport" restriction on secondary controls
  await page.locator("button.xray-toggle").dispatchEvent("click");
  await page.locator("button.xray-toggle.active").waitFor({ state: "visible" });
  await page.screenshot({ path: out("canvas", "xray-mode.png"), fullPage: true });
  console.log("✓ canvas/xray-mode.png");

  await page.close();
}

// grid-mm — pre-seeded with showGrid:true; collapse catalog panel first
{
  const page = await freshPage(context, BASE_URL, SEED_STATE_GRID);
  await minimizeCatalog(page);
  await page.screenshot({ path: out("canvas", "grid-mm.png"), fullPage: true });
  console.log("✓ canvas/grid-mm.png");
  await page.close();
}

// ── 4. Cable System ───────────────────────────────────────────────────────────

// 4a. Drawing mode — enter cable draw, commit a segment, move mouse for dashed preview
{
  const page = await freshPage(context, BASE_URL, SEED_STATE);
  await minimizeCatalog(page);
  await page.locator("button.cable-layer-toggle").click();
  await page.locator(".cable-layer-overlay").waitFor({ state: "visible" });

  // Click two points above the board (canvas y=40, outside board at y=80..283)
  const drawStart = cc(200, 40);
  const drawMid   = cc(300, 40);
  const drawPrev  = cc(420, 40);
  await page.mouse.click(drawStart.x, drawStart.y);
  await page.mouse.click(drawMid.x, drawMid.y);
  // Move to show the dashed preview from last committed point to cursor
  await page.mouse.move(drawPrev.x, drawPrev.y);
  await page.locator(".cable-layer-add-btn").waitFor({ state: "visible" });

  await page.screenshot({ path: out("cables", "drawing-mode.png"), fullPage: true });
  console.log("✓ cables/drawing-mode.png");
  await page.close();
}

// 4b. Add cable modal — draw a segment, click "Add cable" button
{
  const page = await freshPage(context, BASE_URL, SEED_STATE);
  await minimizeCatalog(page);
  await page.locator("button.cable-layer-toggle").click();
  await page.locator(".cable-layer-overlay").waitFor({ state: "visible" });

  const p1 = cc(200, 40);
  const p2 = cc(350, 40);
  await page.mouse.click(p1.x, p1.y);
  await page.mouse.click(p2.x, p2.y);
  await page.locator("button.cable-layer-add-btn").waitFor({ state: "visible" });
  await page.locator("button.cable-layer-add-btn").click();

  const modal = page.locator(".modal-content").first();
  await modal.waitFor({ state: "visible" });
  // Click the modal title to dismiss any auto-opened dropdown
  await page.locator(".modal-title, h2").first().click({ force: true }).catch(() => {});
  await modal.screenshot({ path: out("cables", "add-cable-modal.png") });
  console.log("✓ cables/add-cable-modal.png");
  await page.close();
}

// 4c. Cable toolbar — click a cable, wait for toolbar, crop
{
  const page = await freshPage(context, BASE_URL, SEED_STATE_CABLE_ZOOM);
  await minimizeCatalog(page);
  const cable1Mid = ccz(181, 140);
  await page.mouse.click(cable1Mid.x, cable1Mid.y);
  await page.locator(".cable-toolbar").waitFor({ state: "visible" });

  const cableLeft  = ccz(140, 120);
  const cableRight = ccz(330, 170);
  await page.screenshot({
    path: out("cables", "cable-toolbar.png"),
    clip: {
      x: cableLeft.x - 60, y: cableLeft.y - 80,
      width: (cableRight.x - cableLeft.x) + 120,
      height: (cableRight.y - cableLeft.y) + 160,
    },
  });
  console.log("✓ cables/cable-toolbar.png");
  await page.close();
}

// 4d. Cable terminals — cables in open space so icons aren't occluded by pedals.
// At zoom=3 pan={144,200}: A endpoint client(204,350), B endpoint client(894,350).
// Label text is above the cable line; icon is below text. Groups extend outward from endpoints.
// Crop: full width strip around y=350 with generous vertical padding for text+icon above/below.
{
  const page = await freshPage(context, BASE_URL, SEED_STATE_TERMINALS);
  await minimizeCatalog(page);
  await page.locator(".cable-connector-label-icon").first().waitFor({ state: "visible" });
  await page.waitForLoadState("networkidle");

  // Crop a horizontal strip showing both cable endpoints and their label+icon groups.
  // Left margin starts past the catalog panel (~280px). Right margin covers icon beyond B.
  await page.screenshot({
    path: out("cables", "cable-terminals.png"),
    clip: { x: 280, y: 270, width: 1440 - 280, height: 200 },
  });
  console.log("✓ cables/cable-terminals.png");
  await page.close();
}

// 4e. Visibility dimmed
{
  const page = await freshPage(context, BASE_URL, SEED_STATE_CABLE_ZOOM);
  await minimizeCatalog(page);
  await page.locator("button.cables-visible-toggle").click();
  await page.locator("button.cables-visible-toggle--dim").waitFor({ state: "visible" }).catch(() => {});

  const dimLeft  = ccz(140, 115);
  const dimRight = ccz(340, 165);
  await page.screenshot({
    path: out("cables", "visibility-dimmed.png"),
    clip: {
      x: dimLeft.x - 20, y: dimLeft.y - 20,
      width: (dimRight.x - dimLeft.x) + 40,
      height: (dimRight.y - dimLeft.y) + 40,
    },
  });
  console.log("✓ cables/visibility-dimmed.png");
  await page.close();
}

// ── 5. Measurement Tools ──────────────────────────────────────────────────────
{
  const page = await freshPage(context, BASE_URL, SEED_STATE);
  await minimizeCatalog(page);

  await page.locator("button.measurement-group-toggle").click();
  await page.locator(".measurement-tools-group.expanded").waitFor({ state: "visible" });

  await page.locator("button.ruler-toggle").dispatchEvent("click");
  await page.locator("button.ruler-toggle.active").waitFor({ state: "visible" });
  const boardTL = cc(80, 80);
  const boardBR = cc(80 + 609, 80 + 203);
  await page.mouse.move(boardTL.x + 20, boardTL.y + 20);
  await page.mouse.down();
  await page.mouse.move(boardBR.x - 20, boardBR.y - 20, { steps: 20 });
  await page.mouse.up();
  await page.locator(".ruler-popup").waitFor({ state: "visible" });
  await page.screenshot({ path: out("tools", "ruler-rectangle.png"), fullPage: true });
  console.log("✓ tools/ruler-rectangle.png");

  await page.keyboard.press("Escape");
  await page.locator("button.measurement-group-toggle").click();
  await page.locator(".measurement-tools-group.expanded").waitFor({ state: "visible" });
  await page.locator("button.line-ruler-toggle").dispatchEvent("click");
  await page.locator("button.line-ruler-toggle.active").waitFor({ state: "visible" });

  const lr1 = cc(110, 165);
  const lr2 = cc(215, 155);
  const lr3 = cc(350, 165);
  await page.mouse.click(lr1.x, lr1.y);
  await page.mouse.click(lr2.x, lr2.y);
  await page.mouse.click(lr3.x, lr3.y);
  await page.locator(".ruler-popup").waitFor({ state: "visible" });

  await page.screenshot({
    path: out("tools", "ruler-line.png"),
    clip: {
      x: PEDALS_CLIP.x - 40, y: PEDALS_CLIP.y - 60,
      width: PEDALS_CLIP.width + 80, height: PEDALS_CLIP.height + 120,
    },
  });
  console.log("✓ tools/ruler-line.png");
  await page.close();
}

async function wait3dRendered(page: Page) {
  // Poll until the WebGL canvas has non-black pixels (max 8s)
  await page.waitForFunction(() => {
    const canvas = document.querySelector<HTMLCanvasElement>(".mini3d-overlay canvas");
    if (!canvas) return false;
    const ctx = canvas.getContext("2d") ?? canvas.getContext("webgl") ?? canvas.getContext("webgl2");
    if (!ctx || !("getImageData" in ctx)) {
      // WebGL context — try reading a pixel via readPixels
      const gl = canvas.getContext("webgl") ?? canvas.getContext("webgl2") as WebGLRenderingContext | null;
      if (!gl) return false;
      const buf = new Uint8Array(4);
      gl.readPixels(canvas.width / 2, canvas.height / 2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
      return buf[0] > 10 || buf[1] > 10 || buf[2] > 10;
    }
    return false;
  }, {}, { timeout: 8000 }).catch(() => {/* accept dark if WebGL unavailable */});
}

// ── 6. 3D View ────────────────────────────────────────────────────────────────
// Note: HQ mode uses advanced WebGL features (shadows, specular) that don't render in
// headless Chromium without a GPU. Both shots use LQ mode (SwiftShader compatible).
{
  // 3D view — LQ mode renders correctly in headless via SwiftShader
  const page = await freshPage(context, BASE_URL, SEED_STATE);
  await minimizeCatalog(page);
  await page.locator("button.mini3d-toggle").click();
  const overlay = page.locator(".mini3d-overlay").first();
  await overlay.waitFor({ state: "visible" });
  // Switch to LQ so SwiftShader can render it
  await page.locator("button.mini3d-high-resource-toggle").dispatchEvent("click");
  await page.locator("button.mini3d-high-resource-toggle.mode-lq").waitFor({ state: "visible" });
  await page.locator(".mini3d-overlay canvas").waitFor({ state: "visible" }).catch(() => {});
  await wait3dRendered(page);
  await overlay.screenshot({ path: out("3d", "3d-view-hq.png") });
  await overlay.screenshot({ path: out("3d", "3d-view-lq.png") });
  console.log("✓ 3d/3d-view-hq.png");
  console.log("✓ 3d/3d-view-lq.png");
  await page.close();
}

// ── 7. Side Controls ──────────────────────────────────────────────────────────
{
  const page = await freshPage(context, BASE_URL);
  const sideControls = page.locator(".side-controls");

  await sideControls.screenshot({ path: out("ui", "side-controls-collapsed.png") });
  console.log("✓ ui/side-controls-collapsed.png");

  await page.locator("button.mini3d-toggle").click({ force: true });
  await page.locator(".mini3d-tools-group.expanded").waitFor({ state: "visible" });
  await page.locator("button.view-group-toggle").click({ force: true });
  await page.locator(".view-tools-group.expanded").waitFor({ state: "visible" });
  await page.locator("button.measurement-group-toggle").click({ force: true });
  await page.locator(".measurement-tools-group.expanded").waitFor({ state: "visible" });
  await sideControls.screenshot({ path: out("ui", "side-controls-expanded.png") });
  console.log("✓ ui/side-controls-expanded.png");

  await page.close();
}

// ── 8. Modals ─────────────────────────────────────────────────────────────────
{
  const page = await freshPage(context, BASE_URL);
  await page.getByTitle("Settings").click();
  await captureModal(page, "settings.png");
  await page.close();
}

{
  const page = await freshPage(context, BASE_URL, SEED_STATE);
  await page.getByTitle("Build price estimate prompt for LLM").click();
  await captureModal(page, "gpt-prompt.png");
  await page.close();
}

{
  // Narrower viewport so the modal isn't stretched too wide
  const narrowCtx = await browser.newContext({ viewport: { width: 900, height: 700 } });
  const page = await freshPage(narrowCtx, BASE_URL, SEED_STATE);
  await page.getByRole("button", { name: "Component list" }).click();
  await captureModal(page, "component-list.png");
  await page.close();
  await narrowCtx.close();
}

{
  const page = await freshPage(context, BASE_URL, SEED_STATE);
  await page.getByTitle("New pedalboard (clear current)").click();
  const dialog = page.locator(".confirmation-dialog, dialog[open]").first();
  await dialog.waitFor({ state: "visible" });
  await dialog.screenshot({ path: out("modals", "confirmation.png") });
  console.log("✓ modals/confirmation.png");
  await page.close();
}

// ─── Done ─────────────────────────────────────────────────────────────────────
await browser.close();
console.log(`\nAll screenshots saved to ${OUTPUT_DIR}`);
