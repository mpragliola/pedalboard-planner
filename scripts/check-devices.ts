#!/usr/bin/env node
/**
 * Unified check of device and board templates and images.
 * Reports: images without template, templates with null images, broken links, wrong proportions.
 *
 * Usage: npx tsx scripts/check-devices.ts [--tolerance=0.1]
 */

import { existsSync, readdirSync } from "fs";
import { join, dirname, extname, relative } from "path";
import { fileURLToPath } from "url";
// @ts-expect-error - image-size has no types
import sizeOf from "image-size";
import { DEVICE_TEMPLATES } from "../src/data/devices";
import { BOARD_TEMPLATES } from "../src/data/boards";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(__dirname);
const imageRoot = join(projectRoot, "public", "images");
const devicesRoot = join(imageRoot, "devices");
const boardsRoot = join(imageRoot, "boards");

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);
const SKIP_DIRS = new Set(["_", "padded", "processed", "temp_borders", "cut"]);

const args = process.argv.slice(2);
const full = args.includes("--full");
if (args.includes("--help")) {
  console.log(`check-devices - Unified check of device and board templates and images

Usage: npm run check-devices -- [options]

Options:
  --help          Show this help
  --full          Show full output (no truncation)
  --tolerance=N   Proportion mismatch tolerance as fraction (default: 0.1 = 10%)

Reports:
  - Images without template (orphaned files)
  - Templates with null images
  - Templates with broken image link
  - Templates with wrong W×D proportions`);
  process.exit(0);
}
const tolerance = args.find((a) => a.startsWith("--tolerance="))
  ? parseFloat(args.find((a) => a.startsWith("--tolerance="))!.split("=")[1])
  : 0.1;

type Template = { id: string; model: string; image: string | null; wdh: [number, number, number] };

function walkImages(dir: string, baseDir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    const rel = relative(baseDir, full).replace(/\\/g, "/");
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walkImages(full, baseDir, acc);
    } else if (IMAGE_EXT.has(extname(e.name).toLowerCase())) acc.push(rel);
  }
  return acc;
}

function ratiosMatch(tr: number, ir: number, tol: number): boolean {
  if (tr <= 0 || ir <= 0) return false;
  const r = tr / ir;
  return r >= 1 - tol && r <= 1 + tol;
}

// Collect data
const deviceLinked = new Set(DEVICE_TEMPLATES.filter((t) => t.image).map((t) => t.image!));
const boardLinked = new Set(BOARD_TEMPLATES.filter((t) => t.image).map((t) => t.image!));

const deviceImages = walkImages(devicesRoot, devicesRoot);
const boardImages = walkImages(boardsRoot, boardsRoot);

const imagesWithoutTemplate = {
  devices: deviceImages.filter((p) => !deviceLinked.has(p)).sort(),
  boards: boardImages.filter((p) => !boardLinked.has(p)).sort(),
};

const templatesWithNullImages = {
  devices: DEVICE_TEMPLATES.filter((t) => !t.image).map((t) => ({ id: t.id, model: t.model })),
  boards: BOARD_TEMPLATES.filter((t) => !t.image).map((t) => ({ id: t.id, model: t.model })),
};

const broken: { type: "devices" | "boards"; id: string; model: string; image: string }[] = [];
const wrongProportions: {
  type: "devices" | "boards";
  id: string;
  model: string;
  image: string;
  pct: number;
}[] = [];

function checkTemplates(templates: Template[], type: "devices" | "boards", basePath: string) {
  for (const t of templates) {
    if (!t.image) continue;
    const imgPath = join(basePath, t.image);
    if (!existsSync(imgPath)) {
      broken.push({ type, id: t.id, model: t.model, image: t.image });
      continue;
    }
    let dims: { width?: number; height?: number };
    try {
      dims = sizeOf(imgPath);
    } catch {
      broken.push({ type, id: t.id, model: t.model, image: t.image });
      continue;
    }
    if (!dims.width || !dims.height) continue;
    const tr = t.wdh[0] / t.wdh[1];
    const ir = dims.width / dims.height;
    if (!ratiosMatch(tr, ir, tolerance)) {
      const pct = Math.abs((tr - ir) / tr) * 100;
      wrongProportions.push({ type, id: t.id, model: t.model, image: t.image, pct });
    }
  }
}

checkTemplates(DEVICE_TEMPLATES, "devices", devicesRoot);
checkTemplates(BOARD_TEMPLATES, "boards", boardsRoot);

// Report
const hasIssues =
  imagesWithoutTemplate.devices.length > 0 ||
  imagesWithoutTemplate.boards.length > 0 ||
  templatesWithNullImages.devices.length > 0 ||
  templatesWithNullImages.boards.length > 0 ||
  broken.length > 0 ||
  wrongProportions.length > 0;

console.log("CHECK DEVICES & BOARDS");
console.log("======================");

const MAX_ITEMS = 15;
function section(title: string, count: number, items: string[], showFull: boolean) {
  console.log(`\n${title} (${count})`);
  if (count > 0) {
    const limit = showFull ? items.length : MAX_ITEMS;
    const show = items.slice(0, limit);
    show.forEach((l) => console.log(`  ${l}`));
    if (!showFull && items.length > MAX_ITEMS) console.log(`  ... and ${items.length - MAX_ITEMS} more`);
  }
}

section(
  "IMAGES WITHOUT TEMPLATE",
  imagesWithoutTemplate.devices.length + imagesWithoutTemplate.boards.length,
  [
    ...imagesWithoutTemplate.devices.map((p) => `devices/${p}`),
    ...imagesWithoutTemplate.boards.map((p) => `boards/${p}`),
  ],
  full
);

section(
  "TEMPLATES WITH NULL IMAGES",
  templatesWithNullImages.devices.length + templatesWithNullImages.boards.length,
  [
    ...templatesWithNullImages.devices.map((t) => `${t.id} (${t.model})`),
    ...templatesWithNullImages.boards.map((t) => `${t.id} (${t.model})`),
  ],
  full
);

section(
  "TEMPLATES WITH BROKEN IMAGE LINK",
  broken.length,
  broken.map((b) => `${b.id} -> ${b.image}`),
  full
);

section(
  `TEMPLATES WITH WRONG PROPORTIONS (${tolerance * 100}% tol)`,
  wrongProportions.length,
  wrongProportions.map((w) => `${w.id} (${w.model}): ${w.pct.toFixed(1)}% off`),
  full
);

if (!hasIssues) {
  console.log("\nAll checks passed.");
}
process.exit(hasIssues ? 1 : 0);
