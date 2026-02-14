/** 3D shape descriptors for device/board rendering. Default is "box" (cuboid). */

/** Wedge: front face shorter than back, tilted top face. */
export type WedgeShape = { type: "wedge"; ratio: number };

/** Boss-type pedal: cuboid with a step (lower front, taller back). */
export type BossTypeShape = { type: "pedal-boss-type"; ratio: number };

/** Wah: top face narrows toward front (front edge ~80% of back edge). */
export type WahShape = { type: "wah" };

/** Half-wedge: partly flat top, partly tilted toward front. */
export type HalfWedgeShape = {
  type: "half-wedge";
  topRatio: number;
  frontRatio: number;
};

/** Rail-wedge: wedge with a flat horizontal rail on the tilted surface. */
export type RailWedgeShape = {
  type: "rail-wedge";
  position: number;
  rail: number;
  ratio: number;
};

export type Shape3D =
  | { type: "box" }
  | WedgeShape
  | BossTypeShape
  | WahShape
  | HalfWedgeShape
  | RailWedgeShape;

export const DEFAULT_SHAPE: Shape3D = { type: "box" };
