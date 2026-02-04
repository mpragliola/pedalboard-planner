import type { Wdh } from "../wdh";
import { AMT_DEVICE_TEMPLATES } from "./devices-brands/amt";
import { ATOMIC_DEVICE_TEMPLATES } from "./devices-brands/atomic";
import { BOSS_DEVICE_TEMPLATES } from "./devices-brands/boss";
import { CHASE_BLISS_DEVICE_TEMPLATES } from "./devices-brands/chase-bliss";
import { CIOKS_DEVICE_TEMPLATES } from "./devices-brands/cioks";
import { DARKGLASS_DEVICE_TEMPLATES } from "./devices-brands/darkglass";
import { DIGITECH_DEVICE_TEMPLATES } from "./devices-brands/digitech";
import { DONNER_DEVICE_TEMPLATES } from "./devices-brands/donner";
import { DUNLOP_DEVICE_TEMPLATES } from "./devices-brands/dunlop";
import { EARTHQUAKER_DEVICE_TEMPLATES } from "./devices-brands/earthquaker";
import { EHX_DEVICE_TEMPLATES } from "./devices-brands/ehx";
import { EVENTIDE_DEVICE_TEMPLATES } from "./devices-brands/eventide";
import { EVH_DEVICE_TEMPLATES } from "./devices-brands/evh";
import { FRACTAL_DEVICE_TEMPLATES } from "./devices-brands/fractal";
import { HARLEY_BENTON_DEVICE_TEMPLATES } from "./devices-brands/harley-benton";
import { HEADRUSH_DEVICE_TEMPLATES } from "./devices-brands/headrush";
import { HOTONE_DEVICE_TEMPLATES } from "./devices-brands/hotone";
import { HUGHES_KETTNER_DEVICE_TEMPLATES } from "./devices-brands/hughes-kettner";
import { IBANEZ_DEVICE_TEMPLATES } from "./devices-brands/ibanez";
import { IK_MULTIMEDIA_DEVICE_TEMPLATES } from "./devices-brands/ik-multimedia";
import { JHS_DEVICE_TEMPLATES } from "./devices-brands/jhs";
import { JOYO_DEVICE_TEMPLATES } from "./devices-brands/joyo";
import { KEELEY_DEVICE_TEMPLATES } from "./devices-brands/keeley";
import { KEMPER_DEVICE_TEMPLATES } from "./devices-brands/kemper";
import { LINE6_DEVICE_TEMPLATES } from "./devices-brands/line6";
import { MIPRO_DEVICE_TEMPLATES } from "./devices-brands/mipro";
import { MISSION_DEVICE_TEMPLATES } from "./devices-brands/mission";
import { MONO_DEVICE_TEMPLATES } from "./devices-brands/mono";
import { MOOER_DEVICE_TEMPLATES } from "./devices-brands/mooer";
import { MORNINGSTAR_DEVICE_TEMPLATES } from "./devices-brands/morningstar";
import { MVAVE_DEVICE_TEMPLATES } from "./devices-brands/mvave";
import { MXR_DEVICE_TEMPLATES } from "./devices-brands/mxr";
import { NEURAL_DEVICE_TEMPLATES } from "./devices-brands/neural";
import { NUX_DEVICE_TEMPLATES } from "./devices-brands/nux";
import { PALMER_DEVICE_TEMPLATES } from "./devices-brands/palmer";
import { SENNHEISER_DEVICE_TEMPLATES } from "./devices-brands/sennheiser";
import { SHURE_DEVICE_TEMPLATES } from "./devices-brands/shure";
import { SONICAKE_DEVICE_TEMPLATES } from "./devices-brands/sonicake";
import { STRYMON_DEVICE_TEMPLATES } from "./devices-brands/strymon";
import { TC_ELECTRONIC_DEVICE_TEMPLATES } from "./devices-brands/tc-electronic";
import { TONE_CITY_DEVICE_TEMPLATES } from "./devices-brands/tone-city";
import { TRUETONE_DEVICE_TEMPLATES } from "./devices-brands/truetone";
import { VALETON_DEVICE_TEMPLATES } from "./devices-brands/valeton";
import { VOODOO_LAB_DEVICE_TEMPLATES } from "./devices-brands/voodoo-lab";
import { WALRUS_DEVICE_TEMPLATES } from "./devices-brands/walrus";
import { WAMPLER_DEVICE_TEMPLATES } from "./devices-brands/wampler";
import { ZOOM_DEVICE_TEMPLATES } from "./devices-brands/zoom";

export type DeviceType = "power" | "controller" | "pedal" | "multifx" | "wireless";

export interface DeviceTemplate {
  id: string;
  type: DeviceType;
  brand: string;
  model: string;
  name: string;
  /** [width, depth, height] in mm. */
  wdh: Wdh;
  /** Omitted when template has an image. */
  color?: string;
  image: string | null;
}

/** Dimensions are in mm. */
export const DEVICE_TEMPLATES: DeviceTemplate[] = [
  ...AMT_DEVICE_TEMPLATES,
  ...ATOMIC_DEVICE_TEMPLATES,
  ...BOSS_DEVICE_TEMPLATES,
  ...CHASE_BLISS_DEVICE_TEMPLATES,
  ...CIOKS_DEVICE_TEMPLATES,
  ...DARKGLASS_DEVICE_TEMPLATES,
  ...DIGITECH_DEVICE_TEMPLATES,
  ...DONNER_DEVICE_TEMPLATES,
  ...DUNLOP_DEVICE_TEMPLATES,
  ...EARTHQUAKER_DEVICE_TEMPLATES,
  ...EHX_DEVICE_TEMPLATES,
  ...EVENTIDE_DEVICE_TEMPLATES,
  ...EVH_DEVICE_TEMPLATES,
  ...FRACTAL_DEVICE_TEMPLATES,
  ...HARLEY_BENTON_DEVICE_TEMPLATES,
  ...HEADRUSH_DEVICE_TEMPLATES,
  ...HOTONE_DEVICE_TEMPLATES,
  ...HUGHES_KETTNER_DEVICE_TEMPLATES,
  ...IBANEZ_DEVICE_TEMPLATES,
  ...IK_MULTIMEDIA_DEVICE_TEMPLATES,
  ...JHS_DEVICE_TEMPLATES,
  ...JOYO_DEVICE_TEMPLATES,
  ...KEELEY_DEVICE_TEMPLATES,
  ...KEMPER_DEVICE_TEMPLATES,
  ...LINE6_DEVICE_TEMPLATES,
  ...MIPRO_DEVICE_TEMPLATES,
  ...MISSION_DEVICE_TEMPLATES,
  ...MONO_DEVICE_TEMPLATES,
  ...MOOER_DEVICE_TEMPLATES,
  ...MORNINGSTAR_DEVICE_TEMPLATES,
  ...MVAVE_DEVICE_TEMPLATES,
  ...MXR_DEVICE_TEMPLATES,
  ...NEURAL_DEVICE_TEMPLATES,
  ...NUX_DEVICE_TEMPLATES,
  ...PALMER_DEVICE_TEMPLATES,
  ...SENNHEISER_DEVICE_TEMPLATES,
  ...SHURE_DEVICE_TEMPLATES,
  ...SONICAKE_DEVICE_TEMPLATES,
  ...STRYMON_DEVICE_TEMPLATES,
  ...TC_ELECTRONIC_DEVICE_TEMPLATES,
  ...TONE_CITY_DEVICE_TEMPLATES,
  ...TRUETONE_DEVICE_TEMPLATES,
  ...VALETON_DEVICE_TEMPLATES,
  ...VOODOO_LAB_DEVICE_TEMPLATES,
  ...WALRUS_DEVICE_TEMPLATES,
  ...WAMPLER_DEVICE_TEMPLATES,
  ...ZOOM_DEVICE_TEMPLATES,
];
