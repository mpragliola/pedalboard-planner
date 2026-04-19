import type { Page, Locator } from "@playwright/test";

export class CatalogPage {
  readonly page: Page;
  readonly panel: Locator;
  readonly firstItem: Locator;

  constructor(page: Page) {
    this.page = page;
    this.panel = page.locator(".catalog-panel");
    this.firstItem = page.locator(".catalog-panel .catalog-list-item").first();
  }

  async switchToDevices(): Promise<void> {
    await this.page.getByRole("button", { name: "Devices" }).click();
    await this.firstItem.waitFor({ state: "visible" });
  }

  async switchToBoards(): Promise<void> {
    await this.page.getByRole("button", { name: "Boards" }).click();
    await this.firstItem.waitFor({ state: "visible" });
  }

  async searchFor(text: string): Promise<void> {
    await this.page.locator("#device-text-filter").fill(text);
  }

  async filterByType(type: string): Promise<void> {
    await this.page.locator("#device-type-filter").selectOption(type);
    await this.page.locator(".catalog-panel .catalog-list-item").first().waitFor({ state: "visible" });
  }

  async clickItem(index: number): Promise<void> {
    // Catalog items require a long-press drag onto the canvas (dnd-kit, 400ms delay).
    // Get the item's bounding box, then drag to canvas center.
    const item = this.page.locator(".catalog-panel .catalog-list-item").nth(index);
    const itemBox = await item.boundingBox();
    if (!itemBox) throw new Error(`Catalog item ${index} not found`);

    const fromX = itemBox.x + itemBox.width / 2;
    const fromY = itemBox.y + itemBox.height / 2;

    // Target the canvas center for the drop.
    const canvas = this.page.locator(".canvas");
    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) throw new Error("Canvas not found");

    const toX = canvasBox.x + canvasBox.width / 2;
    const toY = canvasBox.y + canvasBox.height / 2;

    // Long-press to activate dnd-kit sensor (> 400ms), then drag to canvas.
    await this.page.mouse.move(fromX, fromY);
    await this.page.mouse.down();
    await this.page.waitForTimeout(500); // exceed LONG_PRESS_MS (400ms)
    await this.page.mouse.move(toX, toY, { steps: 10 });
    await this.page.mouse.up();
  }

  async itemCount(): Promise<number> {
    return this.page.locator(".catalog-panel .catalog-list-item").count();
  }
}
