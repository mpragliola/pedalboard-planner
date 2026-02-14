import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";
import { clamp } from "../../lib/math";
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

export function AnimatedSceneBox({
  box,
  showShadows,
  boxIndex,
  overlayPhase,
  convergenceRunId,
}: AnimatedSceneBoxProps) {
  const topTexture = useLoader(THREE.TextureLoader, box.imageUrl ?? EMPTY_IMAGE_DATA_URI);
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
  const baseRoughness = isDevice ? DEVICE_ROUGHNESS : BOARD_ROUGHNESS;
  const baseMetalness = isDevice ? DEVICE_METALNESS : BOARD_METALNESS;
  const topImageRoughness = isDevice ? DEVICE_TOP_IMAGE_ROUGHNESS : BOARD_TOP_IMAGE_ROUGHNESS;
  const topImageMetalness = isDevice ? DEVICE_TOP_IMAGE_METALNESS : BOARD_TOP_IMAGE_METALNESS;

  useEffect(() => {
    convergenceSourceRef.current = { x: box.x, z: box.z };
  }, [box.x, box.z]);

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

    if (!positionChanged && rotationChanged) {
      // Rotation-only updates should snap to avoid replaying box movement animation.
      isAnimatingRef.current = false;
      fromPositionRef.current.set(box.x, box.y, box.z);
      targetPositionRef.current.set(box.x, box.y, box.z);
      fromRotationYRef.current = box.rotY;
      targetRotationYRef.current = box.rotY;
      mesh.position.set(box.x, box.y, box.z);
      mesh.rotation.set(0, box.rotY, 0);
      return;
    }

    transitionStartRef.current = performance.now();
    isAnimatingRef.current = true;
  }, [box.x, box.y, box.z, box.rotY]);

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
  }, [boxIndex, convergenceRunId, overlayPhase]);

  useFrame(() => {
    const now = performance.now();

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
      }
    }

    if (isConvergenceAnimatingRef.current) {
      const shift = shiftRef.current;
      if (!shift) return;

      const elapsed = now - convergenceStartRef.current;
      if (elapsed <= 0) {
        shift.position.copy(convergenceFromRef.current);
        return;
      }

      const t = clamp(elapsed / CONVERGENCE_ANIMATION_MS, 0, 1);
      const easedT = easeOutCubic(t);
      shift.position.lerpVectors(convergenceFromRef.current, convergenceToRef.current, easedT);

      if (t >= 1) {
        isConvergenceAnimatingRef.current = false;
        shift.position.copy(convergenceToRef.current);
      }
    }
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
