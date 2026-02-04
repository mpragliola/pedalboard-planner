#!/usr/bin/env node
/**
 * ============================================================================
 * Image Processing Script for Device/Board Catalog
 * ============================================================================
 * Processes raw product images to create clean, transparent PNGs for the catalog.
 *
 * PHASES:
 *   1. BORDERS - Add white borders around images to give rembg more context
 *                for edge detection (skip with --no-borders)
 *   2. BACKGROUND REMOVAL - Use rembg (AI-based) to remove backgrounds in bulk
 *   3. TRIMMING - Remove excess transparent space around the subject
 *
 * USAGE:
 *   npx tsx scripts/process-images.ts              # Full pipeline
 *   npx tsx scripts/process-images.ts --dry-run   # Preview without changes
 *   npx tsx scripts/process-images.ts --no-borders # Skip border phase
 *
 * REQUIREMENTS:
 *   - ImageMagick (magick) in PATH
 *   - rembg (set REMBG_PATH in .env or add to PATH)
 *
 * OPTIONAL .env for cleaner silhouettes:
 *   - REMBG_ALPHA_MATTING=1     Enable alpha matting (better edges, fewer dark halos)
 *   - REMBG_ERODE_SIZE=12       Alpha matting erode size (default 10)
 *   - REMBG_MODEL=isnet-general-use  Model: u2net|u2netp|isnet-general-use|birefnet-general|bria-rmbg
 * ============================================================================
 */

import { execSync, spawnSync, type SpawnSyncReturns } from "child_process";
import { existsSync, readdirSync, rmSync, mkdirSync, renameSync } from "fs";
import { join, dirname, extname, basename, parse as pathParse } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

config({ path: join(projectRoot, ".env") });

// Force CPU for ONNX Runtime
process.env.ONNXRUNTIME_PROVIDER = "CPUExecutionProvider";

// Parse args
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const noBorders = args.includes("--no-borders");

// Resolve paths
const defaultTargetDir = join(projectRoot, "public", "images", "devices", "_");
const targetDir = process.env.IMAGE_PROCESS_DIR ?? defaultTargetDir;
const outputDir = join(targetDir, "processed");
const tempBorderDir = join(targetDir, "temp_borders");

// Find rembg
function findRembg(): string | null {
  if (process.env.REMBG_PATH && existsSync(process.env.REMBG_PATH)) {
    return process.env.REMBG_PATH;
  }
  // Try to find in PATH
  try {
    const cmd = process.platform === "win32" ? "where rembg" : "which rembg";
    const result = execSync(cmd, { encoding: "utf-8" }).trim().split("\n")[0];
    if (result && existsSync(result)) return result;
  } catch {
    // Not found
  }
  return null;
}

const rembgPath = findRembg();
if (!rembgPath) {
  console.error("Error: rembg not found. Set REMBG_PATH in .env or add rembg to PATH.");
  process.exit(1);
}

if (!existsSync(targetDir)) {
  console.error(`Error: Directory not found: ${targetDir}`);
  process.exit(1);
}

/** Quote path for shell (spaces in filenames break magick/rembg on Windows). */
function quotePath(p: string): string {
  return /\s/.test(p) ? `"${p.replace(/"/g, '\\"')}"` : p;
}

// Helper to run commands
function run(
  cmd: string,
  runArgs: (string | number)[],
  options: Record<string, unknown> = {}
): SpawnSyncReturns<Buffer> {
  if (dryRun) return { status: 0 } as SpawnSyncReturns<Buffer>;
  const quoted = runArgs.map((a) => (typeof a === "string" && /\s/.test(a) ? quotePath(a) : String(a)));
  return spawnSync(cmd, quoted, { stdio: "inherit", shell: true, ...options });
}

// Logging
function log(msg: string): void {
  console.log(`[process-images] ${msg}`);
}

// Empty and recreate temporary folders
if (!dryRun) {
  log("Cleaning output and temp directories...");
  for (const d of [outputDir, tempBorderDir]) {
    if (existsSync(d)) rmSync(d, { recursive: true, force: true });
  }
  mkdirSync(outputDir, { recursive: true });
  if (!noBorders) mkdirSync(tempBorderDir, { recursive: true });
}

// Get source files
const imageExts = [".png", ".jpg", ".jpeg", ".webp", ".avif"];
const files = readdirSync(targetDir).filter((f) => {
  const ext = extname(f).toLowerCase();
  return imageExts.includes(ext);
});

log(`Found ${files.length} images in ${targetDir}`);

// PHASE 1: Add borders
if (!noBorders && files.length > 0) {
  log("Phase 1: Adding borders...");
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    log(`  [${i + 1}/${files.length}] ${file}`);
    const inputPath = join(targetDir, file);
    const baseName = basename(file, extname(file));
    const borderedPath = join(tempBorderDir, `${baseName}.png`);
    run("magick", [inputPath, "-bordercolor", "white", "-border", "100x100", borderedPath]);
  }
}

// PHASE 2: Background removal
const rembgInputDir = noBorders ? targetDir : tempBorderDir;
log("Phase 2: Background removal (rembg)...");
const rembgArgs: string[] = ["p"];
if (process.env.REMBG_ALPHA_MATTING === "1" || process.env.REMBG_ALPHA_MATTING === "true") {
  rembgArgs.push("-a");
  const erode = process.env.REMBG_ERODE_SIZE;
  if (erode) rembgArgs.push("-ae", erode);
}
if (process.env.REMBG_MODEL) rembgArgs.push("-m", process.env.REMBG_MODEL);
rembgArgs.push(rembgInputDir, outputDir);
run(rembgPath, rembgArgs);

// PHASE 3: Advanced Trimming with Mask
if (!dryRun) {
  const processedFiles = readdirSync(outputDir).filter((f) => f.endsWith(".png"));
  log(`Phase 3: Trimming ${processedFiles.length} images...`);
  for (let i = 0; i < processedFiles.length; i++) {
    const file = processedFiles[i];
    log(`  [${i + 1}/${processedFiles.length}] ${file}`);
    const filePath = join(outputDir, file);
    // Output is overwritten in place for simplicity (or can use out2 if needed)
    // Use a temp file then overwrite
    const { name } = pathParse(filePath);
    const tempTrimPath = join(outputDir, `${name}_trimmed.png`);
    // magick out.png "(" +clone -alpha extract -threshold 60% ")" -compose CopyOpacity -composite -trim +repage out2.png
    run("magick", [
      filePath,
      "(",
      "+clone",
      "-alpha",
      "extract",
      "-threshold",
      "70%",
      ")",
      "-compose",
      "CopyOpacity",
      "-composite",
      "-trim",
      "+repage",
      tempTrimPath,
    ]);
    // Overwrite input with trimmed image
    if (existsSync(tempTrimPath)) {
      try {
        rmSync(filePath, { force: true });
      } catch {
        // ignore
      }
      try {
        renameSync(tempTrimPath, filePath);
      } catch (e) {
        console.error(`Failed to overwrite ${filePath} with trimmed image:`, e);
      }
    }
  }
  if (existsSync(tempBorderDir)) {
    log("Removing temp_borders...");
    rmSync(tempBorderDir, { recursive: true, force: true });
  }
}

log(`Done. Processed ${files.length} files -> ${outputDir}`);
