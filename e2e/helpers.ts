// Converts canvas-space mm coordinates to client pixels.
// Default params match BASE_STATE (zoom=1.5, pan={x:144, y:178}).
export function cc(
  posX: number,
  posY: number,
  zoom = 1.5,
  panX = 144,
  panY = 178,
): { x: number; y: number } {
  return { x: posX * zoom + panX, y: posY * zoom + panY };
}

const BASE_OBJECTS = [
  {
    id: "obj-board-1",
    subtype: "board",
    templateId: "board-pedaltrain-metro-24",
    type: "classic",
    brand: "Pedaltrain",
    model: "Metro 24",
    name: "Pedaltrain Metro 24",
    pos: { x: 80, y: 80 },
    rotation: 0,
  },
  {
    id: "obj-device-1",
    subtype: "device",
    templateId: "device-boss-ds-1",
    type: "pedal",
    brand: "Boss",
    model: "DS-1",
    name: "Boss DS-1",
    pos: { x: 100, y: 100 },
    rotation: 0,
  },
  {
    id: "obj-device-2",
    subtype: "device",
    templateId: "device-boss-sd-1",
    type: "pedal",
    brand: "Boss",
    model: "SD-1",
    name: "Boss SD-1",
    pos: { x: 200, y: 100 },
    rotation: 0,
  },
  {
    id: "obj-device-3",
    subtype: "device",
    templateId: "device-boss-mt-2",
    type: "pedal",
    brand: "Boss",
    model: "MT-2",
    name: "Boss MT-2",
    pos: { x: 320, y: 100 },
    rotation: 0,
  },
];

const BASE_CABLES = [
  {
    id: "cable-1",
    color: "#ff6600",
    connectorA: "straight",
    connectorB: "straight",
    connectorAName: "Output",
    connectorBName: "Input",
    points: [[163, 140], [200, 140]],
  },
  {
    id: "cable-2",
    color: "#3399ff",
    connectorA: "straight",
    connectorB: "straight",
    connectorAName: "Output",
    connectorBName: "Input",
    points: [[263, 140], [320, 140]],
  },
];

export const BASE_STATE = JSON.stringify({
  objects: BASE_OBJECTS,
  cables: BASE_CABLES,
  showGrid: false,
  zoom: 1.5,
  pan: { x: 144, y: 178 },
  unit: "mm",
});

export const EMPTY_STATE = JSON.stringify({
  objects: [],
  cables: [],
  showGrid: false,
  zoom: 1,
  pan: { x: 0, y: 0 },
  unit: "mm",
});
