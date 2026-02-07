import { describe, expect, it } from "vitest";
import {
  CAMERA_FOV_DEG,
  createCamera,
  depthForPoint,
  faceCenter,
  faceDepth,
  faceNormal,
  isFaceVisible,
  projectPerspective,
} from "./geometry3d";
import type { Vec3 } from "./vector";

describe("geometry3d helpers", () => {
  it("creates camera basis vectors from radius/yaw/pitch", () => {
    const camera = createCamera({ x: 0, y: 0, z: 0 }, 10, 0, 0);
    expect(camera.pos).toEqual({ x: 10, y: 0, z: 0 });
    expect(camera.fov).toBeCloseTo((CAMERA_FOV_DEG * Math.PI) / 180, 8);
    expect(camera.forward.x).toBeCloseTo(-1, 8);
    expect(camera.forward.y).toBeCloseTo(0, 8);
    expect(camera.forward.z).toBeCloseTo(0, 8);
    expect(camera.right.x).toBeCloseTo(0, 8);
    expect(camera.right.y).toBeCloseTo(1, 8);
    expect(camera.right.z).toBeCloseTo(0, 8);
    expect(camera.up.x).toBeCloseTo(0, 8);
    expect(camera.up.y).toBeCloseTo(0, 8);
    expect(camera.up.z).toBeCloseTo(1, 8);
  });

  it("uses fallback right vector near pitch pole singularity", () => {
    const camera = createCamera({ x: 0, y: 0, z: 0 }, 10, 0, Math.PI / 2);
    expect(camera.right.x).toBeCloseTo(1, 8);
    expect(camera.right.y).toBeCloseTo(0, 8);
    expect(camera.right.z).toBeCloseTo(0, 8);
  });

  it("projects points with perspective in camera space", () => {
    const camera = createCamera({ x: 0, y: 0, z: 0 }, 10, 0, 0);
    const center = projectPerspective({ x: 0, y: 0, z: 0 }, camera);
    expect(center.x).toBeCloseTo(0, 8);
    expect(center.y).toBeCloseTo(0, 8);

    const offset = projectPerspective({ x: 0, y: 1, z: 0 }, camera);
    expect(offset.x).toBeLessThan(0);
    expect(offset.y).toBeCloseTo(0, 8);
  });

  it("clamps projection depth for points behind camera", () => {
    const camera = createCamera({ x: 0, y: 0, z: 0 }, 10, 0, 0);
    const projected = projectPerspective({ x: 20, y: 1, z: 0 }, camera);
    expect(Number.isFinite(projected.x)).toBe(true);
    expect(Number.isFinite(projected.y)).toBe(true);
    expect(Math.abs(projected.x)).toBeGreaterThan(100);
  });

  it("computes face depth/center/normal and visibility", () => {
    const camera = createCamera({ x: 0, y: 0, z: 0 }, 10, 0, 0);
    const points: Vec3[] = [
      { x: 0, y: -1, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 0, y: 0, z: 1 },
    ];
    expect(depthForPoint(points[0], camera)).toBeCloseTo(10, 8);
    expect(faceDepth(points, camera)).toBeCloseTo(10, 8);
    expect(faceCenter(points)).toEqual({ x: 0, y: 0, z: 1 / 3 });

    const normal = faceNormal(points[0], points[1], points[2]);
    expect(normal.x).toBeCloseTo(1, 8);
    expect(normal.y).toBeCloseTo(0, 8);
    expect(normal.z).toBeCloseTo(0, 8);
    expect(isFaceVisible(points, normal, camera)).toBe(true);
    expect(isFaceVisible(points, { x: -1, y: 0, z: 0 }, camera)).toBe(false);
  });
});
