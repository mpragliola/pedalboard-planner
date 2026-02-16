import type { CSSProperties, MutableRefObject } from "react";
import type { Shape3D } from "../../shape3d";
import type { CanvasBackground } from "../../constants/backgrounds";

export type SceneBox = {
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
  shape?: Shape3D;
};

export type SceneLayout = {
  boxes: SceneBox[];
  orbitDistance: number;
  targetY: number;
};

export type OverlayPhase = "opening" | "open" | "closing";

export type Mini3DOverlayProps = {
  onCloseComplete?: () => void;
};

export type CssVars = CSSProperties & Record<`--${string}`, string>;

export type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  startYaw: number;
  startPitch: number;
};

export interface Mini3DRootSceneProps {
  yawRef: MutableRefObject<number>;
  pitchRef: MutableRefObject<number>;
  distanceScaleRef: MutableRefObject<number>;
  backgroundTexture: CanvasBackground;
  useLowMemoryTextures: boolean;
  showFloor: boolean;
  showFloorDetail: boolean;
  showFloorSpecular: boolean;
  showShadows: boolean;
  disableObjectTextures: boolean;
  shadowMapSize: number;
  layout: SceneLayout;
  freezeAutoFit: boolean;
  overlayPhase: OverlayPhase;
  convergenceRunId: number;
  /** Maximum number of objects to render. 0 = unlimited. */
  maxObjects: number;
}

export type AnimatedSceneBoxProps = {
  box: SceneBox;
  showShadows: boolean;
  disableTopTexture: boolean;
  useLowMemoryTextures: boolean;
  boxIndex: number;
  overlayPhase: OverlayPhase;
  convergenceRunId: number;
};
