#!/usr/bin/env node
/**
 * Dump all device and board templates. Optionally filter by text (matches any textual field).
 *
 * Usage:
 *   npm run dump-templates
 *   npm run dump-templates -- boss
 *   npm run dump-templates -- --filter=zoom
 *   npm run dump-templates -- -f "blue sky"
 */

import { DEVICE_TEMPLATES } from "../src/data/devices";
import { BOARD_TEMPLATES } from "../src/data/boards";

const args = process.argv.slice(2);
let filter: string | undefined;
for (const a of args) {
  if (a.startsWith("--filter=") || a.startsWith("-f=")) {
    filter = a.split("=", 2)[1];
    break;
  }
  if (a === "-f" && args[args.indexOf(a) + 1]) {
    filter = args[args.indexOf(a) + 1];
    break;
  }
  if (!a.startsWith("-")) {
    filter = a;
    break;
  }
}

const q = filter?.toLowerCase().trim() ?? "";

function matches(
  t: { id?: string; type?: string; brand?: string; model?: string; name?: string; image?: string | null; color?: string }
): boolean {
  if (!q) return true;
  const vals = [t.id, t.type, t.brand, t.model, t.name, t.image ?? "", t.color ?? ""]
    .filter(Boolean)
    .map(String)
    .map((v) => v.toLowerCase());
  return vals.some((v) => v.includes(q));
}

const devices = q ? DEVICE_TEMPLATES.filter(matches) : DEVICE_TEMPLATES;
const boards = q ? BOARD_TEMPLATES.filter(matches) : BOARD_TEMPLATES;

function dump(template: { id: string; type: string; brand: string; model: string; name: string; wdh: [number, number, number]; image: string | null }) {
  const [w, d, h] = template.wdh;
  return `${template.id}\t${template.type}\t${template.brand}\t${template.model}\t${template.name}\t${w}×${d}×${h} mm\t${template.image ?? "-"}`;
}

console.log("DEVICES");
console.log("id\ttype\tbrand\tmodel\tname\twdh\timage");
console.log("-".repeat(80));
devices.forEach((t) => console.log(dump(t)));

console.log("\nBOARDS");
console.log("id\ttype\tbrand\tmodel\tname\twdh\timage");
console.log("-".repeat(80));
boards.forEach((t) => console.log(dump(t)));

console.log(`\n${devices.length} devices, ${boards.length} boards${q ? ` (filter: "${filter}")` : ""}`);
