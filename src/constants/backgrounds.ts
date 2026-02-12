const bgAsset = (name: string) => `${import.meta.env.BASE_URL}assets/backgrounds/${name}`;

export const CANVAS_BACKGROUNDS = [
  { id: "floorboards", label: "Floorboards", imageUrl: bgAsset("floorboards.jpg") },
  { id: "studio-grid", label: "Studio Grid", imageUrl: bgAsset("studio-grid.svg") },
  { id: "rubber-mat", label: "Rubber Mat", imageUrl: bgAsset("rubber-mat.svg") },
  { id: "concrete", label: "Concrete", imageUrl: bgAsset("concrete.svg") },
  { id: "artificial-grass", label: "Artificial Grass", imageUrl: bgAsset("artificial grass.png") },
  { id: "brushed-metal", label: "Brushed Metal", imageUrl: bgAsset("brushed metal.png") },
  { id: "herringbone", label: "Herringbone", imageUrl: bgAsset("herringbone.png") },
  { id: "light-granite", label: "Light Granite", imageUrl: bgAsset("light granite.png") },
  { id: "majolica-tiles", label: "Majolica Tiles", imageUrl: bgAsset("majolica tiles.png") },
  { id: "tiles", label: "Tiles", imageUrl: bgAsset("tiles.jpg") },
] as const;

export type CanvasBackgroundId = (typeof CANVAS_BACKGROUNDS)[number]["id"];

export const DEFAULT_CANVAS_BACKGROUND: CanvasBackgroundId = "floorboards";

const CANVAS_BACKGROUND_ID_SET = new Set<string>(CANVAS_BACKGROUNDS.map((bg) => bg.id));

export function isCanvasBackgroundId(value: unknown): value is CanvasBackgroundId {
  return typeof value === "string" && CANVAS_BACKGROUND_ID_SET.has(value);
}
