import type { Page, Locator } from "@playwright/test";

export class BoardMenuPage {
  readonly page: Page;
  readonly confirmationDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.confirmationDialog = page.locator(".confirmation-dialog");
  }

  async clickNew(): Promise<void> {
    await this.page.getByTitle("New pedalboard (clear current)").click();
    await this.confirmationDialog.waitFor({ state: "visible" });
  }

  async confirmNew(): Promise<void> {
    await this.page.locator("button.confirmation-confirm").click();
    await this.confirmationDialog.waitFor({ state: "hidden" });
  }

  async openSettings(): Promise<void> {
    await this.page.getByTitle("Settings").click();
    await this.page.locator(".modal-content").first().waitFor({ state: "visible" });
  }

  async openGpt(): Promise<void> {
    await this.page.getByTitle("Build price estimate prompt for LLM").click();
    await this.page.locator(".modal-content").first().waitFor({ state: "visible" });
  }
}
