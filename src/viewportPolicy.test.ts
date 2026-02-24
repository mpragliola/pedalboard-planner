import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function readViewportContent(): string {
  const html = readFileSync(join(process.cwd(), "index.html"), "utf8");
  const match = html.match(/<meta\s+name=["']viewport["']\s+content=["']([^"']+)["']/i);
  return match?.[1] ?? "";
}

describe("mobile viewport policy", () => {
  it("keeps browser page zoom disabled so in-app gestures don't inflate the full UI", () => {
    const content = readViewportContent();

    expect(content).toContain("width=device-width");
    expect(content).toContain("initial-scale=1.0");
    expect(content).toContain("maximum-scale=1.0");
    expect(content).toContain("user-scalable=no");
  });
});
