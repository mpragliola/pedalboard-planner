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
 *   node scripts/process-images.js              # Full pipeline
 *   node scripts/process-images.js --dry-run    # Preview without changes
 *   node scripts/process-images.js --no-borders # Skip border phase
 *
 * REQUIREMENTS:
 *   - ImageMagick (magick) in PATH
 *   - rembg (set REMBG_PATH in .env or add to PATH)
 * ============================================================================
 */

import { execSync, spawnSync } from "child_process";
import { existsSync, readdirSync, rmSync, mkdirSync, readFileSync } from "fs";
import { join, dirname, extname, basename } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Force CPU for ONNX Runtime
process.env.ONNXRUNTIME_PROVIDER = "CPUExecutionProvider";

// Load .env from project root
const projectRoot = dirname(__dirname);
const envFile = join(projectRoot, ".env");
if (existsSync(envFile)) {
  const envContent = readFileSync(envFile, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^\s*([^#][^=]+)=(.*)$/);
    if (match) {
      const name = match[1].trim();
      const value = match[2].trim();
      process.env[name] = value;
    }
  }
}

// Parse args
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const noBorders = args.includes("--no-borders");

// Resolve paths
const defaultTargetDir = join(projectRoot, "public", "images", "devices", "_");
const targetDir = process.env.IMAGE_PROCESS_DIR || defaultTargetDir;
const outputDir = join(targetDir, "processed");
const tempBorderDir = join(targetDir, "temp_borders");

// Find rembg
function findRembg() {
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

// Helper to run commands
function run(cmd, args, options = {}) {
  if (dryRun) return { status: 0 };
  return spawnSync(cmd, args, { stdio: "inherit", shell: true, ...options });
}

// Cleanup and create folders
if (!dryRun) {
  if (existsSync(outputDir)) rmSync(outputDir, { recursive: true, force: true });
  if (!noBorders && existsSync(tempBorderDir)) rmSync(tempBorderDir, { recursive: true, force: true });
  if (!noBorders) mkdirSync(tempBorderDir, { recursive: true });
  mkdirSync(outputDir, { recursive: true });
}

// Get source files
const imageExts = [".png", ".jpg", ".jpeg", ".webp", ".avif"];
const files = readdirSync(targetDir).filter((f) => {
  const ext = extname(f).toLowerCase();
  return imageExts.includes(ext);
});

// PHASE 1: Add borders
if (!noBorders) {
  for (const file of files) {
    const inputPath = join(targetDir, file);
    const baseName = basename(file, extname(file));
    const borderedPath = join(tempBorderDir, `${baseName}.png`);
    run("magick", [inputPath, "-bordercolor", "white", "-border", "100x100", borderedPath]);
  }
}

// PHASE 2: Background removal
const rembgInputDir = noBorders ? targetDir : tempBorderDir;
run(rembgPath, ["p", rembgInputDir, outputDir]);

// PHASE 3: Trimming
if (!dryRun) {
  const processedFiles = readdirSync(outputDir).filter((f) => f.endsWith(".png"));
  for (const file of processedFiles) {
    const filePath = join(outputDir, file);
    run("magick", [filePath, "-fuzz", "5%", "-trim", "+repage", filePath]);
  }
  if (!noBorders && existsSync(tempBorderDir)) {
    rmSync(tempBorderDir, { recursive: true, force: true });
  }
}

console.log(`Processed ${files.length} files -> ${outputDir}`);
