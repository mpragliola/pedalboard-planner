import type { CanvasObjectType, Cable } from "../types";

export interface PricePromptOptions {
  includeMaterials: boolean;
  includeCommentsAndTips: boolean;
  location: string;
  cables: Cable[];
  unit: "mm" | "in";
  getObjectName: (id: string) => string;
}

/**
 * Builds a prompt for an LLM to estimate pedalboard price from canvas objects and options.
 */
export class PromptBuilder {
  constructor(private readonly objects: CanvasObjectType[], private readonly options: PricePromptOptions) {}

  /** List of components as bullet lines (name, optional brand/model). */
  getComponentsList(): string {
    if (this.objects.length === 0) return "(no components on canvas)";
    return this.objects
      .map((o) => {
        const extra = o.brand || o.model ? ` (${[o.brand, o.model].filter(Boolean).join(" ")})` : "";
        return `- ${o.name}${extra}`;
      })
      .join("\n");
  }

  /** Cable length in mm (canvas units). */
  private cableLengthMm(cable: Cable): number {
    return cable.segments.reduce((sum, s) => sum + Math.hypot(s.x2 - s.x1, s.y2 - s.y1), 0);
  }

  /** Format length for prompt: "at least X mm" or "at least X in". */
  private formatCableLength(mm: number): string {
    const { unit } = this.options;
    if (unit === "in") {
      const inches = mm / 25.4;
      return `at least ${inches.toFixed(2)} in`;
    }
    return `at least ${mm.toFixed(0)} mm`;
  }

  /** Cable layer list formatted for the prompt (connectors, optional names, length). */
  getCableList(): string {
    if (this.options.cables.length === 0) return "";
    return this.options.cables
      .map((cable) => {
        const lengthMm = this.cableLengthMm(cable);
        const lengthStr = this.formatCableLength(lengthMm);
        const a = cable.connectorAName ? `${cable.connectorA} (${cable.connectorAName})` : cable.connectorA;
        const b = cable.connectorBName ? `${cable.connectorB} (${cable.connectorBName})` : cable.connectorB;
        return `- Cable: ${a} / ${b}, ${lengthStr}`;
      })
      .join("\n");
  }

  /** Full prompt string for copy/paste into an LLM. */
  build(): string {
    const componentsList = this.getComponentsList();
    const parts: string[] = [
      "I am assembling a guitar pedalboard with the following setup. Please estimate the total price.",
      "",
      "Components:",
      componentsList,
      "",
    ];
    if (this.options.includeMaterials) {
      parts.push("Include cables, velcro and similar materials in the estimate.");
      const cableList = this.getCableList();
      if (cableList) {
        parts.push("", "Cables (drawn on cable layer):", cableList);
      }
    } else {
      parts.push("Exclude from the estimate: cables, velcro, and similar materials.");
    }
    parts.push("", "If you have web search capabilities, search the most recent prices.");
    const location = this.options.location.trim();
    if (location) {
      parts.push("", `Look up prices and stores considering I live in ${location}.`);
    }
    if (this.options.includeCommentsAndTips) {
      parts.push(
        "",
        "Comment on the configuration and provide comments, suggestions, gotchas (e.g. obsolete or hard-to-find machines), and similar."
      );
    } else {
      parts.push("", "Do not add further details, comments, or suggestions—only provide the price estimate.");
    }
    return parts.join("\n");
  }
}
