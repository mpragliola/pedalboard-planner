import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { pedal, img } = createBrandHelpers("darkglass", "Darkglass");

// Grouped shared WDH dimensions:
const WDH_180_120_60: [number, number, number] = [180, 120, 60];
const WDH_125_96_57: [number, number, number] = [125, 96, 57];
const WDH_94_120_46: [number, number, number] = [94, 120, 46];
const WDH_75_111_43: [number, number, number] = [75, 111, 43];
const WDH_50_100_45: [number, number, number] = [50, 100, 45];
const WDH_64_111_35: [number, number, number] = [64, 111, 35];
const WDH_50_100_36_5: [number, number, number] = [50, 100, 36.5];

export const DARKGLASS_DEVICE_TEMPLATES: DeviceTemplate[] = [
  pedal("Anagram", WDH_75_111_43, img("darkglass-anagram.png")),
  pedal(
    "Aggressively Distorting Advanced Machine",
    WDH_180_120_60,
    img("darkglass-aggressively-distorting-advanced-machine-product-gal-1.png")
  ),
  pedal("Alpha-Omega", WDH_94_120_46, img("darkglass-alpha-omega-gal-1.png")),
  pedal("Alpha-Omega Photon", WDH_180_120_60, img("darkglass-alpha-omega-photon-gal-1.png")),
  pedal("Alpha-Omega Ultra", WDH_125_96_57, img("darkglass-alpha-omega-ultra-gal-1.png")),
  pedal("BK1", WDH_50_100_45, img("darkglass-bk1-gal-1.png")),
  pedal("Duality Fuzz", WDH_50_100_45, img("darkglass-duality-fuzz-gal-1.png")),
  pedal("Element", WDH_64_111_35, img("darkglass-element-gal-1.png")),
  pedal("Harmonic Booster", WDH_75_111_43, img("darkglass-harmonic-booster-product-gal-1.png")),
  pedal("Hyper Luminal", WDH_75_111_43, img("darkglass-hyper-luminal-product-gal-1.png")),
  pedal("Kaamos", WDH_125_96_57, img("darkglass-kaamos-product-gal-1.png")),
  pedal("Luminal Boost Ultra", WDH_125_96_57, img("darkglass-luminal-boost-ultra-gal-1.png")),
  pedal("Microtubes Pedal", WDH_75_111_43, img("darkglass-microtubes-b3k-product-gal-1.png")),
  pedal("Microtubes B3K", WDH_75_111_43, img("darkglass-microtubes-b3k-product-gal-1.png")),
  pedal("Microtubes B7K", WDH_94_120_46, img("darkglass-microtubes-b7k-product-gal-1.png")),
  pedal("Microtubes BK7 Ultra", WDH_125_96_57, img("darkglass-microtubes-bk7-ultra-gal-1.png")),
  pedal("Microtubes Infinity", WDH_180_120_60, img("darkglass-microtubes-infinity-product-gal-1.png")),
  pedal("Microtubes X Ultra", WDH_125_96_57, img("darkglass-microtubes-x-ultra-gal-1.png")),
  pedal("Microtubes X7", WDH_94_120_46, img("darkglass-microtubes-x7-product-gal-1.png")),
  pedal("NSG", WDH_50_100_36_5, img("darkglass-nsg-product-gal-1_fc08d2d3-4f48-432e-9eac-ddb2a454f405.png")),
  pedal("Vintage Deluxe", WDH_94_120_46, img("darkglass-vintage-deluxe-gal-1.png")),
  pedal("Vintage Microtubes", WDH_75_111_43, img("darkglass-vintage-microtubes-product-gal-1.png")),
  pedal("Vintage Ultra", WDH_125_96_57, img("darkglass-vintage-ultra-gal-1.png")),
];
