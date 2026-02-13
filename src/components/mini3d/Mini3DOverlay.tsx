import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useBoard } from "../../context/BoardContext";
import { useUi } from "../../context/UiContext";
import { CANVAS_BACKGROUNDS } from "../../constants/backgrounds";
import { BASE_URL } from "../../constants";
import { parseColor } from "../../lib/color";
import { normalizeRotation } from "../../lib/geometry";
import { rectsOverlap, type Rect } from "../../lib/geometry2d";
import { clamp } from "../../lib/math";
import { getObjectDimensions } from "../../lib/objectDimensions";
import "./Mini3DOverlay.scss";

const DEFAULT_YAW = -Math.PI / 4;
const DEFAULT_PITCH = 0.55;
const MIN_PITCH = 0.2;
const MAX_PITCH = 1.35;
const MIN_ORBIT_DISTANCE = 6.5;
const DRAG_SENSITIVITY = 0.006;
const OPEN_FADE_MS = 220;
const CLOSE_FADE_MS = 220;
const OVERLAY_OPACITY = 0.9;
const WORLD_SCALE = 0.01;
const MIN_BOX_HEIGHT = 0.12;
const GROUND_Y = -1.01;
const GROUND_PLANE_SIZE = 5000;
const GROUND_TILE_WORLD_SIZE = 3;
const FIT_PADDING_PX = 24;
const FIT_MAX_DISTANCE = 4000;
const DISTANCE_LERP = 0.12;
const MAX_DISTANCE_STEP = 0.35;
const BOX_TRANSITION_MS = 220;
const BOX_TRANSITION_EPSILON = 0.0001;
const EMPTY_IMAGE_DATA_URI = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
const DEVICE_ROUGHNESS = 0.28;
const DEVICE_METALNESS = 0.22;
const DEVICE_TOP_IMAGE_ROUGHNESS = 0.36;
const DEVICE_TOP_IMAGE_METALNESS = 0.14;
const BOARD_ROUGHNESS = 0.62;
const BOARD_METALNESS = 0.16;
const BOARD_TOP_IMAGE_ROUGHNESS = 0.66;
const BOARD_TOP_IMAGE_METALNESS = 0.14;
const MINI3D_DEFAULT_DEVICE_COLOR = "rgb(108, 116, 132)";
const MINI3D_PARSE_FALLBACK_COLOR = { r: 108, g: 116, b: 132 };

type SceneBox = {
  id: string;
  subtype: "board" | "device";
  width: number;
  depth: number;
  height: number;
  x: number;
  y: number;
  z: number;
  rotY: number;
  color: string;
  imageUrl: string | null;
};

type SceneLayout = {
  boxes: SceneBox[];
  orbitDistance: number;
  targetY: number;
};

type OverlayPhase = "opening" | "open" | "closing";
type Mini3DOverlayProps = { onCloseComplete?: () => void };
type CssVars = CSSProperties & Record<`--${string}`, string>;
type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  startYaw: number;
  startPitch: number;
};

interface Mini3DRootSceneProps {
  yawRef: MutableRefObject<number>;
  pitchRef: MutableRefObject<number>;
  backgroundImageUrl: string;
  showFloor: boolean;
  showShadows: boolean;
  layout: SceneLayout;
  freezeAutoFit: boolean;
}

function setOrbitPosition(
  out: THREE.Vector3,
  yaw: number,
  pitch: number,
  distance: number,
  targetY: number
): THREE.Vector3 {
  out.set(
    distance * Math.cos(pitch) * Math.sin(yaw),
    targetY + distance * Math.sin(pitch),
    distance * Math.cos(pitch) * Math.cos(yaw)
  );
  return out;
}

function computeBoxCorners(boxes: SceneBox[]): THREE.Vector3[] {
  const corners: THREE.Vector3[] = [];

  for (const box of boxes) {
    const halfW = box.width / 2;
    const halfH = box.height / 2;
    const halfD = box.depth / 2;
    const cosR = Math.cos(box.rotY);
    const sinR = Math.sin(box.rotY);

    const xs = [-halfW, halfW];
    const ys = [-halfH, halfH];
    const zs = [-halfD, halfD];

    for (const lx of xs) {
      for (const ly of ys) {
        for (const lz of zs) {
          const rx = lx * cosR - lz * sinR;
          const rz = lx * sinR + lz * cosR;
          corners.push(new THREE.Vector3(box.x + rx, box.y + ly, box.z + rz));
        }
      }
    }
  }

  return corners;
}

function easeOutCubic(value: number): number {
  const t = clamp(value, 0, 1);
  return 1 - (1 - t) ** 3;
}

function shortestAngleDelta(from: number, to: number): number {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

function resolveImageSrc(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("/") || path.startsWith("http")) return path;
  const base = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
  return `${base}${path}`;
}

type AnimatedSceneBoxProps = {
  box: SceneBox;
  showShadows: boolean;
};

function AnimatedSceneBox({ box, showShadows }: AnimatedSceneBoxProps) {
  const topTexture = useLoader(THREE.TextureLoader, box.imageUrl ?? EMPTY_IMAGE_DATA_URI);
  const meshRef = useRef<THREE.Mesh>(null);
  const initialPositionRef = useRef<[number, number, number]>([box.x, box.y, box.z]);
  const initialRotationRef = useRef<[number, number, number]>([0, box.rotY, 0]);
  const fromPositionRef = useRef(new THREE.Vector3(box.x, box.y, box.z));
  const targetPositionRef = useRef(new THREE.Vector3(box.x, box.y, box.z));
  const fromRotationYRef = useRef(box.rotY);
  const targetRotationYRef = useRef(box.rotY);
  const transitionStartRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const isDevice = box.subtype === "device";
  const baseRoughness = isDevice ? DEVICE_ROUGHNESS : BOARD_ROUGHNESS;
  const baseMetalness = isDevice ? DEVICE_METALNESS : BOARD_METALNESS;
  const topImageRoughness = isDevice ? DEVICE_TOP_IMAGE_ROUGHNESS : BOARD_TOP_IMAGE_ROUGHNESS;
  const topImageMetalness = isDevice ? DEVICE_TOP_IMAGE_METALNESS : BOARD_TOP_IMAGE_METALNESS;

  useEffect(() => {
    if (!box.imageUrl) return;
    topTexture.colorSpace = THREE.SRGBColorSpace;
    topTexture.wrapS = THREE.ClampToEdgeWrapping;
    topTexture.wrapT = THREE.ClampToEdgeWrapping;
    topTexture.needsUpdate = true;
  }, [box.imageUrl, topTexture]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || !hasInitializedRef.current) {
      fromPositionRef.current.set(box.x, box.y, box.z);
      targetPositionRef.current.set(box.x, box.y, box.z);
      fromRotationYRef.current = box.rotY;
      targetRotationYRef.current = box.rotY;
      transitionStartRef.current = 0;
      isAnimatingRef.current = false;
      hasInitializedRef.current = true;
      if (mesh) {
        mesh.position.set(box.x, box.y, box.z);
        mesh.rotation.set(0, box.rotY, 0);
      }
      return;
    }

    const currentPosition = mesh.position;
    const currentRotationY = mesh.rotation.y;

    fromPositionRef.current.copy(currentPosition);
    targetPositionRef.current.set(box.x, box.y, box.z);
    fromRotationYRef.current = currentRotationY;
    targetRotationYRef.current = currentRotationY + shortestAngleDelta(currentRotationY, box.rotY);

    const moved =
      currentPosition.distanceToSquared(targetPositionRef.current) >
        BOX_TRANSITION_EPSILON * BOX_TRANSITION_EPSILON ||
      Math.abs(targetRotationYRef.current - currentRotationY) > BOX_TRANSITION_EPSILON;

    if (!moved) {
      isAnimatingRef.current = false;
      mesh.position.set(box.x, box.y, box.z);
      mesh.rotation.set(0, box.rotY, 0);
      return;
    }

    transitionStartRef.current = performance.now();
    isAnimatingRef.current = true;
  }, [box.x, box.y, box.z, box.rotY]);

  useFrame(() => {
    if (!isAnimatingRef.current) return;

    const mesh = meshRef.current;
    if (!mesh) return;

    const elapsed = performance.now() - transitionStartRef.current;
    const t = clamp(elapsed / BOX_TRANSITION_MS, 0, 1);
    const easedT = easeOutCubic(t);

    mesh.position.lerpVectors(fromPositionRef.current, targetPositionRef.current, easedT);
    mesh.rotation.y = THREE.MathUtils.lerp(fromRotationYRef.current, targetRotationYRef.current, easedT);

    if (t >= 1) {
      isAnimatingRef.current = false;
      mesh.position.copy(targetPositionRef.current);
      mesh.rotation.y = targetRotationYRef.current;
    }
  });

  return (
    <mesh
      ref={meshRef}
      castShadow={showShadows}
      receiveShadow={showShadows}
      position={initialPositionRef.current}
      rotation={initialRotationRef.current}
    >
      <boxGeometry args={[box.width, box.height, box.depth]} />
      <meshStandardMaterial
        attach="material-0"
        color={box.color}
        roughness={baseRoughness}
        metalness={baseMetalness}
      />
      <meshStandardMaterial
        attach="material-1"
        color={box.color}
        roughness={baseRoughness}
        metalness={baseMetalness}
      />
      <meshStandardMaterial
        attach="material-2"
        color={box.imageUrl ? "#ffffff" : box.color}
        map={box.imageUrl ? topTexture : null}
        transparent={Boolean(box.imageUrl)}
        alphaTest={box.imageUrl ? 0.01 : 0}
        depthWrite={!box.imageUrl}
        roughness={box.imageUrl ? topImageRoughness : baseRoughness}
        metalness={box.imageUrl ? topImageMetalness : baseMetalness}
      />
      <meshStandardMaterial attach="material-3" color={box.color} roughness={baseRoughness} metalness={baseMetalness} />
      <meshStandardMaterial
        attach="material-4"
        color={box.color}
        roughness={baseRoughness}
        metalness={baseMetalness}
      />
      <meshStandardMaterial
        attach="material-5"
        color={box.color}
        roughness={baseRoughness}
        metalness={baseMetalness}
      />
    </mesh>
  );
}

function ShadowMapController({ enabled }: { enabled: boolean }) {
  const { gl } = useThree();

  useEffect(() => {
    gl.shadowMap.enabled = enabled;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.shadowMap.needsUpdate = true;
  }, [enabled, gl]);

  return null;
}

function Mini3DRootScene({
  yawRef,
  pitchRef,
  backgroundImageUrl,
  showFloor,
  showShadows,
  layout,
  freezeAutoFit,
}: Mini3DRootSceneProps) {
  const { camera, size } = useThree();
  const planeTexture = useLoader(THREE.TextureLoader, backgroundImageUrl);
  const fitCameraRef = useRef(new THREE.PerspectiveCamera(45, 1, 0.1, FIT_MAX_DISTANCE));
  const distanceRef = useRef(layout.orbitDistance);
  const orbitPosRef = useRef(new THREE.Vector3());
  const cameraSpaceRef = useRef(new THREE.Vector3());
  const ndcRef = useRef(new THREE.Vector3());
  const corners = useMemo(() => computeBoxCorners(layout.boxes), [layout.boxes]);
  const shadowFrustumHalfSize = useMemo(() => {
    let maxExtent = 4;
    for (const box of layout.boxes) {
      maxExtent = Math.max(
        maxExtent,
        Math.abs(box.x) + box.width / 2,
        Math.abs(box.z) + box.depth / 2
      );
    }
    return clamp(maxExtent * 1.3, 4, 20);
  }, [layout.boxes]);

  useEffect(() => {
    planeTexture.colorSpace = THREE.SRGBColorSpace;
    planeTexture.wrapS = THREE.RepeatWrapping;
    planeTexture.wrapT = THREE.RepeatWrapping;
    const repeat = Math.max(2, GROUND_PLANE_SIZE / GROUND_TILE_WORLD_SIZE);
    planeTexture.repeat.set(repeat, repeat);
    planeTexture.needsUpdate = true;
  }, [planeTexture]);

  useEffect(() => {
    if (freezeAutoFit) return;
    distanceRef.current = layout.orbitDistance;
  }, [freezeAutoFit, layout.orbitDistance]);

  useFrame(() => {
    const perspective = camera as THREE.PerspectiveCamera;
    if (!perspective.isPerspectiveCamera) return;

    const aspect = size.width / Math.max(1, size.height);
    if (Math.abs(perspective.aspect - aspect) > 1e-4) {
      perspective.aspect = aspect;
      perspective.updateProjectionMatrix();
    }

    const yaw = yawRef.current;
    const pitch = clamp(pitchRef.current, MIN_PITCH, MAX_PITCH);
    const fitCamera = fitCameraRef.current;
    fitCamera.fov = perspective.fov;
    fitCamera.near = perspective.near;
    fitCamera.far = FIT_MAX_DISTANCE;
    fitCamera.aspect = aspect;
    fitCamera.updateProjectionMatrix();

    const padNdcX = (FIT_PADDING_PX / Math.max(1, size.width)) * 2;
    const padNdcY = (FIT_PADDING_PX / Math.max(1, size.height)) * 2;

    const fits = (distance: number): boolean => {
      fitCamera.position.copy(setOrbitPosition(orbitPosRef.current, yaw, pitch, distance, layout.targetY));
      fitCamera.lookAt(0, layout.targetY, 0);
      fitCamera.updateMatrixWorld(true);

      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      for (const corner of corners) {
        cameraSpaceRef.current.copy(corner).applyMatrix4(fitCamera.matrixWorldInverse);
        if (!Number.isFinite(cameraSpaceRef.current.z) || cameraSpaceRef.current.z >= -fitCamera.near) {
          return false;
        }

        ndcRef.current.copy(corner).project(fitCamera);
        const xNdc = ndcRef.current.x;
        const yNdc = ndcRef.current.y;
        if (!Number.isFinite(xNdc) || !Number.isFinite(yNdc)) {
          return false;
        }

        minX = Math.min(minX, xNdc);
        maxX = Math.max(maxX, xNdc);
        minY = Math.min(minY, yNdc);
        maxY = Math.max(maxY, yNdc);
      }

      return (
        minX >= -1 + padNdcX &&
        maxX <= 1 - padNdcX &&
        minY >= -1 + padNdcY &&
        maxY <= 1 - padNdcY
      );
    };

    const findBestDistance = (): number => {
      if (corners.length === 0) return layout.orbitDistance;

      let low = 0.2;
      let high = Math.max(layout.orbitDistance, 1);

      while (fits(low) && low > 0.02) {
        high = low;
        low *= 0.6;
      }

      while (!fits(high) && high < FIT_MAX_DISTANCE) {
        high *= 1.35;
      }

      if (!fits(high)) return high;

      for (let i = 0; i < 24; i += 1) {
        const mid = (low + high) * 0.5;
        if (fits(mid)) {
          high = mid;
        } else {
          low = mid;
        }
      }

      return high;
    };

    if (!freezeAutoFit) {
      const targetDistance = findBestDistance();
      const eased = THREE.MathUtils.lerp(distanceRef.current, targetDistance, DISTANCE_LERP);
      const delta = clamp(eased - distanceRef.current, -MAX_DISTANCE_STEP, MAX_DISTANCE_STEP);
      distanceRef.current += delta;
    }

    camera.position.copy(setOrbitPosition(orbitPosRef.current, yaw, pitch, distanceRef.current, layout.targetY));
    camera.lookAt(0, layout.targetY, 0);
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight
        intensity={1.15}
        position={[4, 6, 5]}
        castShadow={showShadows}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-shadowFrustumHalfSize}
        shadow-camera-right={shadowFrustumHalfSize}
        shadow-camera-top={shadowFrustumHalfSize}
        shadow-camera-bottom={-shadowFrustumHalfSize}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />
      <directionalLight intensity={0.4} position={[-5, 2, -3]} />

      {showFloor ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GROUND_Y, 0]} receiveShadow={showShadows}>
          <planeGeometry args={[GROUND_PLANE_SIZE, GROUND_PLANE_SIZE]} />
          <meshStandardMaterial map={planeTexture} roughness={0.62} metalness={0.08} />
        </mesh>
      ) : null}

      {layout.boxes.map((box) => (
        <AnimatedSceneBox key={box.id} box={box} showShadows={showShadows} />
      ))}
    </>
  );
}

export function Mini3DOverlay({ onCloseComplete }: Mini3DOverlayProps) {
  const { objects, draggingObjectId } = useBoard();
  const { showMini3d, showMini3dFloor, showMini3dShadows, background } = useUi();

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const yawRef = useRef(DEFAULT_YAW);
  const pitchRef = useRef(DEFAULT_PITCH);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const [isVisible, setIsVisible] = useState(showMini3d);
  const [phase, setPhase] = useState<OverlayPhase>(showMini3d ? "open" : "closing");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasBackground = useMemo(
    () => CANVAS_BACKGROUNDS.find((bg) => bg.id === background) ?? CANVAS_BACKGROUNDS[0],
    [background]
  );
  const isBoardBeingDragged = useMemo(
    () => Boolean(draggingObjectId && objects.some((obj) => obj.id === draggingObjectId && obj.subtype === "board")),
    [draggingObjectId, objects]
  );
  const sceneLayout = useMemo<SceneLayout>(() => {
    const sceneObjects = objects.filter((obj) => obj.subtype === "board" || obj.subtype === "device");
    if (sceneObjects.length === 0) {
      return { boxes: [], orbitDistance: MIN_ORBIT_DISTANCE, targetY: GROUND_Y + 1 };
    }

    type RawObject = {
      id: string;
      subtype: "board" | "device";
      rect: Rect;
      centerX: number;
      centerY: number;
      width: number;
      depth: number;
      height: number;
      rotY: number;
      color: string;
      imageUrl: string | null;
    };

    const rawObjects: RawObject[] = [];
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let boardMinX = Infinity;
    let boardMaxX = -Infinity;
    let boardMinY = Infinity;
    let boardMaxY = -Infinity;
    let hasBoard = false;

    for (const obj of sceneObjects) {
      const [widthMm, depthMm, heightMm] = getObjectDimensions(obj);
      if (widthMm <= 0 || depthMm <= 0) continue;

      const rotation = normalizeRotation(obj.rotation ?? 0);
      const is90or270 = rotation === 90 || rotation === 270;
      const footprintW = is90or270 ? depthMm : widthMm;
      const footprintD = is90or270 ? widthMm : depthMm;

      const centerX = obj.pos.x + widthMm / 2;
      const centerY = obj.pos.y + depthMm / 2;

      minX = Math.min(minX, centerX - footprintW / 2);
      maxX = Math.max(maxX, centerX + footprintW / 2);
      minY = Math.min(minY, centerY - footprintD / 2);
      maxY = Math.max(maxY, centerY + footprintD / 2);
      if (obj.subtype === "board") {
        hasBoard = true;
        boardMinX = Math.min(boardMinX, centerX - footprintW / 2);
        boardMaxX = Math.max(boardMaxX, centerX + footprintW / 2);
        boardMinY = Math.min(boardMinY, centerY - footprintD / 2);
        boardMaxY = Math.max(boardMaxY, centerY + footprintD / 2);
      }

      const fallbackColor = obj.subtype === "board" ? "rgb(96, 106, 120)" : MINI3D_DEFAULT_DEVICE_COLOR;
      const parsed = parseColor(obj.color ?? fallbackColor) ?? MINI3D_PARSE_FALLBACK_COLOR;
      rawObjects.push({
        id: obj.id,
        subtype: obj.subtype,
        rect: {
          minX: centerX - footprintW / 2,
          maxX: centerX + footprintW / 2,
          minY: centerY - footprintD / 2,
          maxY: centerY + footprintD / 2,
        },
        centerX,
        centerY,
        width: widthMm,
        depth: depthMm,
        height: heightMm,
        rotY: (-rotation * Math.PI) / 180,
        color: `rgb(${parsed.r}, ${parsed.g}, ${parsed.b})`,
        imageUrl: resolveImageSrc(obj.image),
      });
    }

    if (rawObjects.length === 0 || !Number.isFinite(minX) || !Number.isFinite(minY)) {
      return { boxes: [], orbitDistance: MIN_ORBIT_DISTANCE, targetY: GROUND_Y + 1 };
    }

    const anchorMinX = hasBoard ? boardMinX : minX;
    const anchorMaxX = hasBoard ? boardMaxX : maxX;
    const anchorMinY = hasBoard ? boardMinY : minY;
    const anchorMaxY = hasBoard ? boardMaxY : maxY;

    const centerX = (anchorMinX + anchorMaxX) / 2;
    const centerY = (anchorMinY + anchorMaxY) / 2;
    const spanX = Math.max(1, anchorMaxX - anchorMinX) * WORLD_SCALE;
    const spanY = Math.max(1, anchorMaxY - anchorMinY) * WORLD_SCALE;

    const stacked: Array<RawObject & { heightScaled: number; baseScaled: number }> = [];
    for (const item of rawObjects) {
      const heightScaled = Math.max(MIN_BOX_HEIGHT, item.height * WORLD_SCALE);
      let baseScaled = 0;

      for (const below of stacked) {
        if (rectsOverlap(item.rect, below.rect)) {
          baseScaled = Math.max(baseScaled, below.baseScaled + below.heightScaled);
        }
      }

      stacked.push({
        ...item,
        heightScaled,
        baseScaled,
      });
    }

    const maxStackHeight = stacked.reduce((max, item) => Math.max(max, item.baseScaled + item.heightScaled), 0);
    const sceneSpan = Math.max(spanX, spanY, maxStackHeight);

    const boxes: SceneBox[] = stacked.map((item) => ({
      id: item.id,
      subtype: item.subtype,
      x: (item.centerX - centerX) * WORLD_SCALE,
      y: GROUND_Y + item.baseScaled + item.heightScaled / 2,
      z: (item.centerY - centerY) * WORLD_SCALE,
      width: Math.max(0.05, item.width * WORLD_SCALE),
      depth: Math.max(0.05, item.depth * WORLD_SCALE),
      height: item.heightScaled,
      rotY: item.rotY,
      color: item.color,
      imageUrl: item.imageUrl,
    }));

    let minBoxY = Infinity;
    let maxBoxY = -Infinity;
    for (const box of boxes) {
      minBoxY = Math.min(minBoxY, box.y - box.height / 2);
      maxBoxY = Math.max(maxBoxY, box.y + box.height / 2);
    }
    const targetY = Number.isFinite(minBoxY) && Number.isFinite(maxBoxY)
      ? (minBoxY + maxBoxY) / 2
      : GROUND_Y + 1;

    return {
      boxes,
      orbitDistance: Math.max(MIN_ORBIT_DISTANCE, sceneSpan * 2 + 3),
      targetY,
    };
  }, [objects]);

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current != null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (showMini3d) {
      clearCloseTimer();
      setIsVisible(true);
      setPhase("opening");
      clearOpenTimer();
      openTimerRef.current = window.setTimeout(() => {
        openTimerRef.current = null;
        setPhase("open");
      }, OPEN_FADE_MS);
      return;
    }

    if (!isVisible) return;
    setIsFullscreen(false);
    setPhase("closing");
    clearOpenTimer();
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setIsVisible(false);
      onCloseComplete?.();
    }, CLOSE_FADE_MS);
  }, [clearCloseTimer, clearOpenTimer, isVisible, onCloseComplete, showMini3d]);

  useEffect(() => {
    return () => {
      clearOpenTimer();
      clearCloseTimer();
    };
  }, [clearCloseTimer, clearOpenTimer]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((v) => !v);
  }, []);

  const handlePointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button === 2) return;
    e.preventDefault();
    e.stopPropagation();

    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startYaw: yawRef.current,
      startPitch: pitchRef.current,
    };

    try {
      containerRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* Pointer capture can fail on some platforms. */
    }
  }, []);

  const handlePointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    e.preventDefault();
    e.stopPropagation();

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    yawRef.current = drag.startYaw - dx * DRAG_SENSITIVITY;
    pitchRef.current = clamp(drag.startPitch + dy * DRAG_SENSITIVITY, MIN_PITCH, MAX_PITCH);
  }, []);

  const handlePointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    dragRef.current = null;
    try {
      containerRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* Pointer may already be released. */
    }
  }, []);

  if (!isVisible) return null;

  const overlayClass = [
    "mini3d-overlay",
    isFullscreen ? "mini3d-overlay--fullscreen" : "",
    phase === "opening" ? "mini3d-overlay--opening" : "",
    phase === "open" ? "mini3d-overlay--open" : "",
    phase === "closing" ? "mini3d-overlay--closing" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const backdropClass = [
    "mini3d-backdrop",
    isFullscreen ? "mini3d-backdrop--fullscreen" : "",
    phase === "opening" ? "mini3d-backdrop--opening" : "",
    phase === "open" ? "mini3d-backdrop--open" : "",
    phase === "closing" ? "mini3d-backdrop--closing" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const styleVars: CssVars = {
    "--mini3d-overlay-opacity": `${OVERLAY_OPACITY}`,
    "--mini3d-open-fade-ms": `${OPEN_FADE_MS}ms`,
    "--mini3d-close-fade-ms": `${CLOSE_FADE_MS}ms`,
  };

  return (
    <>
      <div className={backdropClass} style={styleVars} />
      <div
        ref={containerRef}
        className={overlayClass}
        style={styleVars}
        aria-label="3D overlay"
        title="3D overlay"
        onDoubleClick={toggleFullscreen}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <Canvas
          shadows
          gl={{ antialias: true, alpha: true }}
          frameloop="always"
          dpr={[1, 2]}
          onCreated={({ gl }) => {
            gl.setClearColor("#131a24", 0.1);
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
            gl.shadowMap.enabled = showMini3dShadows;
          }}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <ShadowMapController enabled={showMini3dShadows} />
          <perspectiveCamera makeDefault fov={45} near={0.1} far={FIT_MAX_DISTANCE} position={[4, 4, 4]} />
          <Mini3DRootScene
            yawRef={yawRef}
            pitchRef={pitchRef}
            backgroundImageUrl={canvasBackground.imageUrl}
            showFloor={showMini3dFloor}
            showShadows={showMini3dShadows}
            layout={sceneLayout}
            freezeAutoFit={isBoardBeingDragged}
          />
        </Canvas>

        <div className="mini3d-instruction">Drag to orbit objects. Double click to toggle fullscreen.</div>
      </div>
    </>
  );
}
