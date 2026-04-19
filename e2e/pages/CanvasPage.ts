import type { Page, Locator } from "@playwright/test";

interface StoredState {
  objects: Array<{ id: string; pos: { x: number; y: number }; rotation: number; [key: string]: unknown }>;
  cables: Array<{ id: string; [key: string]: unknown }>;
  [key: string]: unknown;
}

export class CanvasPage {
  readonly page: Page;
  readonly selectionToolbar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.selectionToolbar = page.locator(".selection-toolbar");
  }

  async clickAt(x: number, y: number): Promise<void> {
    await this.page.mouse.click(x, y);
  }

  async dragFrom(
    from: { x: number; y: number },
    to: { x: number; y: number },
  ): Promise<void> {
    await this.page.mouse.move(from.x, from.y);
    await this.page.mouse.down();
    await this.page.mouse.move(to.x, to.y, { steps: 10 });
    await this.page.mouse.up();
  }

  async deleteSelected(): Promise<void> {
    await this.page.getByTitle("Delete").first().click();
  }

  async rotate(): Promise<void> {
    await this.page.getByTitle("Rotate 90°").click();
  }

  async undo(): Promise<void> {
    await this.page.keyboard.press("Control+z");
  }

  async redo(): Promise<void> {
    await this.page.keyboard.press("Control+y");
  }

  async getStoredState(): Promise<StoredState> {
    const raw = await this.page.evaluate(() => localStorage.getItem("pedal/state"));
    return JSON.parse(raw ?? "{}") as StoredState;
  }

  async getStoredObjects(): Promise<StoredState["objects"]> {
    const state = await this.getStoredState();
    return state.objects ?? [];
  }

  async getStoredCables(): Promise<StoredState["cables"]> {
    const state = await this.getStoredState();
    return state.cables ?? [];
  }
}
