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
    await this.page.locator(".catalog-panel .catalog-list-item").nth(index).click();
  }

  async itemCount(): Promise<number> {
    return this.page.locator(".catalog-panel .catalog-list-item").count();
  }
}
