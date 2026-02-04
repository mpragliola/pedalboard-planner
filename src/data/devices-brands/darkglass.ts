import type { DeviceTemplate } from "../devices";

/** Standard Darkglass pedal size (mm); use where exact dimensions unknown. */
const WDH_PEDAL: [number, number, number] = [120, 95, 57];

function row(model: string, name: string, wdh: [number, number, number], image: string | null): DeviceTemplate {
  return {
    id: `device-darkglass-${model
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")}`,
    type: "pedal",
    brand: "Darkglass",
    model,
    name: name || `Darkglass ${model}`,
    wdh,
    image,
  };
}

export const DARKGLASS_DEVICE_TEMPLATES: DeviceTemplate[] = [
  row(
    "Aggressively Distorting Advanced Machine",
    "Darkglass ADAM",
    WDH_PEDAL,
    "darkglass/darkglass-aggressively-distorting-advanced-machine-product-gal-1.png"
  ),
  row("Alpha-Omega", "Darkglass Alpha-Omega", WDH_PEDAL, "darkglass/darkglass-alpha-omega-gal-1.png"),
  row(
    "Alpha-Omega Photon",
    "Darkglass Alpha-Omega Photon",
    WDH_PEDAL,
    "darkglass/darkglass-alpha-omega-photon-gal-1.png"
  ),
  row("Alpha-Omega Ultra", "Darkglass Alpha-Omega Ultra", WDH_PEDAL, "darkglass/darkglass-alpha-omega-ultra-gal-1.png"),
  row("BK1", "Darkglass BK1", WDH_PEDAL, "darkglass/darkglass-bk1-gal-1.png"),
  row("Duality Fuzz", "Darkglass Duality Fuzz", WDH_PEDAL, "darkglass/darkglass-duality-fuzz-gal-1.png"),
  row("Element", "Darkglass Element", WDH_PEDAL, "darkglass/darkglass-element-gal-1.png"),
  row(
    "Harmonic Booster",
    "Darkglass Harmonic Booster",
    WDH_PEDAL,
    "darkglass/darkglass-harmonic-booster-product-gal-1.png"
  ),
  row("Hyper Luminal", "Darkglass Hyper Luminal", WDH_PEDAL, "darkglass/darkglass-hyper-luminal-product-gal-1.png"),
  row("Kaamos", "Darkglass Kaamos", WDH_PEDAL, "darkglass/darkglass-kaamos-product-gal-1.png"),
  row(
    "Luminal Boost Ultra",
    "Darkglass Luminal Boost Ultra",
    WDH_PEDAL,
    "darkglass/darkglass-luminal-boost-ultra-gal-1.png"
  ),
  row(
    "Microtubes Pedal",
    "Darkglass Microtubes Pedal",
    WDH_PEDAL,
    "darkglass/darkglass-microtubes-b3k-product-gal-1.png"
  ),
  row("Microtubes B3K", "Darkglass Microtubes B3K", WDH_PEDAL, "darkglass/darkglass-microtubes-b3k-product-gal-1.png"),
  row("Microtubes B7K", "Darkglass Microtubes B7K", WDH_PEDAL, "darkglass/darkglass-microtubes-b7k-product-gal-1.png"),
  row(
    "Microtubes BK7 Ultra",
    "Darkglass Microtubes BK7 Ultra",
    WDH_PEDAL,
    "darkglass/darkglass-microtubes-bk7-ultra-gal-1.png"
  ),
  row(
    "Microtubes Infinity",
    "Darkglass Microtubes Infinity",
    WDH_PEDAL,
    "darkglass/darkglass-microtubes-infinity-product-gal-1.png"
  ),
  row(
    "Microtubes X Ultra",
    "Darkglass Microtubes X Ultra",
    WDH_PEDAL,
    "darkglass/darkglass-microtubes-x-ultra-gal-1.png"
  ),
  row("Microtubes X7", "Darkglass Microtubes X7", WDH_PEDAL, "darkglass/darkglass-microtubes-x7-product-gal-1.png"),
  row(
    "NSG",
    "Darkglass NSG",
    WDH_PEDAL,
    "darkglass/darkglass-nsg-product-gal-1_fc08d2d3-4f48-432e-9eac-ddb2a454f405.png"
  ),
  row("Vintage Deluxe", "Darkglass Vintage Deluxe", WDH_PEDAL, "darkglass/darkglass-vintage-deluxe-gal-1.png"),
  row(
    "Vintage Microtubes",
    "Darkglass Vintage Microtubes",
    WDH_PEDAL,
    "darkglass/darkglass-vintage-microtubes-product-gal-1.png"
  ),
  row("Vintage Ultra", "Darkglass Vintage Ultra", WDH_PEDAL, "darkglass/darkglass-vintage-ultra-gal-1.png"),
];
