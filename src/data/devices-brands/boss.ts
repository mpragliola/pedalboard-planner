import type { DeviceTemplate } from "../devices";
import { deviceTemplate, deviceImage } from "../deviceHelpers";
import { Wdh } from "../../wdh";

type BossDeviceRow = Omit<DeviceTemplate, "id" | "brand"> & {
  image: string | null;
};
type BossRowBase = Omit<BossDeviceRow, "type">;

// Standardized pedal formats
export const WDH_COMPACT: Wdh = [73, 129, 59]; // verified
export const WDH_200: Wdh = [101, 138, 63]; // verified
export const WDH_500: Wdh = [170, 138, 62]; // verified

// Multi-FX and floor processors
export const WDH_GT1000: Wdh = [462, 248, 70]; // verified
export const WDH_GX100: Wdh = [460, 193, 73];
export const WDH_ME90: Wdh = [443, 220, 67];
export const WDH_ME80: Wdh = [447, 231, 70];
export const WDH_GT100: Wdh = [542, 271, 80];
export const WDH_GT10: Wdh = [542, 272, 77];
export const WDH_GT1: Wdh = [305, 152, 56]; // verified
export const WDH_SY1000: Wdh = [345, 245, 67];

// Legacy/older devices not covered above
export const WDH_GT6: Wdh = [515, 261, 75]; // verified

// Loop stations
export const WDH_RC600: Wdh = [435, 163, 66];
export const WDH_RC505: Wdh = [420, 234, 67];
export const WDH_RC300: Wdh = [536, 231, 76];
export const WDH_RC50: Wdh = [480, 231, 84];
export const WDH_RC30: Wdh = [173, 158, 57];
export const WDH_RC202: Wdh = [239, 175, 55];

// Controllers and specialized units
export const WDH_ES8: Wdh = [439, 149, 65];
export const WDH_ES5: Wdh = [337, 97, 68];
export const WDH_POCKET_GT: Wdh = [71, 129, 27.6];
export const WDH_GM800: Wdh = [246, 134, 63];
export const WDH_GT1000_CORE: Wdh = [173, 135, 63];
export const WDH_VE22: Wdh = [218, 143, 64];
export const WDH_XS100: Wdh = [192, 248, 73];

// ——— Pedals ———
const bossPedals: BossRowBase[] = [
  { model: "DS-1", name: "DS-1", wdh: WDH_COMPACT, image: "boss-ds1.png" },
  { model: "DS-1W", name: "DS-1W", wdh: WDH_COMPACT, image: "boss-ds1w.png" },
  { model: "DS-1X", name: "DS-1X", wdh: WDH_COMPACT, image: "boss-ds-1x_top_vtn.png" },
  { model: "DS-2", name: "DS-2", wdh: WDH_COMPACT, image: "boss-ds2_tn_thumb.png" },
  { model: "MT-2", name: "MT-2", wdh: WDH_COMPACT, image: "boss-mt-2_top_tn.png" },
  { model: "MT-2W", name: "MT-2W", wdh: WDH_COMPACT, image: "boss-mt-2w_tn.png" },
  { model: "SD-1", name: "SD-1", wdh: WDH_COMPACT, image: "boss-sd1.png" },
  { model: "Twin Pedal (FS-6 size)", name: "Twin Pedal (FS-6 size)", wdh: [188, 91, 60], image: null },
];

// ——— Multifx ———
const bossMultifx: BossRowBase[] = [
  { model: "GT-1000", name: "GT-1000", wdh: WDH_GT1000, image: "boss-gt-1000.png" },
  { model: "GT-1000 Core", name: "GT-1000 Core", wdh: WDH_GT1000_CORE, image: "boss-gt-1000core.png" },
  { model: "GX-100", name: "GX-100", wdh: WDH_GX100, image: "boss-gx-100.png" },
  { model: "ME-90", name: "ME-90", wdh: WDH_ME90, image: "boss-me-90.png" },
  { model: "GM-800", name: "GM-800", wdh: WDH_GM800, image: "boss-gm-800.png" },
  { model: "GP-10", name: "GP-10", wdh: WDH_GT1, image: null },
  { model: "GT-1", name: "GT-1", wdh: WDH_GT1, image: "boss-gt-1.png" },
  { model: "GT-1B", name: "GT-1B", wdh: WDH_GT1, image: "boss-gt-1b.png" },
  { model: "GT-001", name: "GT-001", wdh: [200, 150, 50], image: "boss-gt-001.png" },
  { model: "GT-100", name: "GT-100", wdh: WDH_GT100, image: "boss-gt-100.png" },
  { model: "GT-10", name: "GT-10", wdh: WDH_GT10, image: "boss-gt-10.png" },
  { model: "GT-10B", name: "GT-10B", wdh: WDH_GT10, image: "boss-gt-10b.png" },
  { model: "GT-3", name: "GT-3", wdh: [487, 222, 97], image: "boss-gt-3.png" },
  { model: "GT-5", name: "GT-5", wdh: [520, 221, 113.5], image: "boss-gt-5.png" },
  { model: "GT-6", name: "GT-6", wdh: WDH_GT6, image: "boss-gt-6.png" },
  { model: "GT-6B", name: "GT-6B", wdh: WDH_GT6, image: "boss-gt-6b.png" },
  { model: "GT-8", name: "GT-8", wdh: WDH_GT6, image: "boss-gt-8.png" },
  { model: "GX-1", name: "GX-1", wdh: [307, 149, 56], image: "boss-gx-1.png" },
  { model: "GX-1B", name: "GX-1B", wdh: [307, 149, 56], image: "boss-gx-1b.png" },
  { model: "GX-10", name: "GX-10", wdh: [300, 183, 74], image: "boss-gx-10.png" },
  { model: "ME-25", name: "ME-25", wdh: [350, 200, 60], image: "boss-me-25.png" },
  { model: "ME-80", name: "ME-80", wdh: WDH_ME80, image: "boss-me-80.png" },
  { model: "ME-20", name: "ME-20", wdh: [294, 179, 54], image: "boss-me-20.png" },
  { model: "ME-20B", name: "ME-20B", wdh: [294, 179, 54], image: "boss-me-20b.png" },
  { model: "ME-33", name: "ME-33", wdh: [398, 215, 56], image: "boss-me-33.png" },
  { model: "ME-50", name: "ME-50", wdh: [384, 225, 78], image: "boss-me-50.png" },
  { model: "ME-50B", name: "ME-50B", wdh: [384, 225, 78], image: "boss-me-50b.png" },
  { model: "ME-70", name: "ME-70", wdh: [384, 229, 74], image: "boss-me-70.png" },
  { model: "Pocket GT", name: "Pocket GT", wdh: WDH_POCKET_GT, image: "pocket_gt.png" },
  // Boss RC series (loopers)
  { model: "RC-10R", name: "RC-10R", wdh: WDH_200, image: "boss-rc-10r.png" },
  { model: "RC-202", name: "RC-202", wdh: WDH_RC202, image: null },
];

// ——— Pedals (continued: loopers, SY, compact, etc.) ———
const bossPedalsContinued: BossRowBase[] = [
  { model: "RC-1", name: "RC-1 Loop Station", wdh: WDH_COMPACT, image: "boss-rc-1.png" },
  { model: "RC-2", name: "RC-2 Loop Station", wdh: WDH_COMPACT, image: "boss-rc-2.png" },
];

// ——— Multifx (continued: RC, SY, VE) ———
const bossMultifxContinued: BossRowBase[] = [
  { model: "RC-3", name: "RC-3", wdh: WDH_COMPACT, image: "boss-rc-3.png" },
  { model: "RC-30", name: "RC-30", wdh: WDH_RC30, image: "boss-rc-30.png" },
  { model: "RC-300", name: "RC-300", wdh: WDH_RC300, image: "boss-rc-300.png" },
  { model: "RC-5", name: "RC-5", wdh: WDH_COMPACT, image: "boss-rc-5.png" },
];

const bossPedalsRc20xl: BossRowBase[] = [
  { model: "RC-20XL", name: "RC-20XL Loop Station", wdh: WDH_RC30, image: "boss-rc-20xl.png" },
];

const bossMultifxRcRest: BossRowBase[] = [
  { model: "RC-50", name: "RC-50 Loop Station", wdh: WDH_RC50, image: "boss-rc-50.png" },
  { model: "RC-500", name: "RC-500", wdh: WDH_200, image: "boss-rc-500.png" },
  { model: "RC-505", name: "RC-505", wdh: WDH_RC505, image: null },
  { model: "RC-505 MkII", name: "RC-505 MkII", wdh: WDH_RC505, image: null },
  { model: "RC-600", name: "RC-600", wdh: WDH_RC600, image: "boss-rc-600.png" },
];

// ——— Pedals (SL, XS) ———
const bossPedalsSlXs: BossRowBase[] = [
  { model: "SL-2", name: "SL-2 Slicer", wdh: WDH_COMPACT, image: "boss-sl-2_tn.png" },
  { model: "XS-100 Poly Shifter", name: "XS-100 Poly Shifter", wdh: WDH_XS100, image: "boss-xs-100_tn.png" },
];

// ——— Multifx (SY, VE) ———
const bossMultifxSyVe: BossRowBase[] = [
  { model: "SY-1000", name: "SY-1000", wdh: WDH_SY1000, image: "boss-sy-1000.png" },
  { model: "VE-22", name: "VE-22 Vocal Performer", wdh: WDH_VE22, image: "boss-ve-22.png" },
  { model: "VE-500", name: "VE-500 Vocal Performer", wdh: WDH_500, image: "boss-ve-500.png" },
  { model: "SY-300", name: "SY-300", wdh: [420, 240, 70], image: "boss-sy_300_top_tn.png" },
];

// ——— Pedals (SY-1, SY-200, then chorus/delay/etc.) ———
const bossPedalsRest: BossRowBase[] = [
  { model: "SY-1", name: "SY-1", wdh: WDH_COMPACT, image: "boss-sy-1_tn.png" },
  { model: "SY-200", name: "SY-200", wdh: WDH_200, image: "boss-sy-200_tn.png" },
  // Boss pedals (chorus, flanger, drive, etc.)
  { model: "BF-3", name: "BF-3 Flanger", wdh: WDH_COMPACT, image: "boss-bf_3_top_tn_thumb.png" },
  { model: "CE-5", name: "CE-5 Chorus Ensemble", wdh: WDH_COMPACT, image: "boss-ce_5_top_tn_thumb.png" },
  { model: "CH-1", name: "CH-1 Super Chorus", wdh: WDH_COMPACT, image: "boss-ch_1_tn_thumb.png" },
  { model: "CS-3", name: "CS-3 Compression Sustainer", wdh: WDH_COMPACT, image: "boss-cs_3_top_tn_thumb.png" },
  { model: "CP-1X", name: "CP-1X Compressor", wdh: WDH_COMPACT, image: "boss-cp-1x_tn.png" },
  { model: "DC-2W", name: "DC-2W Dimension C", wdh: WDH_COMPACT, image: "boss-dc-2w_tn.png" },
  { model: "GE-7", name: "GE-7 Equalizer", wdh: WDH_COMPACT, image: "boss-ge_7_tn_thumb.png" },
  { model: "GEB-7", name: "GEB-7 Bass Equalizer", wdh: WDH_COMPACT, image: "boss-geb_7_tn_thumb.png" },
  { model: "HM-2W", name: "HM-2W", wdh: WDH_COMPACT, image: "boss-hm-2w_top_tn.png" },
  { model: "JB-2", name: "JB-2 Angry Driver", wdh: WDH_COMPACT, image: "boss-jb-2_tn.png" },
  { model: "LS-2", name: "LS-2 Line Selector", wdh: WDH_COMPACT, image: "boss-ls2_tn_thumb.png" },
  { model: "MD-2", name: "MD-2 Mega Distortion", wdh: WDH_COMPACT, image: "boss-md_2_tn_thumb.png" },
  { model: "ML-2", name: "ML-2 Metal Core", wdh: WDH_COMPACT, image: "boss-ml_2_top_tn_thumb.png" },
  { model: "NS-2", name: "NS-2 Noise Suppressor", wdh: WDH_COMPACT, image: "boss-ns2_tn_thumb.png" },
  { model: "NS-1X", name: "NS-1X", wdh: WDH_COMPACT, image: "boss-ns-1x_tn.png" },
  { model: "OC-5", name: "OC-5 Super Octave", wdh: WDH_COMPACT, image: "boss-oc-5_tn.png" },
  { model: "PH-3", name: "PH-3 Phase Shifter", wdh: WDH_COMPACT, image: "boss-ph3_2_tn_thumb.png" },
  { model: "PS-6", name: "PS-6 Harmonist", wdh: WDH_COMPACT, image: "boss-ps-6_top_tn.png" },
  { model: "TR-2", name: "TR-2 Tremolo", wdh: WDH_COMPACT, image: "boss-tr2_tn_thumb.png" },
  { model: "TU-3", name: "TU-3 Chromatic Tuner", wdh: WDH_COMPACT, image: "boss-tu-3_top_tn.png" },
  { model: "TU-3S", name: "TU-3S", wdh: WDH_COMPACT, image: "boss-tu-3s_top_tn.png" },
  { model: "TU-3W", name: "TU-3W", wdh: WDH_COMPACT, image: "boss-tu-3w_top_tn.png" },
  { model: "VB-2W", name: "VB-2W Vibrato", wdh: WDH_COMPACT, image: "boss-vb-2w_top_tn.png" },
  { model: "VO-1", name: "VO-1 Vocoder", wdh: WDH_COMPACT, image: "boss-vo-1_top_tn.png" },
  { model: "TE-2", name: "TE-2 Tera Echo", wdh: WDH_COMPACT, image: "boss-te-2_top_tn.png" },
  { model: "ST-2", name: "ST-2 Power Stack", wdh: WDH_COMPACT, image: "boss-st-2_top_tn.png" },
  { model: "RV-6", name: "RV-6 Reverb", wdh: WDH_COMPACT, image: "boss-rv_6_top_tn.png" },
  { model: "BP-1W", name: "BP-1W Bass Preamp", wdh: WDH_COMPACT, image: "boss-bp-1w_tn.png" },
  { model: "XS-1", name: "XS-1 Poly Shifter", wdh: WDH_COMPACT, image: "boss-xs-1_tn.png" },
  { model: "RT-2", name: "RT-2 Rotary Ensemble", wdh: WDH_COMPACT, image: "bodd-rt-2_tn.png" },
  // Boss delay / reverb
  { model: "DM-2W", name: "DM-2W Delay", wdh: WDH_COMPACT, image: "boss-dm-2w_top_tn.png" },
  { model: "DM-101", name: "DM-101 Delay", wdh: WDH_200, image: "boss-dm-101_tn.png" },
  { model: "RE-202", name: "RE-202 Space Echo", wdh: WDH_500, image: "boss-re-202_tn.png" },
  { model: "SDE-3", name: "SDE-3", wdh: WDH_500, image: "boss-sde-3_tn.png" },
  { model: "SDE-3000D", name: "SDE-3000D", wdh: WDH_500, image: "boss-sde-3000d_tn.png" },
  { model: "SDE-3000EVH", name: "SDE-3000EVH", wdh: WDH_500, image: "boss-sde-3000evh_tn.png" },
  // Boss 200/500 series
  { model: "DD-200", name: "DD-200", wdh: WDH_200, image: "boss-dd-200_tn.png" },
  { model: "DD-500", name: "DD-500", wdh: WDH_500, image: "boss-dd-500_top_tn.png" },
  { model: "RV-200", name: "RV-200", wdh: WDH_200, image: "boss-rv-200_tn.png" },
  { model: "RV-500", name: "RV-500", wdh: WDH_500, image: "boss-rv-500_tn.png" },
  { model: "MD-200", name: "MD-200", wdh: WDH_200, image: "boss-md-200_tn.png" },
  { model: "MD-500", name: "MD-500", wdh: WDH_500, image: "boss-md-500_tn.png" },
  { model: "EQ-200", name: "EQ-200", wdh: WDH_200, image: "boss-eq-200_tn.png" },
  { model: "IR-200", name: "IR-200", wdh: WDH_200, image: "boss-ir-200_tn.png" },
  { model: "IR-2", name: "IR-2", wdh: WDH_COMPACT, image: "boss-ir-2_tn.png" },
];

// ——— Controllers ———
const bossLoopSwitchers: BossRowBase[] = [
  { model: "ES-5", name: "ES-5", wdh: WDH_ES5, image: "boss-es-5_top_tn.png" },
  { model: "ES-8", name: "ES-8", wdh: WDH_ES8, image: "boss-es-8_top_tn.png" },
];

// ——— Wireless systems ———
const bossWireless: BossRowBase[] = [
  { model: "WL-50", name: "WL-50 Wireless", wdh: WDH_COMPACT, image: "boss-wl-50_wireless.png" },
  { model: "WL-60", name: "WL-60 Wireless", wdh: WDH_COMPACT, image: "boss-wl-60-wireless.png" },
];

// ——— Pedals (delay, OD, etc.) ———
const bossPedalsFinal: BossRowBase[] = [
  { model: "MS-3", name: "MS-3", wdh: WDH_200, image: "boss-ms-3_tn.png" },
  { model: "Boss DD-3T", name: "DD-3T", wdh: WDH_COMPACT, image: "bass-dd-3t_tn.png" },
  { model: "Boss DD-8", name: "DD-8", wdh: WDH_COMPACT, image: "bass-dd-8_tn.png" },
  { model: "OD-2", name: "OD-2", wdh: WDH_COMPACT, image: null },
  { model: "RE-2", name: "RE-2 Space Echo", wdh: WDH_COMPACT, image: "re-boss-2_tn.png" },
];

const toBossRow = (d: BossRowBase, type: BossDeviceRow["type"]): BossDeviceRow => ({ ...d, type });
const bossDevices: BossDeviceRow[] = [
  ...bossPedals.map((d) => toBossRow(d, "pedal")),
  ...bossPedalsContinued.map((d) => toBossRow(d, "pedal")),
  ...bossPedalsRc20xl.map((d) => toBossRow(d, "pedal")),
  ...bossPedalsSlXs.map((d) => toBossRow(d, "pedal")),
  ...bossPedalsRest.map((d) => toBossRow(d, "pedal")),
  ...bossPedalsFinal.map((d) => toBossRow(d, "pedal")),
  ...bossMultifx.map((d) => toBossRow(d, "multifx")),
  ...bossMultifxContinued.map((d) => toBossRow(d, "multifx")),
  ...bossMultifxRcRest.map((d) => toBossRow(d, "multifx")),
  ...bossMultifxSyVe.map((d) => toBossRow(d, "multifx")),
  ...bossLoopSwitchers.map((d) => toBossRow(d, "loopswitcher")),
  ...bossWireless.map((d) => toBossRow(d, "wireless")),
];

function addBossPrefix(name: string): string {
  if (/^Boss/i.test(name)) return name;
  return `Boss ${name}`;
}

export const BOSS_DEVICE_TEMPLATES: DeviceTemplate[] = bossDevices.map((d) =>
  deviceTemplate("boss", "Boss", {
    type: d.type,
    model: d.model,
    wdh: d.wdh,
    name: addBossPrefix(d.name),
    image: d.image ? deviceImage("boss", d.image) : null,
  })
);
