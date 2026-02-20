import { describe, expect, it } from "vitest";
import type { BoardTemplate } from "../data/boards";
import type { DeviceTemplate } from "../data/devices";
import {
  applyDimensionFilters,
  applyTextFilter,
  deriveBoardBrands,
  deriveDeviceBrands,
  deriveTemplateRange,
  filterAndSortBoards,
  filterAndSortDevices,
} from "./catalogFilters";

const BOARD_FIXTURE: BoardTemplate[] = [
  { id: "b1", type: "classic", brand: "Boss", model: "Small", name: "Boss Small", wdh: [300, 200, 40], image: null },
  {
    id: "b2",
    type: "classic",
    brand: "Aclam",
    model: "Large",
    name: "Aclam Large",
    wdh: [600, 350, 40],
    image: null,
  },
  {
    id: "b3",
    type: "classic",
    brand: "Boss",
    model: "Medium",
    name: "Boss Medium",
    wdh: [450, 260, 40],
    image: null,
  },
];

const DEVICE_FIXTURE: DeviceTemplate[] = [
  { id: "d1", type: "power", brand: "Cioks", model: "Power A", name: "Power A", wdh: [100, 50, 30], image: null },
  { id: "d2", type: "pedal", brand: "Boss", model: "Pedal B", name: "Pedal B", wdh: [70, 120, 55], image: null },
  { id: "d3", type: "pedal", brand: "Aclam", model: "Pedal A", name: "Pedal A", wdh: [66, 121, 56], image: null },
];

describe("catalogFilters", () => {
  it("derives ranges and handles empty input", () => {
    expect(deriveTemplateRange(BOARD_FIXTURE, 0)).toEqual([300, 600]);
    expect(deriveTemplateRange([], 0)).toEqual([0, 0]);
  });

  it("derives distinct sorted brand lists", () => {
    expect(deriveBoardBrands(BOARD_FIXTURE)).toEqual(["Aclam", "Boss"]);
    expect(deriveDeviceBrands(DEVICE_FIXTURE, "")).toEqual(["Aclam", "Boss", "Cioks"]);
    expect(deriveDeviceBrands(DEVICE_FIXTURE, "pedal")).toEqual(["Aclam", "Boss"]);
  });

  it("applies text and dimension filters", () => {
    const textOut = applyTextFilter(BOARD_FIXTURE, "medium");
    expect(textOut.map((item) => item.id)).toEqual(["b3"]);

    const dimOut = applyDimensionFilters(
      BOARD_FIXTURE,
      { min: "400", max: "" },
      { min: "", max: "300" }
    );
    expect(dimOut.map((item) => item.id)).toEqual(["b3"]);
  });

  it("filters and sorts boards", () => {
    const out = filterAndSortBoards(BOARD_FIXTURE, {
      brand: "Boss",
      text: "",
      width: { min: "320", max: "" },
      depth: { min: "", max: "" },
    });
    expect(out.map((item) => item.id)).toEqual(["b3"]);
  });

  it("filters and sorts devices using device type order", () => {
    const out = filterAndSortDevices(DEVICE_FIXTURE, {
      brand: "",
      type: "",
      text: "",
      width: { min: "", max: "" },
      depth: { min: "", max: "" },
    });
    expect(out.map((item) => item.id)).toEqual(["d3", "d2", "d1"]);
  });
});
