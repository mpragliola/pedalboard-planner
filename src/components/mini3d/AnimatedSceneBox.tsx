import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { clamp } from "../../lib/math";
import { getShapeGeometry } from "./shapes/shapeGeometry";
import {
  BOARD_METALNESS,
  BOARD_ROUGHNESS,
  BOARD_TOP_IMAGE_METALNESS,
  BOARD_TOP_IMAGE_ROUGHNESS,
  BOX_TRANSITION_EPSILON,
  BOX_TRANSITION_MS,
  CONVERGENCE_ANIMATION_MS,
  CONVERGENCE_OFFSET_DISTANCE,
  DEVICE_METALNESS,
  DEVICE_ROUGHNESS,
  DEVICE_TOP_IMAGE_METALNESS,
  DEVICE_TOP_IMAGE_ROUGHNESS,
  EMPTY_IMAGE_DATA_URI,
  PER_COMPONENT_DELAY_MS,
} from "./mini3dConstants";
import type { AnimatedSceneBoxProps } from "./mini3dTypes";
import { easeOutCubic, shortestAngleDelta } from "./mini3dUtils";

const MOBILE_TEXTURE_MAX_SIZE = 768;

export function AnimatedSceneBox({
  box,
  showShadows,
  disableTopTexture,
  useLowMemoryTextures,
  boxIndex,
  overlayPhase,
  convergenceRunId,
}: AnimatedSceneBoxProps) {
  const { gl, invalidate } = useThree();
  const topTexture = useLoader(
    THREE.TextureLoader,
    disableTopTexture ? EMPTY_IMAGE_DATA_URI : (box.imageUrl ?? EMPTY_IMAGE_DATA_URI)
  );
  const shiftRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const initialPositionRef = useRef<[number, number, number]>([box.x, box.y, box.z]);
  const initialRotationRef = useRef<[number, number, number]>([0, box.rotY, 0]);
  const fromPositionRef = useRef(new THREE.Vector3(box.x, box.y, box.z));
  const targetPositionRef = useRef(new THREE.Vector3(box.x, box.y, box.z));
  const fromRotationYRef = useRef(box.rotY);
  const targetRotationYRef = useRef(box.rotY);
  const transitionStartRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const convergenceFromRef = useRef(new THREE.Vector3());
  const convergenceToRef = useRef(new THREE.Vector3());
  const convergenceStartRef = useRef(0);
  const isConvergenceAnimatingRef = useRef(false);
  const convergenceSourceRef = useRef({ x: box.x, z: box.z });
  const lastAppliedConvergenceRunRef = useRef(0);
  const hasInitializedRef = useRef(false);
  const isDevice = box.subtype === "device";
  const hasTopTexture = Boolean(box.imageUrl) && !disableTopTexture;
  const shape = box.shape;
  const isBox = !shape || shape.type === "box";
  const shapeKey = isBox ? null : JSON.stringify([box.width, box.height, box.depth, shape]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const customGeometry = useMemo(
    () => (isBox || !shape) ? null : getShapeGeometry(box.width, box.height, box.depth, shape),
    [shapeKey],
  );
  const baseRoughness = isDevice ? DEVICE_ROUGHNESS : BOARD_ROUGHNESS;
  const baseMetalness = isDevice ? DEVICE_METALNESS : BOARD_METALNESS;
  const topImageRoughness = isDevice ? DEVICE_TOP_IMAGE_ROUGHNESS : BOARD_TOP_IMAGE_ROUGHNESS;
  const topImageMetalness = isDevice ? DEVICE_TOP_IMAGE_METALNESS : BOARD_TOP_IMAGE_METALNESS;
  const effectiveTopImageRoughness = useLowMemoryTextures
    ? Math.max(0.22, topImageRoughness - 0.14)
    : topImageRoughness;
  const effectiveTopImageMetalness = useLowMemoryTextures
    ? Math.min(0.92, topImageMetalness + 0.12)
    : topImageMetalness;

  useEffect(() => {
    convergenceSourceRef.current = { x: box.x, z: box.z };
  }, [box.x, box.z]);

  useEffect(() => {
    if (!hasTopTexture) return;
    // Keep TextureLoader's expected image orientation explicit for top UV mapping.
    topTexture.flipY = true;
    topTexture.colorSpace = THREE.SRGBColorSpace;
    topTexture.wrapS = THREE.ClampToEdgeWrapping;
    topTexture.wrapT = THREE.ClampToEdgeWrapping;
    if (useLowMemoryTextures) {
      const maxTextureSize = gl.capabilities.maxTextureSize || MOBILE_TEXTURE_MAX_SIZE;
      const targetMaxSize = Math.min(MOBILE_TEXTURE_MAX_SIZE, Math.max(512, maxTextureSize));
      const image = topTexture.image as ({ width?: number; height?: number } & CanvasImageSource) | undefined;
      const sourceWidth = image?.width ?? 0;
      const sourceHeight = image?.height ?? 0;
      if (
        image &&
        sourceWidth > 0 &&
        sourceHeight > 0 &&
        Math.max(sourceWidth, sourceHeight) > targetMaxSize &&
        typeof document !== "undefined"
      ) {
        const scale = targetMaxSize / Math.max(sourceWidth, sourceHeight);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(sourceWidth * scale));
        canvas.height = Math.max(1, Math.round(sourceHeight * scale));
        const context = canvas.getContext("2d");
        if (context) {
          context.imageSmoothingEnabled = true;
          try {
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            topTexture.image = canvas as unknown as HTMLImageElement;
          } catch {
            /* Keep original texture if canvas draw fails. */
          }
        }
      }
      topTexture.generateMipmaps = false;
      topTexture.minFilter = THREE.LinearFilter;
      topTexture.magFilter = THREE.LinearFilter;
      topTexture.anisotropy = 1;
    } else {
      topTexture.generateMipmaps = true;
      topTexture.minFilter = THREE.LinearMipmapLinearFilter;
      topTexture.magFilter = THREE.LinearFilter;
      topTexture.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
    }
    topTexture.needsUpdate = true;
  }, [gl, hasTopTexture, topTexture, useLowMemoryTextures]);

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

    const positionChanged =
      currentPosition.distanceToSquared(targetPositionRef.current) >
      BOX_TRANSITION_EPSILON * BOX_TRANSITION_EPSILON;
    const rotationChanged = Math.abs(targetRotationYRef.current - currentRotationY) > BOX_TRANSITION_EPSILON;

    if (!positionChanged && !rotationChanged) {
      isAnimatingRef.current = false;
      mesh.position.set(box.x, box.y, box.z);
      mesh.rotation.set(0, box.rotY, 0);
      return;
    }

    transitionStartRef.current = performance.now();
    isAnimatingRef.current = true;
    invalidate();
  }, [box.x, box.y, box.z, box.rotY, invalidate]);

  useEffect(() => {
    const shift = shiftRef.current;
    if (!shift) return;

    if (convergenceRunId === 0) {
      lastAppliedConvergenceRunRef.current = 0;
      shift.position.set(0, 0, 0);
      isConvergenceAnimatingRef.current = false;
      return;
    }

    if (convergenceRunId === lastAppliedConvergenceRunRef.current) return;

    const direction =
      overlayPhase === "closing"
        ? "out"
        : (overlayPhase === "opening" || overlayPhase === "open")
          ? "in"
          : null;

    if (!direction) {
      lastAppliedConvergenceRunRef.current = convergenceRunId;
      shift.position.set(0, 0, 0);
      isConvergenceAnimatingRef.current = false;
      return;
    }

    const source = convergenceSourceRef.current;
    const magnitude = Math.hypot(source.x, source.z) || 1;
    const offsetX = (source.x / magnitude) * CONVERGENCE_OFFSET_DISTANCE;
    const offsetZ = (source.z / magnitude) * CONVERGENCE_OFFSET_DISTANCE;

    if (direction === "in") {
      convergenceFromRef.current.set(offsetX, 0, offsetZ);
      convergenceToRef.current.set(0, 0, 0);
    } else {
      convergenceFromRef.current.set(0, 0, 0);
      convergenceToRef.current.set(offsetX, 0, offsetZ);
    }

    shift.position.copy(convergenceFromRef.current);
    convergenceStartRef.current = performance.now() + boxIndex * PER_COMPONENT_DELAY_MS;
    isConvergenceAnimatingRef.current = true;
    lastAppliedConvergenceRunRef.current = convergenceRunId;
    invalidate();
  }, [boxIndex, convergenceRunId, overlayPhase, invalidate]);

  useFrame(() => {
    const now = performance.now();
    let needsNextFrame = false;

    if (isAnimatingRef.current) {
      const mesh = meshRef.current;
      if (!mesh) return;

      const elapsed = now - transitionStartRef.current;
      const t = clamp(elapsed / BOX_TRANSITION_MS, 0, 1);
      const easedT = easeOutCubic(t);

      mesh.position.lerpVectors(fromPositionRef.current, targetPositionRef.current, easedT);
      mesh.rotation.y = THREE.MathUtils.lerp(fromRotationYRef.current, targetRotationYRef.current, easedT);

      if (t >= 1) {
        isAnimatingRef.current = false;
        mesh.position.copy(targetPositionRef.current);
        mesh.rotation.y = targetRotationYRef.current;
      } else {
        needsNextFrame = true;
      }
    }

    if (isConvergenceAnimatingRef.current) {
      const shift = shiftRef.current;
      if (!shift) return;

      const elapsed = now - convergenceStartRef.current;
      if (elapsed <= 0) {
        shift.position.copy(convergenceFromRef.current);
        needsNextFrame = true;
      } else {
        const t = clamp(elapsed / CONVERGENCE_ANIMATION_MS, 0, 1);
        const easedT = easeOutCubic(t);
        shift.position.lerpVectors(convergenceFromRef.current, convergenceToRef.current, easedT);

        if (t >= 1) {
          isConvergenceAnimatingRef.current = false;
          shift.position.copy(convergenceToRef.current);
        } else {
          needsNextFrame = true;
        }
      }
    }

    if (needsNextFrame) invalidate();
  });

  return (
    <group ref={shiftRef} position={[0, 0, 0]}>
      <mesh
        ref={meshRef}
        castShadow={showShadows}
        receiveShadow={showShadows}
        position={initialPositionRef.current}
        rotation={initialRotationRef.current}
      >
        {customGeometry
          ? <primitive object={customGeometry} attach="geometry" />
          : <boxGeometry args={[box.width, box.height, box.depth]} />
        }
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
          color={hasTopTexture ? "#ffffff" : box.color}
          map={hasTopTexture ? topTexture : null}
          // Use cutout alpha without transparent sorting to keep stable depth ordering.
          transparent={false}
          alphaTest={hasTopTexture ? 0.01 : 0}
          depthWrite
          roughness={hasTopTexture ? effectiveTopImageRoughness : baseRoughness}
          metalness={hasTopTexture ? effectiveTopImageMetalness : baseMetalness}
        />
        <meshStandardMaterial
          attach="material-3"
          color={box.color}
          roughness={baseRoughness}
          metalness={baseMetalness}
        />
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
    </group>
  );
}
