const bgAsset = (name: string) => `${import.meta.env.BASE_URL}assets/backgrounds/${name}`;

export const CANVAS_BACKGROUNDS = [
  {
    id: "floorboards",
    label: "Floorboards",
    imageUrl: bgAsset("floorboards.jpg"),
    repeat: "repeat",
  },
  {
    id: "studio-grid",
    label: "Studio Grid",
    imageUrl: bgAsset("studio-grid.svg"),
    repeat: "repeat",
  },
  {
    id: "rubber-mat",
    label: "Rubber Mat",
    imageUrl: bgAsset("rubber-mat.svg"),
    repeat: "repeat",
  },
  {
    id: "concrete",
    label: "Concrete",
    imageUrl: bgAsset("concrete.svg"),
    repeat: "repeat",
  },
] as const;

export type CanvasBackgroundId = (typeof CANVAS_BACKGROUNDS)[number]["id"];

export const DEFAULT_CANVAS_BACKGROUND: CanvasBackgroundId = "floorboards";

const CANVAS_BACKGROUND_ID_SET = new Set<string>(CANVAS_BACKGROUNDS.map((bg) => bg.id));

export function isCanvasBackgroundId(value: unknown): value is CanvasBackgroundId {
  return typeof value === "string" && CANVAS_BACKGROUND_ID_SET.has(value);
}
