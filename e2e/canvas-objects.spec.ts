import { test, expect } from "@playwright/test";
import { AppPage } from "./pages/AppPage";
import { CanvasPage } from "./pages/CanvasPage";
import { BASE_STATE, cc } from "./helpers";

const DS1 = cc(100 + 73 / 2, 100 + 129 / 2);

test.describe("canvas objects", () => {
  test("click object shows selection toolbar", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto(BASE_STATE);
    await app.minimizeCatalog();
    const canvas = new CanvasPage(page);

    await canvas.clickAt(DS1.x, DS1.y);

    await expect(canvas.selectionToolbar).toBeVisible();
  });

  test("click empty canvas deselects object", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto(BASE_STATE);
    await app.minimizeCatalog();
    const canvas = new CanvasPage(page);

    await canvas.clickAt(DS1.x, DS1.y);
    await expect(canvas.selectionToolbar).toBeVisible();

    // Click on empty canvas area to deselect (the app has no Escape-to-deselect shortcut).
    // At BASE_STATE zoom=1.5, the board fills ~(264,298)-(864,598); (400,650) is safely below it.
    await canvas.clickAt(400, 650);

    await expect(canvas.selectionToolbar).toBeHidden();
  });

  test("delete removes object from stored state", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto(BASE_STATE);
    await app.minimizeCatalog();
    const canvas = new CanvasPage(page);

    const beforeCount = (await canvas.getStoredObjects()).length;

    await canvas.clickAt(DS1.x, DS1.y);
    await expect(canvas.selectionToolbar).toBeVisible();
    await canvas.deleteSelected();

    await page.locator("button.confirmation-confirm").click();
    await page.locator(".confirmation-dialog").waitFor({ state: "hidden" });
    await page.waitForTimeout(800);

    const objects = await canvas.getStoredObjects();
    expect(objects.length).toBe(beforeCount - 1);
    expect(objects.find((o) => o.id === "obj-device-1")).toBeUndefined();
  });

  test("rotate changes stored object rotation by 90°", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto(BASE_STATE);
    await app.minimizeCatalog();
    const canvas = new CanvasPage(page);

    const before = await canvas.getStoredObjects();
    const beforeRotation = before.find((o) => o.id === "obj-device-1")!.rotation;

    await canvas.clickAt(DS1.x, DS1.y);
    await expect(canvas.selectionToolbar).toBeVisible();
    await canvas.rotate();
    await page.waitForTimeout(800);

    const after = await canvas.getStoredObjects();
    const afterRotation = after.find((o) => o.id === "obj-device-1")!.rotation;
    expect(afterRotation).toBe((beforeRotation + 90) % 360);
  });

  test("drag object changes stored position", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto(BASE_STATE);
    await app.minimizeCatalog();
    const canvas = new CanvasPage(page);

    const before = await canvas.getStoredObjects();
    const beforePos = before.find((o) => o.id === "obj-device-1")!.pos;

    await canvas.dragFrom(DS1, { x: DS1.x + 50, y: DS1.y });
    await page.waitForTimeout(800);

    const after = await canvas.getStoredObjects();
    const afterPos = after.find((o) => o.id === "obj-device-1")!.pos;
    expect(afterPos.x).toBeGreaterThan(beforePos.x);
  });

  test("undo after delete restores object", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto(BASE_STATE);
    await app.minimizeCatalog();
    const canvas = new CanvasPage(page);

    await canvas.clickAt(DS1.x, DS1.y);
    await expect(canvas.selectionToolbar).toBeVisible();
    await canvas.deleteSelected();
    await page.locator("button.confirmation-confirm").click();
    await page.locator(".confirmation-dialog").waitFor({ state: "hidden" });
    await page.waitForTimeout(800);

    await canvas.undo();
    await page.waitForTimeout(800);

    const objects = await canvas.getStoredObjects();
    expect(objects.find((o) => o.id === "obj-device-1")).toBeDefined();
  });

  test("redo after undo re-deletes object", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto(BASE_STATE);
    await app.minimizeCatalog();
    const canvas = new CanvasPage(page);

    await canvas.clickAt(DS1.x, DS1.y);
    await expect(canvas.selectionToolbar).toBeVisible();
    await canvas.deleteSelected();
    await page.locator("button.confirmation-confirm").click();
    await page.locator(".confirmation-dialog").waitFor({ state: "hidden" });
    await page.waitForTimeout(800);

    await canvas.undo();
    await page.waitForTimeout(800);
    await canvas.redo();
    await page.waitForTimeout(800);

    const objects = await canvas.getStoredObjects();
    expect(objects.find((o) => o.id === "obj-device-1")).toBeUndefined();
  });
});
