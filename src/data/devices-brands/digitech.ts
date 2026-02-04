import type { DeviceTemplate } from "../devices";

/** Whammy / Ricochet size (mm). */
const WDH_WHAMMY: [number, number, number] = [170, 196, 61];
/** RP series multifx (smaller units). */
const WDH_RP_SMALL: [number, number, number] = [235, 180, 65];
/** RP 1000 / large multifx. */
const WDH_RP_LARGE: [number, number, number] = [430, 280, 75];

function pedal(model: string, name: string, wdh: [number, number, number], image: string | null): DeviceTemplate {
  return {
    id: `device-digitech-${model
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")}`,
    type: "pedal",
    brand: "DigiTech",
    model,
    name: name || `DigiTech ${model}`,
    wdh,
    image,
  };
}

function multifx(model: string, name: string, wdh: [number, number, number], image: string | null): DeviceTemplate {
  return {
    id: `device-digitech-${model
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")}`,
    type: "multifx",
    brand: "DigiTech",
    model,
    name: name || `DigiTech ${model}`,
    wdh,
    image,
  };
}

export const DIGITECH_DEVICE_TEMPLATES: DeviceTemplate[] = [
  pedal("Whammy DT", "DigiTech Whammy DT", WDH_WHAMMY, "digitech/digitech-whammy.png"),
  pedal("Whammy Ricochet", "DigiTech Whammy Ricochet", WDH_WHAMMY, "digitech/digitech-whammy-ricochet.png"),
  pedal("The Drop", "DigiTech The Drop Pitch Shifter", WDH_WHAMMY, "digitech/digitech-the-drop-pitch-shifter.png"),
  pedal("The Weapon", "DigiTech The Weapon", WDH_WHAMMY, "digitech/digitech-the-weapon.png"),
  multifx("RP55", "DigiTech RP55", WDH_RP_SMALL, "digitech/digitech-rp55.png"),
  multifx("RP100", "DigiTech RP100", WDH_RP_SMALL, "digitech/digitech-rp100.png"),
  multifx("RP150", "DigiTech RP150", WDH_RP_SMALL, "digitech/digitech-rp150.png"),
  multifx("RP255", "DigiTech RP255", WDH_RP_SMALL, "digitech/digitech-rp255.png"),
  multifx("RP355", "DigiTech RP355", WDH_RP_SMALL, "digitech/digitech-rp355.png"),
  multifx("RP360 XP", "DigiTech RP360 XP", WDH_RP_SMALL, "digitech/digitech-rp360-xp.png"),
  multifx("RP1000", "DigiTech RP1000", WDH_RP_LARGE, "digitech/digitech-rp1000.png"),
];
