import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { clamp } from "../../lib/math";
import { AnimatedSceneBox } from "./AnimatedSceneBox";
import {
  DISTANCE_LERP,
  EMPTY_IMAGE_DATA_URI,
  FIT_MAX_DISTANCE,
  FIT_PADDING_PX,
  GROUND_PLANE_SIZE,
  GROUND_TILE_WORLD_SIZE,
  GROUND_Y,
  MAX_DISTANCE_STEP,
  MAX_PITCH,
  MIN_PITCH,
} from "./mini3dConstants";
import type { Mini3DRootSceneProps } from "./mini3dTypes";
import { computeBoxCorners, setOrbitPosition } from "./mini3dUtils";

export function ShadowMapController({ enabled }: { enabled: boolean }) {
  const { gl } = useThree();

  useEffect(() => {
    gl.shadowMap.enabled = enabled;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.shadowMap.needsUpdate = true;
  }, [enabled, gl]);

  return null;
}

export function Mini3DRootScene({
  yawRef,
  pitchRef,
  distanceScaleRef,
  backgroundTexture,
  useLowMemoryTextures,
  showFloor,
  showFloorDetail,
  showFloorSpecular,
  showShadows,
  disableObjectTextures,
  shadowMapSize,
  layout,
  freezeAutoFit,
  overlayPhase,
  convergenceRunId,
  maxObjects,
}: Mini3DRootSceneProps) {
  const { camera, size, gl, invalidate } = useThree();
  const proFloorTexture = backgroundTexture.mini3d?.type === "pro" ? backgroundTexture.mini3d : null;
  // In low-memory mode we keep simple floor shading but skip heavy auxiliary floor maps.
  const shouldLoadProFloorRoughnessMap = showFloorSpecular && Boolean(proFloorTexture) && !useLowMemoryTextures;
  const shouldLoadProFloorBumpMap = showFloorDetail && Boolean(proFloorTexture) && !useLowMemoryTextures;
  const [floorColorTexture, floorRoughnessTexture, floorHeightTexture] = useLoader(
    THREE.TextureLoader,
    [
      useLowMemoryTextures ? backgroundTexture.previewImageUrl : backgroundTexture.imageUrl,
      shouldLoadProFloorRoughnessMap ? (proFloorTexture?.roughnessMapUrl ?? EMPTY_IMAGE_DATA_URI) : EMPTY_IMAGE_DATA_URI,
      shouldLoadProFloorBumpMap ? (proFloorTexture?.displacementMapUrl ?? EMPTY_IMAGE_DATA_URI) : EMPTY_IMAGE_DATA_URI,
    ]
  );
  const fitCameraRef = useRef(new THREE.PerspectiveCamera(45, 1, 0.1, FIT_MAX_DISTANCE));
  const distanceRef = useRef(layout.orbitDistance * distanceScaleRef.current);
  const lastDistanceScaleRef = useRef(distanceScaleRef.current);
  const orbitPosRef = useRef(new THREE.Vector3());
  const cameraSpaceRef = useRef(new THREE.Vector3());
  const ndcRef = useRef(new THREE.Vector3());
  const includeConvergenceExtremes = useMemo(
    () =>
      overlayPhase === "opening" || overlayPhase === "closing",
    [overlayPhase]
  );
  const corners = useMemo(
    () => computeBoxCorners(layout.boxes, includeConvergenceExtremes),
    [includeConvergenceExtremes, layout.boxes]
  );
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

  useLayoutEffect(() => {
    const repeat = Math.max(2, GROUND_PLANE_SIZE / GROUND_TILE_WORLD_SIZE);
    const anisotropy = useLowMemoryTextures ? 1 : Math.min(8, gl.capabilities.getMaxAnisotropy());

    floorColorTexture.colorSpace = THREE.SRGBColorSpace;
    floorColorTexture.wrapS = THREE.RepeatWrapping;
    floorColorTexture.wrapT = THREE.RepeatWrapping;
    floorColorTexture.repeat.set(repeat, repeat);
    floorColorTexture.generateMipmaps = !useLowMemoryTextures;
    floorColorTexture.minFilter = useLowMemoryTextures ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
    floorColorTexture.magFilter = THREE.LinearFilter;
    floorColorTexture.anisotropy = anisotropy;
    floorColorTexture.needsUpdate = true;

    if (shouldLoadProFloorRoughnessMap) {
      floorRoughnessTexture.wrapS = THREE.RepeatWrapping;
      floorRoughnessTexture.wrapT = THREE.RepeatWrapping;
      floorRoughnessTexture.repeat.set(repeat, repeat);
      floorRoughnessTexture.generateMipmaps = !useLowMemoryTextures;
      floorRoughnessTexture.minFilter = useLowMemoryTextures ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
      floorRoughnessTexture.magFilter = THREE.LinearFilter;
      floorRoughnessTexture.anisotropy = anisotropy;
      floorRoughnessTexture.needsUpdate = true;
    }

    if (shouldLoadProFloorBumpMap) {
      // Use displacement source as a 2D bump height map with UVs locked to the color map.
      floorHeightTexture.wrapS = THREE.RepeatWrapping;
      floorHeightTexture.wrapT = THREE.RepeatWrapping;
      floorHeightTexture.repeat.set(repeat, repeat);
      floorHeightTexture.generateMipmaps = !useLowMemoryTextures;
      floorHeightTexture.minFilter = useLowMemoryTextures ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
      floorHeightTexture.magFilter = THREE.LinearFilter;
      floorHeightTexture.anisotropy = anisotropy;
      floorHeightTexture.needsUpdate = true;
    }
  }, [
    floorColorTexture,
    floorHeightTexture,
    floorRoughnessTexture,
    gl,
    shouldLoadProFloorBumpMap,
    shouldLoadProFloorRoughnessMap,
    useLowMemoryTextures,
  ]);

  // Kick-start rendering in demand mode when visual props change.
  useEffect(() => {
    invalidate();
  }, [layout, overlayPhase, convergenceRunId, showFloor, showFloorDetail, showFloorSpecular, showShadows, invalidate]);

  useEffect(() => {
    if (freezeAutoFit) return;
    const scale = distanceScaleRef.current;
    distanceRef.current = clamp(layout.orbitDistance * scale, 0.2, FIT_MAX_DISTANCE);
    lastDistanceScaleRef.current = scale;
  }, [distanceScaleRef, freezeAutoFit, layout.orbitDistance]);

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

    const currentScale = distanceScaleRef.current;
    let targetDistance = distanceRef.current;
    if (!freezeAutoFit) {
      targetDistance = clamp(findBestDistance() * currentScale, 0.2, FIT_MAX_DISTANCE);
      lastDistanceScaleRef.current = currentScale;
    } else if (Math.abs(currentScale - lastDistanceScaleRef.current) > 1e-6) {
      const scaleRatio = currentScale / Math.max(0.0001, lastDistanceScaleRef.current);
      targetDistance = clamp(distanceRef.current * scaleRatio, 0.2, FIT_MAX_DISTANCE);
      lastDistanceScaleRef.current = currentScale;
    }

    const eased = THREE.MathUtils.lerp(distanceRef.current, targetDistance, DISTANCE_LERP);
    const delta = clamp(eased - distanceRef.current, -MAX_DISTANCE_STEP, MAX_DISTANCE_STEP);
    distanceRef.current += delta;

    // Snap when close enough so demand-mode rendering can stop.
    if (Math.abs(distanceRef.current - targetDistance) < 0.0005) {
      distanceRef.current = targetDistance;
    } else {
      invalidate();
    }

    camera.position.copy(setOrbitPosition(orbitPosRef.current, yaw, pitch, distanceRef.current, layout.targetY));
    camera.lookAt(0, layout.targetY, 0);
  });

  const floorBumpScale = shouldLoadProFloorBumpMap && proFloorTexture
    ? proFloorTexture.bumpScale ?? Math.max(0.01, proFloorTexture.displacementScale ?? 0.015)
    : 0;
  const floorRoughness = proFloorTexture?.roughness ?? 0.62;
  const floorMetalness = proFloorTexture?.metalness ?? 0.08;
  const useFloorPbrMaterial = showFloorDetail || showFloorSpecular;
  const effectiveFloorRoughness = showFloorSpecular ? floorRoughness : 1;
  const effectiveFloorMetalness = showFloorSpecular ? floorMetalness : 0;

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight
        intensity={1.45}
        position={[3.5, 11, 2.5]}
        castShadow={showShadows}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-shadowFrustumHalfSize}
        shadow-camera-right={shadowFrustumHalfSize}
        shadow-camera-top={shadowFrustumHalfSize}
        shadow-camera-bottom={-shadowFrustumHalfSize}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      >
        <object3D attach="target" position={[0, layout.targetY, 0]} />
      </directionalLight>
      <directionalLight intensity={0.42} position={[-6, 5.5, -4.5]}>
        <object3D attach="target" position={[0, layout.targetY, 0]} />
      </directionalLight>
      <directionalLight intensity={0.28} position={[6.5, 4.5, -6.5]}>
        <object3D attach="target" position={[0, layout.targetY, 0]} />
      </directionalLight>

      {showFloor ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GROUND_Y, 0]} receiveShadow={showShadows}>
          <planeGeometry args={[GROUND_PLANE_SIZE, GROUND_PLANE_SIZE, 1, 1]} />
          {useFloorPbrMaterial ? (
            <meshStandardMaterial
              map={floorColorTexture}
              roughnessMap={shouldLoadProFloorRoughnessMap ? floorRoughnessTexture : null}
              bumpMap={shouldLoadProFloorBumpMap ? floorHeightTexture : null}
              bumpScale={floorBumpScale}
              roughness={effectiveFloorRoughness}
              metalness={effectiveFloorMetalness}
            />
          ) : (
            <meshLambertMaterial map={floorColorTexture} />
          )}
        </mesh>
      ) : null}

      {(maxObjects > 0 ? layout.boxes.slice(0, maxObjects) : layout.boxes).map((box, boxIndex) => (
          <AnimatedSceneBox
            key={box.id}
            box={box}
            boxIndex={boxIndex}
            showShadows={showShadows}
            disableTopTexture={disableObjectTextures}
            useLowMemoryTextures={useLowMemoryTextures}
            overlayPhase={overlayPhase}
            convergenceRunId={convergenceRunId}
          />
      ))}
    </>
  );
}
