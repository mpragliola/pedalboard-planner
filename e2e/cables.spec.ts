import { test, expect } from "@playwright/test";
import { AppPage } from "./pages/AppPage";
import { CablePage } from "./pages/CablePage";
import { CanvasPage } from "./pages/CanvasPage";
import { BASE_STATE, cc } from "./helpers";

const DRAW_P1 = cc(200, 40);
const DRAW_P2 = cc(300, 40);
const CABLE1_MID = cc(181, 140);

test.describe("cables", () => {
  test("enter cable mode shows overlay", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto(BASE_STATE);
    await app.minimizeCatalog();
    const cable = new CablePage(page);

    await cable.enterCableMode();

    await expect(page.locator(".cable-layer-overlay")).toBeVisible();
  });

  test("draw two points shows add-cable button", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto(BASE_STATE);
    await app.minimizeCatalog();
    const cable = new CablePage(page);

    await cable.enterCableMode();
    await cable.drawPoints([DRAW_P1, DRAW_P2]);

    await expect(page.locator("button.cable-layer-add-btn")).toBeVisible();
  });

  test("open add-cable modal", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto(BASE_STATE);
    await app.minimizeCatalog();
    const cable = new CablePage(page);

    await cable.enterCableMode();
    await cable.drawPoints([DRAW_P1, DRAW_P2]);
    await cable.openAddCableModal();

    await expect(cable.addCableModal).toBeVisible();
  });

  test("Escape cancels in-progress cable — overlay stays, add button hidden", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto(BASE_STATE);
    await app.minimizeCatalog();
    const cable = new CablePage(page);

    await cable.enterCableMode();
    await cable.drawPoints([DRAW_P1, DRAW_P2]);
    await expect(page.locator("button.cable-layer-add-btn")).toBeVisible();

    await cable.exitCableMode();

    await expect(page.locator(".cable-layer-overlay")).toBeVisible();
    await expect(page.locator("button.cable-layer-add-btn")).toBeHidden();
  });

  test("click existing cable shows cable toolbar", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto(BASE_STATE);
    await app.minimizeCatalog();
    const cable = new CablePage(page);

    await cable.clickCable(CABLE1_MID.x, CABLE1_MID.y);

    await expect(cable.cableToolbar).toBeVisible();
  });

  test("delete cable removes it from stored state", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto(BASE_STATE);
    await app.minimizeCatalog();
    const cable = new CablePage(page);
    const canvas = new CanvasPage(page);

    const beforeCount = (await canvas.getStoredCables()).length;

    await cable.clickCable(CABLE1_MID.x, CABLE1_MID.y);
    await cable.deleteCable();
    await page.locator("button.confirmation-confirm").click();
    await page.locator(".confirmation-dialog").waitFor({ state: "hidden" });
    await page.waitForTimeout(300);

    const cables = await canvas.getStoredCables();
    expect(cables.length).toBe(beforeCount - 1);
    expect(cables.find((c) => c.id === "cable-1")).toBeUndefined();
  });

  test("cycle cable visibility changes toggle button class", async ({ page }) => {
    const app = new AppPage(page);
    await app.goto(BASE_STATE);
    await app.minimizeCatalog();
    const cable = new CablePage(page);

    await cable.cycleCableVisibility();

    await expect(page.locator("button.cables-visible-toggle--dim")).toBeVisible();
  });
});
