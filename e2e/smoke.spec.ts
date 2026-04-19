import { test, expect } from "@playwright/test";
import { AppPage } from "./pages/AppPage";
import { CatalogPage } from "./pages/CatalogPage";

test.describe("smoke", () => {
  test("app loads — canvas and catalog panel visible", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();

    await expect(app.canvas).toBeVisible();
    await expect(page.locator(".catalog-panel")).toBeVisible();
  });

  test("empty state — no objects in stored state on first load", async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem("pedal/state"));
    await page.goto("/");
    await page.locator(".canvas").waitFor({ state: "visible" });

    const raw = await page.evaluate(() => localStorage.getItem("pedal/state"));
    if (raw) {
      const state = JSON.parse(raw);
      expect(state.objects?.length ?? 0).toBe(0);
    }
  });

  test("catalog shows boards by default", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();

    const catalog = new CatalogPage(page);
    await expect(catalog.firstItem).toBeVisible();
    await expect(page.getByRole("button", { name: "Boards" })).toBeVisible();
  });
});
