import { test, expect } from "@playwright/test";
import { AppPage } from "./pages/AppPage";
import { CatalogPage } from "./pages/CatalogPage";
import { CanvasPage } from "./pages/CanvasPage";
import { BoardMenuPage } from "./pages/BoardMenuPage";
import { BASE_STATE } from "./helpers";

test.describe("persistence", () => {
  test("placed object survives page reload", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    const catalog = new CatalogPage(page);
    const canvas = new CanvasPage(page);

    await catalog.clickItem(0);
    await page.waitForTimeout(500);

    const beforeObjects = await canvas.getStoredObjects();
    expect(beforeObjects.length).toBeGreaterThan(0);

    await page.reload();
    await page.locator(".canvas").waitFor({ state: "visible" });

    const afterObjects = await canvas.getStoredObjects();
    expect(afterObjects.length).toBe(beforeObjects.length);
    expect(afterObjects[0].id).toBe(beforeObjects[0].id);
  });

  test("New board clears stored state", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto(BASE_STATE);
    const canvas = new CanvasPage(page);
    const boardMenu = new BoardMenuPage(page);

    const before = await canvas.getStoredObjects();
    expect(before.length).toBeGreaterThan(0);

    await boardMenu.clickNew();
    await boardMenu.confirmNew();
    await page.waitForTimeout(300);

    const after = await canvas.getStoredObjects();
    expect(after.length).toBe(0);
  });
});
