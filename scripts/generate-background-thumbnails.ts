#!/usr/bin/env node
/**
 * Generate square JPG thumbnails for canvas backgrounds.
 *
 * Defaults:
 * - input:  public/assets/backgrounds
 * - output: public/assets/backgrounds/thumbs
 * - size:   128x128
 * - quality: 82
 *
 * Usage:
 *   npx tsx scripts/generate-background-thumbnails.ts
 *   npx tsx scripts/generate-background-thumbnails.ts --size 160 --quality 85 --force
 *   npx tsx scripts/generate-background-thumbnails.ts --dry-run
 *
 * Requires:
 *   - ImageMagick (`magick`) in PATH
 */

import { spawnSync } from "child_process";
import { existsSync, mkdirSync, readdirSync } from "fs";
import path, { dirname, extname, join, relative } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

const backgroundsRoot = join(projectRoot, "public", "assets", "backgrounds");
const thumbsRoot = join(backgroundsRoot, "thumbs");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");
const size = readNumberFlag("--size", 128);
const quality = readNumberFlag("--quality", 82);

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg"]);
const SKIP_NAME_TOKENS = ["_rough_", "_disp_", "_normal_", "_nor_", "_metal_", "_ao_", "_arm_", "_height_"];

function readNumberFlag(flag: string, fallback: number): number {
  const index = args.indexOf(flag);
  if (index === -1 || index + 1 >= args.length) return fallback;
  const parsed = Number(args[index + 1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toPosixPath(value: string): string {
  return value.split(path.sep).join("/");
}

function walkFiles(dir: string): string[] {
  const out: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(abs));
    } else if (entry.isFile()) {
      out.push(abs);
    }
  }
  return out;
}

function isThumbnailCandidate(relativeInputPath: string): boolean {
  const rel = toPosixPath(relativeInputPath).toLowerCase();
  if (rel.startsWith("thumbs/")) return false;
  const ext = extname(rel).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(ext)) return false;
  const fileName = rel.split("/").at(-1) ?? "";
  if (SKIP_NAME_TOKENS.some((token) => fileName.includes(token))) return false;
  return true;
}

function toThumbnailRelativePath(relativeInputPath: string): string {
  const rel = toPosixPath(relativeInputPath);
  const ext = extname(rel);
  const stem = rel.slice(0, rel.length - ext.length);
  return `${stem}.thumb.jpg`;
}

function ensureMagickAvailable(): void {
  const check = spawnSync("magick", ["-version"], { stdio: "ignore" });
  if (check.error || check.status !== 0) {
    console.error("Error: ImageMagick (`magick`) not found in PATH.");
    process.exit(1);
  }
}

function generateThumbnail(inputPath: string, outputPath: string): boolean {
  const result = spawnSync(
    "magick",
    [
      inputPath,
      "-auto-orient",
      "-strip",
      "-thumbnail",
      `${size}x${size}^`,
      "-gravity",
      "center",
      "-extent",
      `${size}x${size}`,
      "-quality",
      String(quality),
      outputPath,
    ],
    { stdio: "inherit" }
  );
  return result.status === 0;
}

if (!existsSync(backgroundsRoot)) {
  console.error(`Error: backgrounds directory not found: ${backgroundsRoot}`);
  process.exit(1);
}

ensureMagickAvailable();

const absoluteInputs = walkFiles(backgroundsRoot);
const relativeInputs = absoluteInputs
  .map((absPath) => relative(backgroundsRoot, absPath))
  .filter((relPath) => isThumbnailCandidate(relPath));

if (relativeInputs.length === 0) {
  console.log("No background images found to process.");
  process.exit(0);
}

let generated = 0;
let skipped = 0;
let failed = 0;

for (const relativeInputPath of relativeInputs) {
  const inputPath = join(backgroundsRoot, relativeInputPath);
  const relativeOutputPath = toThumbnailRelativePath(relativeInputPath);
  const outputPath = join(thumbsRoot, relativeOutputPath);

  if (!force && existsSync(outputPath)) {
    skipped += 1;
    continue;
  }

  if (dryRun) {
    console.log(`[dry-run] ${relativeInputPath} -> ${toPosixPath(relative(backgroundsRoot, outputPath))}`);
    generated += 1;
    continue;
  }

  mkdirSync(dirname(outputPath), { recursive: true });
  const ok = generateThumbnail(inputPath, outputPath);
  if (ok) {
    generated += 1;
  } else {
    failed += 1;
  }
}

console.log(
  `Background thumbnails: generated=${generated}, skipped=${skipped}, failed=${failed}, size=${size}, quality=${quality}`
);

if (failed > 0) {
  process.exit(1);
}
