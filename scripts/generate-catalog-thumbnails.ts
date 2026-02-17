#!/usr/bin/env node
/**
 * Generate 96px/192px WebP thumbnails for catalog assets.
 *
 * Input roots:
 * - public/images/boards
 * - public/images/devices
 *
 * Output root:
 * - public/images-thumbs
 *
 * Usage:
 *   npx tsx scripts/generate-catalog-thumbnails.ts
 *   npx tsx scripts/generate-catalog-thumbnails.ts --force
 *   npx tsx scripts/generate-catalog-thumbnails.ts --dry-run
 *   npx tsx scripts/generate-catalog-thumbnails.ts --sizes 80,160 --quality 78
 *
 * Requires ImageMagick (`magick`) in PATH.
 */

import { spawnSync } from "child_process";
import { existsSync, mkdirSync, readdirSync, statSync } from "fs";
import path, { dirname, extname, join, relative } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

const sourceRoot = join(projectRoot, "public", "images");
const outputRoot = join(projectRoot, "public", "images-thumbs");
const sourcePrefixes = ["boards", "devices"];
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".tif", ".tiff"]);

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");
const quality = readNumberFlag("--quality", 82);
const sizes = readSizesFlag("--sizes", [96, 192]);

function readNumberFlag(flag: string, fallback: number): number {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return fallback;
  const parsed = Number(args[idx + 1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readSizesFlag(flag: string, fallback: number[]): number[] {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return fallback;
  const raw = args[idx + 1]
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((v) => Number.isFinite(v) && v > 0)
    .map((v) => Math.round(v));
  if (raw.length === 0) return fallback;
  return [...new Set(raw)].sort((a, b) => a - b);
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

function isCandidate(relativeInputPath: string): boolean {
  const rel = toPosixPath(relativeInputPath).toLowerCase();
  if (!sourcePrefixes.some((prefix) => rel.startsWith(`${prefix}/`))) return false;
  const ext = extname(rel);
  return imageExtensions.has(ext);
}

function stripExtension(relPath: string): string {
  const ext = extname(relPath);
  return ext.length > 0 ? relPath.slice(0, -ext.length) : relPath;
}

function buildOutputRelativePath(relativeInputPath: string, sizePx: number): string {
  const stem = stripExtension(toPosixPath(relativeInputPath));
  return `${stem}.w${sizePx}.webp`;
}

function ensureMagickAvailable(): void {
  const check = spawnSync("magick", ["-version"], { stdio: "ignore" });
  if (check.error || check.status !== 0) {
    console.error("Error: ImageMagick (`magick`) not found in PATH.");
    process.exit(1);
  }
}

function shouldSkip(inputPath: string, outputPath: string): boolean {
  if (!existsSync(outputPath)) return false;
  const inStat = statSync(inputPath);
  const outStat = statSync(outputPath);
  return outStat.mtimeMs >= inStat.mtimeMs;
}

function generateThumb(inputPath: string, outputPath: string, sizePx: number): boolean {
  const result = spawnSync(
    "magick",
    [
      inputPath,
      "-auto-orient",
      "-strip",
      "-resize",
      `${sizePx}x${sizePx}`,
      "-background",
      "none",
      "-gravity",
      "center",
      "-extent",
      `${sizePx}x${sizePx}`,
      "-define",
      "webp:method=6",
      "-quality",
      String(quality),
      outputPath,
    ],
    { stdio: "inherit" }
  );
  return result.status === 0;
}

if (!existsSync(sourceRoot)) {
  console.error(`Error: source image root not found: ${sourceRoot}`);
  process.exit(1);
}

ensureMagickAvailable();

const absoluteInputs = walkFiles(sourceRoot);
const relativeInputs = absoluteInputs
  .map((absPath) => relative(sourceRoot, absPath))
  .filter((relPath) => isCandidate(relPath));

if (relativeInputs.length === 0) {
  console.log("No catalog images found to process.");
  process.exit(0);
}

let generated = 0;
let skipped = 0;
let failed = 0;

for (const relativeInputPath of relativeInputs) {
  const inputPath = join(sourceRoot, relativeInputPath);

  for (const sizePx of sizes) {
    const outputRel = buildOutputRelativePath(relativeInputPath, sizePx);
    const outputPath = join(outputRoot, outputRel);

    if (!force && shouldSkip(inputPath, outputPath)) {
      skipped += 1;
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] ${toPosixPath(relativeInputPath)} -> ${toPosixPath(relative(outputRoot, outputPath))}`);
      generated += 1;
      continue;
    }

    mkdirSync(dirname(outputPath), { recursive: true });
    const ok = generateThumb(inputPath, outputPath, sizePx);
    if (ok) generated += 1;
    else failed += 1;
  }
}

console.log(
  `Catalog thumbnails: generated=${generated}, skipped=${skipped}, failed=${failed}, sizes=${sizes.join("/")}, quality=${quality}`
);

if (failed > 0) {
  process.exit(1);
}