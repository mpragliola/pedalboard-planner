import { vec2Add, vec2Scale, type Point } from "../../lib/vector";

type ClientPoint = { clientX: number; clientY: number };

function clientPointToPoint(point: ClientPoint): Point {
  return { x: point.clientX, y: point.clientY };
}

export function dist(a: ClientPoint, b: ClientPoint): number {
  return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
}

export function center(a: ClientPoint, b: ClientPoint): Point {
  return vec2Scale(vec2Add(clientPointToPoint(a), clientPointToPoint(b)), 0.5);
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") {
    const input = target as HTMLInputElement | HTMLTextAreaElement;
    return !input.readOnly && !input.disabled;
  }
  return Boolean(target.closest('[contenteditable="true"]'));
}
