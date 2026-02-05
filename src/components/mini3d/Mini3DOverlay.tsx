import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "../../context/AppContext";
import { BASE_URL, DEFAULT_OBJECT_COLOR } from "../../constants";
import { getObjectDimensions } from "../../lib/stateManager";
import { normalizeRotation } from "../../lib/geometry";
import type { CanvasObjectType } from "../../types";
import "./Mini3DOverlay.css";

type Vec2 = { x: number; y: number };
type Vec3 = { x: number; y: number; z: number };
type Rgb = { r: number; g: number; b: number };
type Rect = { minX: number; minY: number; maxX: number; maxY: number };
type Camera = {
  pos: Vec3;
  right: Vec3;
  up: Vec3;
  forward: Vec3;
  fov: number;
};
type ImageCacheEntry = HTMLImageElement | "error";

const FALLBACK_COLOR: Rgb = { r: 72, g: 72, b: 82 };
const ROTATE_SPEED_RAD = Math.PI / 5;
const ROTATE_DRAG_SENS = 0.006;
const ROTATE_PITCH_SENS = 0.006;
const CAMERA_FOV_DEG = 36;
const DEFAULT_CAMERA_YAW = -Math.PI / 4;
const MIN_PITCH = 0.15;
const MAX_PITCH = 1.2;
const PITCH_OFFSET_MIN = -1.1;
const PITCH_OFFSET_MAX = 1.1;

function vec3Sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function vec3Dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function vec3Cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function vec3Length(v: Vec3): number {
  return Math.hypot(v.x, v.y, v.z);
}

function vec3Normalize(v: Vec3): Vec3 {
  const len = vec3Length(v);
  if (len === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function createCamera(center: Vec3, radius: number, yaw: number, pitch: number, fovDeg = CAMERA_FOV_DEG): Camera {
  const cosPitch = Math.cos(pitch);
  const pos = {
    x: center.x + Math.cos(yaw) * cosPitch * radius,
    y: center.y + Math.sin(yaw) * cosPitch * radius,
    z: center.z + Math.sin(pitch) * radius,
  };
  const target = center;
  const forward = vec3Normalize(vec3Sub(target, pos));
  const upWorld = { x: 0, y: 0, z: 1 };
  let right = vec3Cross(forward, upWorld);
  if (vec3Length(right) < 1e-6) right = { x: 1, y: 0, z: 0 };
  right = vec3Normalize(right);
  const up = vec3Cross(right, forward);
  return {
    pos,
    right,
    up,
    forward,
    fov: (fovDeg * Math.PI) / 180,
  };
}

function projectPerspective(p: Vec3, camera: Camera): Vec2 {
  const rel = vec3Sub(p, camera.pos);
  const xCam = vec3Dot(rel, camera.right);
  const yCam = vec3Dot(rel, camera.up);
  const zCam = Math.max(0.001, vec3Dot(rel, camera.forward));
  const f = 1 / Math.tan(camera.fov / 2);
  const scale = f / zCam;
  return { x: -xCam * scale, y: -yCam * scale };
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function resolveImageSrc(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("/") || path.startsWith("http") || path.startsWith("data:")) return path;
  const base = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
  return `${base}${path}`;
}

function clampChannel(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function parseColor(input: string): Rgb | null {
  const value = input.trim();
  if (value.startsWith("#")) {
    const hex = value.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b };
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b };
    }
  }
  const rgbMatch = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    return { r: Number(rgbMatch[1]), g: Number(rgbMatch[2]), b: Number(rgbMatch[3]) };
  }
  return null;
}

function shade(rgb: Rgb, factor: number): Rgb {
  return {
    r: clampChannel(rgb.r * factor),
    g: clampChannel(rgb.g * factor),
    b: clampChannel(rgb.b * factor),
  };
}

function rgba(rgb: Rgb, alpha: number): string {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function getTextureImage(
  src: string,
  imageCache: Map<string, ImageCacheEntry>,
  onLoad: () => void
): HTMLImageElement | null {
  const cachedImage = imageCache.get(src);
  if (cachedImage === "error") return null;
  let img = cachedImage as HTMLImageElement | undefined;
  if (!img) {
    img = new Image();
    img.decoding = "async";
    img.src = src;
    img.onload = () => onLoad();
    img.onerror = () => {
      imageCache.set(src, "error");
      onLoad();
    };
    imageCache.set(src, img);
  }
  if (!img.complete || img.naturalWidth === 0) return null;
  return img;
}

interface Face {
  points: Vec2[];
  depth: number;
  depths: number[];
  maxDepth: number;
  kind: "top" | "bottom" | "side";
  color: Rgb;
  shade: number;
  textureSrc?: string | null;
  uv?: Vec2[];
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return !(a.maxX <= b.minX || a.minX >= b.maxX || a.maxY <= b.minY || a.minY >= b.maxY);
}

function getFootprintRect(obj: CanvasObjectType): { rect: Rect; width: number; depth: number; height: number } | null {
  const [width, depth, rawHeight] = getObjectDimensions(obj);
  if (width <= 0 || depth <= 0) return null;
  const height = Math.max(0, rawHeight);
  const rotation = normalizeRotation(obj.rotation ?? 0);
  const is90or270 = rotation === 90 || rotation === 270;
  const bboxW = is90or270 ? depth : width;
  const bboxH = is90or270 ? width : depth;
  const left = obj.x + (width - bboxW) / 2;
  const top = obj.y + (depth - bboxH) / 2;
  return {
    rect: { minX: left, minY: top, maxX: left + bboxW, maxY: top + bboxH },
    width,
    depth,
    height,
  };
}

interface StackedObject {
  obj: CanvasObjectType;
  width: number;
  depth: number;
  height: number;
  baseZ: number;
  rect: Rect;
}

function computeStackedObjects(objects: CanvasObjectType[]): StackedObject[] {
  const stacked: StackedObject[] = [];
  for (const obj of objects) {
    const footprint = getFootprintRect(obj);
    if (!footprint) continue;
    let baseZ = 0;
    for (const below of stacked) {
      if (rectsOverlap(footprint.rect, below.rect)) {
        baseZ = Math.max(baseZ, below.baseZ + below.height);
      }
    }
    stacked.push({
      obj,
      width: footprint.width,
      depth: footprint.depth,
      height: footprint.height,
      baseZ,
      rect: footprint.rect,
    });
  }
  return stacked;
}

function getSceneMetrics(stacked: StackedObject[]): { center: Vec3; radius: number; basePitch: number } {
  if (stacked.length === 0) {
    return { center: { x: 0, y: 0, z: 0 }, radius: 1, basePitch: 0.35 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = 0;
  for (const s of stacked) {
    minX = Math.min(minX, s.rect.minX);
    minY = Math.min(minY, s.rect.minY);
    maxX = Math.max(maxX, s.rect.maxX);
    maxY = Math.max(maxY, s.rect.maxY);
    maxZ = Math.max(maxZ, s.baseZ + s.height);
  }
  const width = Math.max(1, maxX - minX);
  const depth = Math.max(1, maxY - minY);
  const radius = Math.max(200, Math.hypot(width, depth) * 0.9);
  const cameraHeight = Math.max(radius * 0.6, maxZ * 2);
  const basePitch = Math.atan2(cameraHeight, radius);
  return {
    center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2, z: maxZ * 0.35 },
    radius,
    basePitch,
  };
}

function faceDepth(points: Vec3[], camera: Camera): number {
  let sum = 0;
  for (const p of points) {
    sum += vec3Dot(vec3Sub(p, camera.pos), camera.forward);
  }
  return sum / points.length;
}

function depthForPoint(p: Vec3, camera: Camera): number {
  return vec3Dot(vec3Sub(p, camera.pos), camera.forward);
}

function faceNormal(a: Vec3, b: Vec3, c: Vec3): Vec3 {
  return vec3Normalize(vec3Cross(vec3Sub(b, a), vec3Sub(c, a)));
}

function faceCenter(points: Vec3[]): Vec3 {
  const sum = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y, z: acc.z + p.z }),
    { x: 0, y: 0, z: 0 }
  );
  const n = points.length || 1;
  return { x: sum.x / n, y: sum.y / n, z: sum.z / n };
}

function isFaceVisible(points: Vec3[], normal: Vec3, camera: Camera): boolean {
  const center = faceCenter(points);
  const viewDir = vec3Normalize(vec3Sub(camera.pos, center));
  return vec3Dot(normal, viewDir) > 0;
}

function buildFaces(objects: CanvasObjectType[], yaw: number, pitchOffset: number): Face[] {
  const stacked = computeStackedObjects(objects);
  const metrics = getSceneMetrics(stacked);
  const pitch = clamp(metrics.basePitch + pitchOffset, MIN_PITCH, MAX_PITCH);
  const camera = createCamera(metrics.center, metrics.radius, yaw, pitch);
  const lightDir = vec3Normalize({ x: -0.4, y: -0.6, z: 1 });
  const faces: Face[] = [];

  for (const data of stacked) {
    const { obj, width, depth, height, baseZ } = data;
    const rotation = (normalizeRotation(obj.rotation ?? 0) * Math.PI) / 180;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const cx = obj.x + width / 2;
    const cy = obj.y + depth / 2;
    const depthFor = (p: Vec3) => depthForPoint(p, camera);
    const local = [
      { x: -width / 2, y: -depth / 2 },
      { x: width / 2, y: -depth / 2 },
      { x: width / 2, y: depth / 2 },
      { x: -width / 2, y: depth / 2 },
    ];
    const baseWorld = local.map((p) => ({
      x: cx + p.x * cos - p.y * sin,
      y: cy + p.x * sin + p.y * cos,
      z: baseZ,
    }));
    const topWorld = baseWorld.map((p) => ({ x: p.x, y: p.y, z: baseZ + height }));
    const baseProj = baseWorld.map((p) => projectPerspective(p, camera));
    const topProj = topWorld.map((p) => projectPerspective(p, camera));
    const topDepths = topWorld.map(depthFor);
    const color = parseColor(obj.color ?? DEFAULT_OBJECT_COLOR) ?? FALLBACK_COLOR;
    const textureSrc = obj.image ? resolveImageSrc(obj.image) : null;
    const topUv = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ];

    const baseDepths = baseWorld.map(depthFor);
    const topNormal = faceNormal(topWorld[0], topWorld[1], topWorld[2]);
    if (isFaceVisible(topWorld, topNormal, camera)) {
      faces.push({
        points: topProj,
        depth: faceDepth(topWorld, camera),
        depths: topDepths,
        maxDepth: Math.max(...topDepths),
        kind: "top",
        color,
        shade: 1,
        textureSrc,
        uv: topUv,
      });
    }
    const bottomNormal = faceNormal(baseWorld[2], baseWorld[1], baseWorld[0]);
    if (isFaceVisible(baseWorld, bottomNormal, camera)) {
      faces.push({
        points: baseProj,
        depth: faceDepth(baseWorld, camera),
        depths: baseDepths,
        maxDepth: Math.max(...baseDepths),
        kind: "bottom",
        color,
        shade: 0.6,
      });
    }

    for (let i = 0; i < 4; i += 1) {
      const i2 = (i + 1) % 4;
      const world = [baseWorld[i], baseWorld[i2], topWorld[i2], topWorld[i]];
      const proj = [baseProj[i], baseProj[i2], topProj[i2], topProj[i]];
      const normal = faceNormal(world[0], world[1], world[2]);
      if (!isFaceVisible(world, normal, camera)) continue;
      const lit = Math.max(0, vec3Dot(normal, lightDir));
      const shade = 0.5 + 0.5 * lit;
      const sideDepths = world.map(depthFor);
      faces.push({
        points: proj,
        depth: faceDepth(world, camera),
        depths: sideDepths,
        maxDepth: Math.max(...sideDepths),
        kind: "side",
        color,
        shade,
      });
    }
  }
  return faces;
}

type Mat2D = { a: number; b: number; c: number; d: number; e: number; f: number };

function triangleTransform(
  s0: Vec2,
  s1: Vec2,
  s2: Vec2,
  d0: Vec2,
  d1: Vec2,
  d2: Vec2
): Mat2D {
  const denom = s0.x * (s1.y - s2.y) + s1.x * (s2.y - s0.y) + s2.x * (s0.y - s1.y);
  if (Math.abs(denom) < 1e-6) return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
  const a = (d0.x * (s1.y - s2.y) + d1.x * (s2.y - s0.y) + d2.x * (s0.y - s1.y)) / denom;
  const b = (d0.y * (s1.y - s2.y) + d1.y * (s2.y - s0.y) + d2.y * (s0.y - s1.y)) / denom;
  const c = (d0.x * (s2.x - s1.x) + d1.x * (s0.x - s2.x) + d2.x * (s1.x - s0.x)) / denom;
  const d = (d0.y * (s2.x - s1.x) + d1.y * (s0.x - s2.x) + d2.y * (s1.x - s0.x)) / denom;
  const e =
    (d0.x * (s1.x * s2.y - s2.x * s1.y) +
      d1.x * (s2.x * s0.y - s0.x * s2.y) +
      d2.x * (s0.x * s1.y - s1.x * s0.y)) /
    denom;
  const f =
    (d0.y * (s1.x * s2.y - s2.x * s1.y) +
      d1.y * (s2.x * s0.y - s0.x * s2.y) +
      d2.y * (s0.x * s1.y - s1.x * s0.y)) /
    denom;
  return { a, b, c, d, e, f };
}

function drawTexturedTriangle(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  s0: Vec2,
  s1: Vec2,
  s2: Vec2,
  d0: Vec2,
  d1: Vec2,
  d2: Vec2,
  alpha: number
) {
  const m = triangleTransform(s0, s1, s2, d0, d1, d2);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(d0.x, d0.y);
  ctx.lineTo(d1.x, d1.y);
  ctx.lineTo(d2.x, d2.y);
  ctx.closePath();
  ctx.clip();
  ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

function drawTexturedTriangleUv(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  uv0: Vec2,
  uv1: Vec2,
  uv2: Vec2,
  d0: Vec2,
  d1: Vec2,
  d2: Vec2,
  alpha: number
) {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const s0 = { x: uv0.x * w, y: uv0.y * h };
  const s1 = { x: uv1.x * w, y: uv1.y * h };
  const s2 = { x: uv2.x * w, y: uv2.y * h };
  drawTexturedTriangle(ctx, img, s0, s1, s2, d0, d1, d2, alpha);
}

function drawQuad(
  ctx: CanvasRenderingContext2D,
  points: Vec2[],
  fill: string | CanvasPattern,
  stroke: string,
  alpha = 1
) {
  if (points.length !== 4) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  ctx.lineTo(points[1].x, points[1].y);
  ctx.lineTo(points[2].x, points[2].y);
  ctx.lineTo(points[3].x, points[3].y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = stroke;
  ctx.stroke();
  ctx.restore();
}

function drawTexturedQuad(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  points: Vec2[],
  uv: Vec2[] | undefined,
  stroke: string,
  alpha = 1
) {
  if (points.length !== 4) return;
  const uv0 = uv?.[0] ?? { x: 0, y: 0 };
  const uv1 = uv?.[1] ?? { x: 1, y: 0 };
  const uv2 = uv?.[2] ?? { x: 1, y: 1 };
  const uv3 = uv?.[3] ?? { x: 0, y: 1 };
  drawTexturedTriangleUv(ctx, img, uv0, uv1, uv2, points[0], points[1], points[2], alpha);
  drawTexturedTriangleUv(ctx, img, uv0, uv2, uv3, points[0], points[2], points[3], alpha);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  ctx.lineTo(points[1].x, points[1].y);
  ctx.lineTo(points[2].x, points[2].y);
  ctx.lineTo(points[3].x, points[3].y);
  ctx.closePath();
  ctx.strokeStyle = stroke;
  ctx.stroke();
  ctx.restore();
}

export function Mini3DOverlay() {
  const { objects, showMini3d } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [autoRotate, setAutoRotate] = useState(false);
  const [imageTick, setImageTick] = useState(0);
  const yawRef = useRef(DEFAULT_CAMERA_YAW);
  const pitchRef = useRef(0);
  const rotateDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startYaw: number;
    startPitch: number;
  } | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const objectsRef = useRef(objects);
  const sizeRef = useRef(size);
  const imageCacheRef = useRef<Map<string, ImageCacheEntry>>(new Map());

  useEffect(() => {
    if (!showMini3d) return;
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [showMini3d]);

  useEffect(() => {
    objectsRef.current = objects;
  }, [objects]);

  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  const notifyImageLoaded = useCallback(() => {
    setImageTick((v) => v + 1);
  }, []);

  const drawScene = useCallback(
    (
      yaw: number,
      pitchOffset: number,
      currentObjects: CanvasObjectType[],
      currentSize: { width: number; height: number }
    ) => {
      if (!showMini3d) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const { width, height } = currentSize;
      if (width <= 0 || height <= 0) return;
      const dpr = window.devicePixelRatio || 1;
      const targetW = Math.max(1, Math.floor(width * dpr));
      const targetH = Math.max(1, Math.floor(height * dpr));
      if (canvas.width !== targetW) canvas.width = targetW;
      if (canvas.height !== targetH) canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const faces = buildFaces(currentObjects, yaw, pitchOffset);
      if (faces.length === 0) return;
      faces.sort((a, b) => {
        const byMax = b.maxDepth - a.maxDepth;
        if (byMax !== 0) return byMax;
        return b.depth - a.depth;
      });

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const face of faces) {
        for (const p of face.points) {
          minX = Math.min(minX, p.x);
          minY = Math.min(minY, p.y);
          maxX = Math.max(maxX, p.x);
          maxY = Math.max(maxY, p.y);
        }
      }
      const contentW = maxX - minX;
      const contentH = maxY - minY;
      if (contentW <= 0 || contentH <= 0) return;
      const padding = 12;
      const scale = Math.min((width - padding * 2) / contentW, (height - padding * 2) / contentH);
      if (!Number.isFinite(scale) || scale <= 0) return;
      const offsetX = padding + (width - padding * 2 - contentW * scale) / 2 - minX * scale;
      const offsetY = padding + (height - padding * 2 - contentH * scale) / 2 - minY * scale;

      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, offsetX * dpr, offsetY * dpr);
      ctx.lineJoin = "round";
      ctx.lineWidth = 1 / scale;

      const stroke = "rgba(0, 0, 0, 0.25)";
      for (const face of faces) {
        let fill: string | CanvasPattern = rgba(shade(face.color, face.shade), 0.9);
        if (face.kind === "top") {
          if (face.textureSrc) {
            const image = getTextureImage(face.textureSrc, imageCacheRef.current, notifyImageLoaded);
            if (image) {
              drawTexturedQuad(ctx, image, face.points, face.uv, stroke, 0.92);
              continue;
            } else {
              fill = rgba(shade(face.color, 1.02), 0.92);
            }
          } else {
            fill = rgba(shade(face.color, 1.02), 0.92);
          }
        } else if (face.kind === "bottom") {
          fill = rgba(shade(face.color, 0.55), 0.9);
        }
        drawQuad(ctx, face.points, fill, stroke);
      }
    },
    [showMini3d, notifyImageLoaded]
  );

  const handleRotatePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 1) return;
      e.preventDefault();
      e.stopPropagation();
      setAutoRotate(false);
      rotateDragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startYaw: yawRef.current,
        startPitch: pitchRef.current,
      };
      containerRef.current?.setPointerCapture(e.pointerId);
    },
    [setAutoRotate]
  );

  const handleRotatePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = rotateDragRef.current;
      if (!drag || e.pointerId !== drag.pointerId) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      yawRef.current = drag.startYaw + dx * ROTATE_DRAG_SENS;
      pitchRef.current = clamp(drag.startPitch + dy * ROTATE_PITCH_SENS, PITCH_OFFSET_MIN, PITCH_OFFSET_MAX);
      drawScene(yawRef.current, pitchRef.current, objectsRef.current, sizeRef.current);
    },
    [drawScene]
  );

  const handleRotatePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const drag = rotateDragRef.current;
    if (!drag || e.pointerId !== drag.pointerId) return;
    rotateDragRef.current = null;
    containerRef.current?.releasePointerCapture(e.pointerId);
  }, []);

  useEffect(() => {
    drawScene(yawRef.current, pitchRef.current, objects, size);
  }, [objects, size, showMini3d, imageTick, drawScene]);

  useEffect(() => {
    if (!showMini3d || !autoRotate) return;
    const step = (time: number) => {
      if (lastTimeRef.current == null) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      yawRef.current = (yawRef.current + ROTATE_SPEED_RAD * dt) % (Math.PI * 2);
      drawScene(yawRef.current, pitchRef.current, objectsRef.current, sizeRef.current);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimeRef.current = null;
    };
  }, [autoRotate, showMini3d, drawScene]);

  if (!showMini3d) return null;

  return (
    <div
      className="mini3d-overlay"
      ref={containerRef}
      role="button"
      tabIndex={0}
      aria-pressed={autoRotate}
      aria-label="Toggle 3D rotation"
      title={autoRotate ? "Stop rotation" : "Start rotation"}
      onClick={() => setAutoRotate((v) => !v)}
      onPointerDown={handleRotatePointerDown}
      onPointerMove={handleRotatePointerMove}
      onPointerUp={handleRotatePointerUp}
      onPointerCancel={handleRotatePointerUp}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setAutoRotate((v) => !v);
        }
      }}
    >
      <canvas className="mini3d-canvas" ref={canvasRef} />
    </div>
  );
}
