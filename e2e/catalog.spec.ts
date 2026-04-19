import { test, expect } from "@playwright/test";
import { AppPage } from "./pages/AppPage";
import { CatalogPage } from "./pages/CatalogPage";
import { CanvasPage } from "./pages/CanvasPage";

test.describe("catalog", () => {
  test("switch to Devices tab shows device items", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    const catalog = new CatalogPage(page);

    await catalog.switchToDevices();

    await expect(catalog.firstItem).toBeVisible();
  });

  test("filter by type narrows the list", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    const catalog = new CatalogPage(page);

    await catalog.switchToDevices();
    const allCount = await catalog.itemCount();

    await catalog.filterByType("multifx");
    const filteredCount = await catalog.itemCount();

    expect(filteredCount).toBeLessThan(allCount);
  });

  test("search by text narrows the list", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    const catalog = new CatalogPage(page);

    await catalog.switchToDevices();
    const allCount = await catalog.itemCount();

    await catalog.searchFor("boss");
    await page.waitForTimeout(300);
    const searchCount = await catalog.itemCount();

    expect(searchCount).toBeLessThan(allCount);
  });

  test("click a board item adds it to stored state", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    const catalog = new CatalogPage(page);
    const canvas = new CanvasPage(page);

    await catalog.clickItem(0);
    await page.waitForTimeout(800);

    const objects = await canvas.getStoredObjects();
    expect(objects.length).toBeGreaterThan(0);
    expect(objects.some((o) => o.subtype === "board")).toBe(true);
  });

  test("click a device item adds it to stored state", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    const catalog = new CatalogPage(page);
    const canvas = new CanvasPage(page);

    await catalog.switchToDevices();
    await catalog.clickItem(0);
    await page.waitForTimeout(800);

    const objects = await canvas.getStoredObjects();
    expect(objects.length).toBeGreaterThan(0);
    expect(objects.some((o) => o.subtype === "device")).toBe(true);
  });
});
