import type { Page, Locator } from "@playwright/test";

export class CablePage {
  readonly page: Page;
  readonly addCableModal: Locator;
  readonly cableToolbar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addCableModal = page.locator(".modal-content").first();
    this.cableToolbar = page.locator(".cable-toolbar");
  }

  async enterCableMode(): Promise<void> {
    await this.page.locator("button.cable-layer-toggle").click();
    await this.page.locator(".cable-layer-overlay").waitFor({ state: "visible" });
  }

  async exitCableMode(): Promise<void> {
    await this.page.keyboard.press("Escape");
  }

  async drawPoints(points: Array<{ x: number; y: number }>): Promise<void> {
    for (const point of points) {
      await this.page.mouse.click(point.x, point.y);
    }
  }

  async openAddCableModal(): Promise<void> {
    await this.page.locator("button.cable-layer-add-btn").waitFor({ state: "visible" });
    await this.page.locator("button.cable-layer-add-btn").click();
    await this.addCableModal.waitFor({ state: "visible" });
  }

  async clickCable(x: number, y: number): Promise<void> {
    await this.page.mouse.click(x, y);
    await this.cableToolbar.waitFor({ state: "visible" });
  }

  async deleteCable(): Promise<void> {
    await this.page.getByTitle("Delete cable").click();
  }

  async cycleCableVisibility(): Promise<void> {
    await this.page.locator("button.cables-visible-toggle").click();
  }
}
