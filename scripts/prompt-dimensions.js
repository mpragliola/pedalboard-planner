#!/usr/bin/env node
/**
 * Generate LLM prompts to find exact dimensions (width, depth, height in mm) for a brand's devices.
 * Usage: node scripts/prompt-dimensions.js <brand> [--group=N]
 * Example: node scripts/prompt-dimensions.js digitech
 * Example: node scripts/prompt-dimensions.js digitech --group=5
 *
 * If --group=N with N > 1, one prompt will ask about N devices (batched).
 * Output: prompts to be sent to an LLM. The LLM is asked to return TypeScript
 * constants in the form: const WDH_<NAME> = [ width, depth, height ];
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const devicesPath = join(projectRoot, "src", "data", "devices.ts");

// Parse args: <brand> and optional --group=N
let brandSlug = null;
let group = 1;
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg.startsWith("--group=")) {
    const n = parseInt(arg.slice("--group=".length), 10);
    if (!Number.isNaN(n) && n >= 1) group = n;
  } else if (!arg.startsWith("--")) {
    brandSlug = arg.toLowerCase().trim();
  }
}

if (!brandSlug) {
  console.error("Usage: node scripts/prompt-dimensions.js <brand> [--group=N]");
  console.error("Example: node scripts/prompt-dimensions.js digitech");
  console.error("Example: node scripts/prompt-dimensions.js digitech --group=5");
  process.exit(1);
}

/**
 * Derive a valid TypeScript constant name from model string.
 * e.g. "Whammy DT" -> "WHAMMY_DT", "GT-1000" -> "GT_1000", "RP360 XP" -> "RP360_XP"
 */
function modelToConstName(model) {
  return (
    model
      .toUpperCase()
      .replace(/\s+/g, "_")
      .replace(/-/g, "_")
      .replace(/\//g, "_")
      .replace(/[^A-Z0-9_]/g, "")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "") || "DEVICE"
  );
}

/**
 * Parse devices.ts to get the list of brand modules, then we need to load templates.
 * Since we're in plain Node and can't import TS, we parse the devices.ts file to find
 * which brands exist, then read each brand's file and extract model/name via regex.
 */
function getBrandModuleName(slug) {
  const part = slug.replace(/-/g, "_");
  const cap = part
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join("");
  return `${cap.toUpperCase()}_DEVICE_TEMPLATES`;
}

// Read devices.ts to see how brands are imported and aggregated
const devicesContent = readFileSync(devicesPath, "utf-8");
const brandImports = devicesContent.match(/import \{ (\w+) \} from ["'].*devices-brands\/([^"']+)["']/g) || [];
const slugToVar = {};
for (const line of brandImports) {
  const m = line.match(/from ["'].*devices-brands\/([^"']+)["']/);
  if (m) {
    const fileSlug = m[1].replace(/\.ts$/, "");
    const varMatch = line.match(/import \{ (\w+) \}/);
    if (varMatch) slugToVar[fileSlug] = varMatch[1];
  }
}

// Find which file and var correspond to our brand slug
const brandFile = brandSlug.replace(/_/g, "-");
const exportVar = slugToVar[brandFile];
if (!exportVar) {
  console.error(`Brand "${brandSlug}" not found. Known brands: ${Object.keys(slugToVar).sort().join(", ")}`);
  process.exit(1);
}

const brandFilePath = join(projectRoot, "src", "data", "devices-brands", `${brandFile}.ts`);
let brandContent;
try {
  brandContent = readFileSync(brandFilePath, "utf-8");
} catch (e) {
  console.error(`Could not read ${brandFilePath}:`, e.message);
  process.exit(1);
}

/**
 * Extract device entries from the brand file. Handles:
 * - row("Model", "Name", WDH_XXX, "image.png")
 * - pedal("Model", "Name", WDH_XXX, "image.png")
 * - multifx("Model", "Name", WDH_XXX, "image.png")
 * - { model: "X", name: "Y", wdh: [...], ... }
 */
function extractDevices(content, brandDisplay) {
  const devices = [];
  // Match function-style: row("Model", "Name", WDH_XXX, "image") or pedal(..., ..., ..., ...)
  const funcRe = /(?:row|pedal|multifx|controller|power)\s*\(\s*["']([^"']*)["']\s*,\s*["']([^"']*)["']/g;
  let m;
  while ((m = funcRe.exec(content)) !== null) {
    devices.push({ model: m[1], name: m[2] });
  }
  // Match object-style: { model: "X", name: "Y", ... } or model: "X", name: "Y"
  const objRe = /model:\s*["']([^"']*)["']\s*,\s*name:\s*["']([^"']*)["']/g;
  while ((m = objRe.exec(content)) !== null) {
    const model = m[1];
    const name = m[2];
    if (!devices.some((d) => d.model === model && d.name === name)) {
      devices.push({ model, name });
    }
  }
  return devices;
}

const brandDisplay = brandSlug
  .split("-")
  .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
  .join(" ");
const devices = extractDevices(brandContent, brandDisplay);

if (devices.length === 0) {
  console.error(`No devices found in ${brandFilePath}`);
  process.exit(1);
}

const totalPrompts = group > 1 ? Math.ceil(devices.length / group) : devices.length;
console.log(
  `# Dimension prompts for ${brandDisplay} (${devices.length} devices${
    group > 1 ? `, group=${group} → ${totalPrompts} prompts` : ""
  })\n`
);

if (group <= 1) {
  for (const d of devices) {
    const constName = modelToConstName(d.model);
    const fullName = d.name || `${brandDisplay} ${d.model}`;
    console.log(
      `Find me the exact measures of the device ${fullName} in mm. List them as TypeScript constants in the form:\n` +
        `const WDH_${constName} = [ <width>, <depth>, <height> ];\n`
    );
  }
} else {
  for (let i = 0; i < devices.length; i += group) {
    const chunk = devices.slice(i, i + group);
    const deviceList = chunk
      .map((d) => {
        const fullName = d.name || `${brandDisplay} ${d.model}`;
        const constName = modelToConstName(d.model);
        return `- ${fullName} → const WDH_${constName} = [ <width>, <depth>, <height> ];`;
      })
      .join("\n");
    console.log(
      `Find me the exact measures (width, depth, height in mm) of the following devices. ` +
        `List each as a TypeScript constant in the form: const WDH_<NAME> = [ <width>, <depth>, <height> ];\n\n` +
        `Devices:\n${deviceList}\n`
    );
  }
}
