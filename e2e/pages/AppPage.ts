import type { Page, Locator } from "@playwright/test";

export class AppPage {
  readonly page: Page;
  readonly canvas: Locator;

  constructor(page: Page) {
    this.page = page;
    this.canvas = page.locator(".canvas");
  }

  async goto(seedState?: string): Promise<void> {
    if (seedState) {
      await this.page.addInitScript((s: string) => {
        localStorage.setItem("pedal/state", s);
      }, seedState);
    }
    await this.page.goto("/");
    await this.canvas.waitFor({ state: "visible" });
  }

  async minimizeCatalog(): Promise<void> {
    const body = this.page.locator(".catalog-panel-body");
    const isMinimized = await body
      .evaluate((el) => el.classList.contains("minimized"))
      .catch(() => true);
    if (!isMinimized) {
      await this.page.locator("button.catalog-panel-toggle").click();
      await this.page.locator(".catalog-panel-body.minimized").waitFor({ state: "visible" });
    }
  }
}
