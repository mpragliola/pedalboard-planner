const bgAsset = (name: string) => `${import.meta.env.BASE_URL}assets/backgrounds/${name}`;
const proBgAsset = (path: string) => `${import.meta.env.BASE_URL}assets/backgrounds/pro/${path}`;

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
  {
    id: "pro-laminate-floor",
    label: "Pro Laminate Floor",
    imageUrl: proBgAsset("laminate_floor_02_2k/textures/laminate_floor_02_diff_2k.jpg"),
    mini3d: proMini3dTexture("laminate_floor_02_2k", "laminate_floor_02", {
      roughness: 0.74,
      metalness: 0.02,
      displacementScale: 0.108,
      displacementSegments: 96,
    }),
  },
  {
    id: "pro-brown-floor-tiles",
    label: "Pro Brown Floor Tiles",
    imageUrl: proBgAsset("brown_floor_tiles_2k/textures/brown_floor_tiles_diff_2k.jpg"),
    mini3d: proMini3dTexture("brown_floor_tiles_2k", "brown_floor_tiles", {
      roughness: 0.88,
      metalness: 0.03,
      displacementScale: 0.114,
      displacementSegments: 128,
    }),
  },
  {
    id: "pro-herringbone-parquet",
    label: "Pro Herringbone Parquet",
    imageUrl: proBgAsset("herringbone_parquet_2k/textures/herringbone_parquet_diff_2k.jpg"),
    mini3d: proMini3dTexture("herringbone_parquet_2k", "herringbone_parquet", {
      roughness: 0.82,
      metalness: 0.02,
      displacementScale: 0.111,
      displacementSegments: 96,
    }),
  },
  {
    id: "pro-gravel-concrete",
    label: "Pro Gravel Concrete",
    imageUrl: proBgAsset("gravel_concrete_03_2k/textures/gravel_concrete_03_diff_2k.jpg"),
    mini3d: proMini3dTexture("gravel_concrete_03_2k", "gravel_concrete_03", {
      roughness: 0.96,
      metalness: 0.01,
      displacementScale: 0.134,
      displacementSegments: 144,
    }),
  },
  {
    id: "pro-forest-ground",
    label: "Pro Forest Ground",
    imageUrl: proBgAsset("forrest_ground_01_2k/textures/forrest_ground_01_diff_2k.jpg"),
    mini3d: proMini3dTexture("forrest_ground_01_2k", "forrest_ground_01", {
      roughness: 0.98,
      metalness: 0,
      displacementScale: 0.145,
      displacementSegments: 160,
    }),
  },
  {
    id: "pro-wool-boucle",
    label: "Pro Wool Boucle",
    imageUrl: proBgAsset("wool_boucle_2k/textures/wool_boucle_diff_2k.jpg"),
    mini3d: proMini3dTexture("wool_boucle_2k", "wool_boucle", {
      roughness: 0.97,
      metalness: 0,
      displacementScale: 0.112,
      displacementSegments: 128,
    }),
  },
  {
    id: "pro-grey-tiles",
    label: "Pro Grey Tiles",
    imageUrl: proBgAsset("grey_tiles_2k/textures/grey_tiles_diff_2k.jpg"),
    mini3d: proMini3dTexture("grey_tiles_2k", "grey_tiles", {
      roughness: 0.9,
      metalness: 0.02,
      displacementScale: 0.116,
      displacementSegments: 128,
    }),
  },
  {
    id: "pro-old-linoleum-flooring",
    label: "Pro Old Linoleum Flooring",
    imageUrl: proBgAsset("old_linoleum_flooring_01_2k/textures/old_linoleum_flooring_01_diff_2k.jpg"),
    mini3d: proMini3dTexture("old_linoleum_flooring_01_2k", "old_linoleum_flooring_01", {
      roughness: 0.76,
      metalness: 0.02,
      displacementScale: 0.102,
      displacementSegments: 96,
    }),
  },
  {
    id: "pro-slab-tiles",
    label: "Pro Slab Tiles",
    imageUrl: proBgAsset("slab_tiles_2k/textures/slab_tiles_diff_2k.jpg"),
    mini3d: proMini3dTexture("slab_tiles_2k", "slab_tiles", {
      roughness: 0.87,
      metalness: 0.02,
      displacementScale: 0.12,
      displacementSegments: 128,
    }),
  },
] as const satisfies readonly CanvasBackgroundDefinition[];

export type CanvasBackgroundId = (typeof CANVAS_BACKGROUNDS)[number]["id"];
export type CanvasBackground = (typeof CANVAS_BACKGROUNDS)[number];

export const DEFAULT_CANVAS_BACKGROUND: CanvasBackgroundId = "floorboards";

const CANVAS_BACKGROUND_ID_SET = new Set<string>(CANVAS_BACKGROUNDS.map((bg) => bg.id));

export function isCanvasBackgroundId(value: unknown): value is CanvasBackgroundId {
  return typeof value === "string" && CANVAS_BACKGROUND_ID_SET.has(value);
}
