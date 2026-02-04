import type { DeviceTemplate } from "../devices";
import { deviceId } from "../../lib/slug";

const BRAND = "Darkglass";
const BRAND_SLUG = "darkglass";

/** Image path under images/devices/ (e.g. img("darkglass-bk1-gal-1.png") → "darkglass/darkglass-bk1-gal-1.png") */
const img = (filename: string) => `${BRAND_SLUG}/${filename}`;

// Grouped shared WDH dimensions:
const WDH_180_120_60: [number, number, number] = [180, 120, 60]; // Aggressively Distorting Advanced Machine, Alpha-Omega Photon, Microtubes Infinity
const WDH_125_96_57: [number, number, number] = [125, 96, 57]; // Alpha-Omega Ultra, Kaamos, Luminal Boost Ultra, Microtubes BK7 Ultra, Microtubes X Ultra, Vintage Ultra
const WDH_94_120_46: [number, number, number] = [94, 120, 46]; // Alpha-Omega, Microtubes B7K, Microtubes X7, Vintage Deluxe
const WDH_75_111_43: [number, number, number] = [75, 111, 43]; // Harmonic Booster, Hyper Luminal, Microtubes Pedal, Microtubes B3K, Vintage Microtubes
const WDH_50_100_45: [number, number, number] = [50, 100, 45]; // BK1, Duality Fuzz
const WDH_64_111_35: [number, number, number] = [64, 111, 35]; // Element
const WDH_50_100_36_5: [number, number, number] = [50, 100, 36.5]; // NSG

function row(model: string, wdh: [number, number, number], image: string | null): DeviceTemplate {
  return {
    id: deviceId(BRAND_SLUG, model),
    type: "pedal",
    brand: BRAND,
    model,
    name: `${BRAND} ${model}`,
    wdh,
    image,
  };
}

export const DARKGLASS_DEVICE_TEMPLATES: DeviceTemplate[] = [
  row(
    "Aggressively Distorting Advanced Machine",
    WDH_180_120_60,
    img("darkglass-aggressively-distorting-advanced-machine-product-gal-1.png")
  ),
  row("Alpha-Omega", WDH_94_120_46, img("darkglass-alpha-omega-gal-1.png")),
  row("Alpha-Omega Photon", WDH_180_120_60, img("darkglass-alpha-omega-photon-gal-1.png")),
  row("Alpha-Omega Ultra", WDH_125_96_57, img("darkglass-alpha-omega-ultra-gal-1.png")),
  row("BK1", WDH_50_100_45, img("darkglass-bk1-gal-1.png")),
  row("Duality Fuzz", WDH_50_100_45, img("darkglass-duality-fuzz-gal-1.png")),
  row("Element", WDH_64_111_35, img("darkglass-element-gal-1.png")),
  row("Harmonic Booster", WDH_75_111_43, img("darkglass-harmonic-booster-product-gal-1.png")),
  row("Hyper Luminal", WDH_75_111_43, img("darkglass-hyper-luminal-product-gal-1.png")),
  row("Kaamos", WDH_125_96_57, img("darkglass-kaamos-product-gal-1.png")),
  row("Luminal Boost Ultra", WDH_125_96_57, img("darkglass-luminal-boost-ultra-gal-1.png")),
  row("Microtubes Pedal", WDH_75_111_43, img("darkglass-microtubes-b3k-product-gal-1.png")),
  row("Microtubes B3K", WDH_75_111_43, img("darkglass-microtubes-b3k-product-gal-1.png")),
  row("Microtubes B7K", WDH_94_120_46, img("darkglass-microtubes-b7k-product-gal-1.png")),
  row("Microtubes BK7 Ultra", WDH_125_96_57, img("darkglass-microtubes-bk7-ultra-gal-1.png")),
  row("Microtubes Infinity", WDH_180_120_60, img("darkglass-microtubes-infinity-product-gal-1.png")),
  row("Microtubes X Ultra", WDH_125_96_57, img("darkglass-microtubes-x-ultra-gal-1.png")),
  row("Microtubes X7", WDH_94_120_46, img("darkglass-microtubes-x7-product-gal-1.png")),
  row("NSG", WDH_50_100_36_5, img("darkglass-nsg-product-gal-1_fc08d2d3-4f48-432e-9eac-ddb2a454f405.png")),
  row("Vintage Deluxe", WDH_94_120_46, img("darkglass-vintage-deluxe-gal-1.png")),
  row("Vintage Microtubes", WDH_75_111_43, img("darkglass-vintage-microtubes-product-gal-1.png")),
  row("Vintage Ultra", WDH_125_96_57, img("darkglass-vintage-ultra-gal-1.png")),
];
