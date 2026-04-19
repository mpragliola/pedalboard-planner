import { test as base, type Page } from "@playwright/test";

export type TestFixtures = {
  seedState: (state: string) => Promise<Page>;
};

export const test = base.extend<TestFixtures>({
  seedState: async ({ page }, use) => {
    await use(async (state: string) => {
      await page.addInitScript((s: string) => {
        localStorage.setItem("pedal/state", s);
      }, state);
      await page.goto("/");
      await page.locator(".canvas").waitFor({ state: "visible" });
      return page;
    });
  },
});

export { expect } from "@playwright/test";
