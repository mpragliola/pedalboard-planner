import type { CSSProperties, MutableRefObject } from "react";
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
  backgroundTexture: CanvasBackground;
  showFloor: boolean;
  showFloorDetail: boolean;
  showShadows: boolean;
  layout: SceneLayout;
  freezeAutoFit: boolean;
  overlayPhase: OverlayPhase;
  convergenceRunId: number;
}

export type AnimatedSceneBoxProps = {
  box: SceneBox;
  showShadows: boolean;
  boxIndex: number;
  overlayPhase: OverlayPhase;
  convergenceRunId: number;
};
