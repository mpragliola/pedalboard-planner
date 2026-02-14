const bgAsset = (name: string) => `${import.meta.env.BASE_URL}assets/backgrounds/${name}`;
const proBgAsset = (path: string) => `${import.meta.env.BASE_URL}assets/backgrounds/pro/${path}`;
const bgThumbAsset = (path: string) => `${import.meta.env.BASE_URL}assets/backgrounds/thumbs/${toThumbnailPath(path)}`;
const proBgThumbAsset = (path: string) => `${import.meta.env.BASE_URL}assets/backgrounds/thumbs/pro/${toThumbnailPath(path)}`;

function toThumbnailPath(path: string): string {
  return path.replace(/\.[^./]+$/, ".thumb.jpg");
}

export type Mini3dProTexture = {
  type: "pro";
  roughnessMapUrl: string;
  displacementMapUrl: string;
  bumpScale?: number;
  roughness?: number;
  metalness?: number;
  displacementScale?: number;
  displacementBias?: number;
  displacementSegments?: number;
};

type CanvasBackgroundDefinition = {
  id: string;
  label: string;
  imageUrl: string;
  previewImageUrl: string;
  mini3d?: Mini3dProTexture;
};

type ProMini3dOverrides = Partial<Omit<Mini3dProTexture, "type">>;

function proMini3dTexture(folder: string, baseName: string, overrides: ProMini3dOverrides = {}): Mini3dProTexture {
  return {
    type: "pro",
    roughnessMapUrl: proBgAsset(`${folder}/textures/${baseName}_rough_2k.jpg`),
    displacementMapUrl: proBgAsset(`${folder}/textures/${baseName}_disp_2k.jpg`),
    roughness: 0.9,
    metalness: 0.04,
    displacementScale: 0.02,
    displacementBias: 0,
    displacementSegments: 128,
    ...overrides,
  };
}

function canvasBackground(id: string, label: string, imagePath: string): CanvasBackgroundDefinition {
  return {
    id,
    label,
    imageUrl: bgAsset(imagePath),
    previewImageUrl: bgThumbAsset(imagePath),
  };
}

function proCanvasBackground(
  id: string,
  label: string,
  imagePath: string,
  mini3d: Mini3dProTexture
): CanvasBackgroundDefinition {
  return {
    id,
    label,
    imageUrl: proBgAsset(imagePath),
    previewImageUrl: proBgThumbAsset(imagePath),
    mini3d,
  };
}

export const CANVAS_BACKGROUNDS = [
  canvasBackground("floorboards", "Floorboards", "floorboards.jpg"),
  canvasBackground("studio-grid", "Studio Grid", "studio-grid.svg"),
  canvasBackground("rubber-mat", "Rubber Mat", "rubber-mat.svg"),
  canvasBackground("concrete", "Concrete", "concrete.svg"),
  canvasBackground("artificial-grass", "Artificial Grass", "artificial grass.png"),
  canvasBackground("brushed-metal", "Brushed Metal", "brushed metal.png"),
  canvasBackground("herringbone", "Herringbone", "herringbone.png"),
  canvasBackground("light-granite", "Light Granite", "light granite.png"),
  canvasBackground("majolica-tiles", "Majolica Tiles", "majolica tiles.png"),
  canvasBackground("tiles", "Tiles", "tiles.jpg"),
  proCanvasBackground(
    "pro-laminate-floor",
    "Pro Laminate Floor",
    "laminate_floor_02_2k/textures/laminate_floor_02_diff_2k.jpg",
    proMini3dTexture("laminate_floor_02_2k", "laminate_floor_02", {
      roughness: 0.74,
      metalness: 0.02,
      displacementScale: 0.108,
      displacementSegments: 96,
    })
  ),
  proCanvasBackground(
    "pro-brown-floor-tiles",
    "Pro Brown Floor Tiles",
    "brown_floor_tiles_2k/textures/brown_floor_tiles_diff_2k.jpg",
    proMini3dTexture("brown_floor_tiles_2k", "brown_floor_tiles", {
      roughness: 0.88,
      metalness: 0.03,
      displacementScale: 0.114,
      displacementSegments: 128,
    })
  ),
  proCanvasBackground(
    "pro-herringbone-parquet",
    "Pro Herringbone Parquet",
    "herringbone_parquet_2k/textures/herringbone_parquet_diff_2k.jpg",
    proMini3dTexture("herringbone_parquet_2k", "herringbone_parquet", {
      roughness: 0.82,
      metalness: 0.02,
      displacementScale: 0.111,
      displacementSegments: 96,
    })
  ),
  proCanvasBackground(
    "pro-gravel-concrete",
    "Pro Gravel Concrete",
    "gravel_concrete_03_2k/textures/gravel_concrete_03_diff_2k.jpg",
    proMini3dTexture("gravel_concrete_03_2k", "gravel_concrete_03", {
      roughness: 0.96,
      metalness: 0.01,
      displacementScale: 0.134,
      displacementSegments: 144,
    })
  ),
  proCanvasBackground(
    "pro-forest-ground",
    "Pro Forest Ground",
    "forrest_ground_01_2k/textures/forrest_ground_01_diff_2k.jpg",
    proMini3dTexture("forrest_ground_01_2k", "forrest_ground_01", {
      roughness: 0.98,
      metalness: 0,
      displacementScale: 0.145,
      displacementSegments: 160,
    })
  ),
  proCanvasBackground(
    "pro-wool-boucle",
    "Pro Wool Boucle",
    "wool_boucle_2k/textures/wool_boucle_diff_2k.jpg",
    proMini3dTexture("wool_boucle_2k", "wool_boucle", {
      roughness: 0.97,
      metalness: 0,
      displacementScale: 0.112,
      displacementSegments: 128,
    })
  ),
  proCanvasBackground(
    "pro-grey-tiles",
    "Pro Grey Tiles",
    "grey_tiles_2k/textures/grey_tiles_diff_2k.jpg",
    proMini3dTexture("grey_tiles_2k", "grey_tiles", {
      roughness: 0.9,
      metalness: 0.02,
      displacementScale: 0.116,
      displacementSegments: 128,
    })
  ),
  proCanvasBackground(
    "pro-old-linoleum-flooring",
    "Pro Old Linoleum Flooring",
    "old_linoleum_flooring_01_2k/textures/old_linoleum_flooring_01_diff_2k.jpg",
    proMini3dTexture("old_linoleum_flooring_01_2k", "old_linoleum_flooring_01", {
      roughness: 0.76,
      metalness: 0.02,
      displacementScale: 0.102,
      displacementSegments: 96,
    })
  ),
  proCanvasBackground(
    "pro-slab-tiles",
    "Pro Slab Tiles",
    "slab_tiles_2k/textures/slab_tiles_diff_2k.jpg",
    proMini3dTexture("slab_tiles_2k", "slab_tiles", {
      roughness: 0.87,
      metalness: 0.02,
      displacementScale: 0.12,
      displacementSegments: 128,
    })
  ),
] as const satisfies readonly CanvasBackgroundDefinition[];

export type CanvasBackgroundId = (typeof CANVAS_BACKGROUNDS)[number]["id"];
export type CanvasBackground = (typeof CANVAS_BACKGROUNDS)[number];

export const DEFAULT_CANVAS_BACKGROUND: CanvasBackgroundId = "floorboards";

const CANVAS_BACKGROUND_ID_SET = new Set<string>(CANVAS_BACKGROUNDS.map((bg) => bg.id));

export function isCanvasBackgroundId(value: unknown): value is CanvasBackgroundId {
  return typeof value === "string" && CANVAS_BACKGROUND_ID_SET.has(value);
}
