import { describe, expect, it } from "vitest";
import { createInitialCableFormDraft } from "./AddCableModal";
import { CABLE_COLORS } from "../../constants/cables";
import type { Cable } from "../../types";

describe("createInitialCableFormDraft", () => {
  it("returns create-mode defaults when no initial cable is provided", () => {
    expect(createInitialCableFormDraft()).toEqual({
      color: CABLE_COLORS[0].hex,
      connectorA: "mono jack (TS)",
      connectorB: "mono jack (TS)",
      selectedTemplateName: "",
      connectorAName: "",
      connectorBName: "",
    });
  });

  it("maps edit-mode values from initial cable", () => {
    const cable: Cable = {
      id: "c1",
      segments: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
      color: "#FFFFFF",
      connectorA: "XLR male",
      connectorB: "XLR female",
      connectorAName: "Out",
      connectorBName: "In",
    };
    expect(createInitialCableFormDraft(cable)).toEqual({
      color: "#FFFFFF",
      connectorA: "XLR male",
      connectorB: "XLR female",
      selectedTemplateName: "XLR",
      connectorAName: "Out",
      connectorBName: "In",
    });
  });
});
