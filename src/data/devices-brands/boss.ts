import { WDH_BOSS_COMPACT, WDH_BOSS_200, WDH_BOSS_500, WDH_BOSS_GT1, WDH_BOSS_GT6 } from "../../wdh";
import type { DeviceTemplate } from "../devices";
import { deviceId } from "../../lib/slug";

type BossDeviceRow = Omit<DeviceTemplate, "id" | "brand"> & {
  image: string | null;
};
type BossRowBase = Omit<BossDeviceRow, "type">;

// ——— Pedals ———
const bossPedals: BossRowBase[] = [
  {
    model: "Compact Pedal (BOSS standard)",
    name: "Boss Compact Pedal (BOSS standard)",
    wdh: WDH_BOSS_COMPACT,
    image: null,
  },
  {
    model: "DS-1",
    name: "Boss DS-1",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-ds1.png",
  },
  {
    model: "DS-1W",
    name: "Boss DS-1W",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-ds1w.png",
  },
  {
    model: "DS-2",
    name: "Boss DS-2",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-ds2_tn_thumb.png",
  },
  {
    model: "DS-1X",
    name: "Boss DS-1X",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-ds-1x_top_vtn.png",
  },
  {
    model: "MT-2",
    name: "Boss MT-2",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-mt-2_top_tn.png",
  },
  {
    model: "MT-2W",
    name: "Boss MT-2W",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-mt-2w_tn.png",
  },
  {
    model: "SD-1",
    name: "Boss SD-1",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-sd1.png",
  },
  {
    model: "Twin Pedal (FS-6 size)",
    name: "Boss Twin Pedal (FS-6 size)",
    wdh: [188, 91, 60],
    image: null,
  },
  {
    model: "Mini Pedal",
    name: "Boss Mini Pedal",
    wdh: [43, 93, 50],
    image: null,
  },
];

// ——— Multifx ———
const bossMultifx: BossRowBase[] = [
  {
    model: "GT-1000",
    name: "Boss GT-1000",
    wdh: [462, 248, 71],
    image: "boss-gt-1000.png",
  },
  {
    model: "GT-1000 Core",
    name: "Boss GT-1000 Core",
    wdh: [174, 135, 60],
    image: "boss-gt-1000core.png",
  },
  {
    model: "GX-100",
    name: "Boss GX-100",
    wdh: [311, 215, 70],
    image: "boss-gx-100.png",
  },
  {
    model: "ME-90",
    name: "Boss ME-90",
    wdh: [443, 220, 66],
    image: "boss-me-90.png",
  },
  {
    model: "GM-800",
    name: "Boss GM-800",
    wdh: [311, 215, 70],
    image: "boss-gm-800.png",
  },
  {
    model: "GP-10",
    name: "Boss GP-10",
    wdh: WDH_BOSS_GT1,
    image: null,
  },
  {
    model: "GT-1",
    name: "Boss GT-1",
    wdh: WDH_BOSS_GT1,
    image: "boss-gt-1.png",
  },
  {
    model: "GT-1B",
    name: "Boss GT-1B",
    wdh: WDH_BOSS_GT1,
    image: "boss-gt-1b.png",
  },
  {
    model: "GT-001",
    name: "Boss GT-001",
    wdh: [200, 150, 50],
    image: "boss-gt-001.png",
  },
  {
    model: "GT-100",
    name: "Boss GT-100",
    wdh: [440, 240, 70],
    image: "boss-gt-100.png",
  },
  {
    model: "GT-10",
    name: "Boss GT-10",
    wdh: [542, 272, 77],
    image: "boss-gt-10.png",
  },
  {
    model: "GT-10B",
    name: "Boss GT-10B",
    wdh: [542, 272, 77],
    image: "boss-gt-10b.png",
  },
  {
    model: "GT-3",
    name: "Boss GT-3",
    wdh: [487, 222, 97],
    image: "boss-gt-3.png",
  },
  {
    model: "GT-5",
    name: "Boss GT-5",
    wdh: [520, 221, 113.5],
    image: "boss-gt-5.png",
  },
  {
    model: "GT-6",
    name: "Boss GT-6",
    wdh: WDH_BOSS_GT6,
    image: "boss-gt-6.png",
  },
  {
    model: "GT-6B",
    name: "Boss GT-6B",
    wdh: WDH_BOSS_GT6,
    image: "boss-gt-6b.png",
  },
  {
    model: "GT-8",
    name: "Boss GT-8",
    wdh: WDH_BOSS_GT6,
    image: "boss-gt-8.png",
  },
  {
    model: "GX-1",
    name: "Boss GX-1",
    wdh: [307, 149, 56],
    image: "boss-gx-1.png",
  },
  {
    model: "GX-1B",
    name: "Boss GX-1B",
    wdh: [307, 149, 56],
    image: "boss-gx-1b.png",
  },
  {
    model: "GX-10",
    name: "Boss GX-10",
    wdh: [300, 183, 74],
    image: "boss-gx-10.png",
  },
  {
    model: "ME-25",
    name: "Boss ME-25",
    wdh: [350, 200, 60],
    image: "boss-me-25.png",
  },
  {
    model: "ME-80",
    name: "Boss ME-80",
    wdh: [420, 220, 65],
    image: "boss-me-80.png",
  },
  {
    model: "ME-20",
    name: "Boss ME-20",
    wdh: [294, 179, 54],
    image: "boss-me-20.png",
  },
  {
    model: "ME-20B",
    name: "Boss ME-20B",
    wdh: [294, 179, 54],
    image: "boss-me-20b.png",
  },
  {
    model: "ME-33",
    name: "Boss ME-33",
    wdh: [398, 215, 56],
    image: "boss-me-33.png",
  },
  {
    model: "ME-50",
    name: "Boss ME-50",
    wdh: [384, 225, 78],
    image: "boss-me-50.png",
  },
  {
    model: "ME-50B",
    name: "Boss ME-50B",
    wdh: [384, 225, 78],
    image: "boss-me-50b.png",
  },
  {
    model: "ME-70",
    name: "Boss ME-70",
    wdh: [384, 229, 74],
    image: "boss-me-70.png",
  },
  {
    model: "Pocket GT",
    name: "Boss Pocket GT",
    wdh: [105, 65, 25],
    image: "pocket_gt.png",
  },
  // Boss RC series (loopers)
  {
    model: "RC-10R",
    name: "Boss RC-10R",
    wdh: WDH_BOSS_200,
    image: "boss-rc-10r.png",
  },
  {
    model: "RC-202",
    name: "Boss RC-202",
    wdh: [320, 240, 60],
    image: null,
  },
];

// ——— Pedals (continued: loopers, SY, compact, etc.) ———
const bossPedalsContinued: BossRowBase[] = [
  {
    model: "RC-1",
    name: "Boss RC-1 Loop Station",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-rc-1.png",
  },
  {
    model: "RC-2",
    name: "Boss RC-2 Loop Station",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-rc-2.png",
  },
];

// ——— Multifx (continued: RC, SY, VE) ———
const bossMultifxContinued: BossRowBase[] = [
  {
    model: "RC-3",
    name: "Boss RC-3",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-rc-3.png",
  },
  {
    model: "RC-30",
    name: "Boss RC-30",
    wdh: [300, 200, 60],
    image: "boss-rc-30.png",
  },
  {
    model: "RC-300",
    name: "Boss RC-300",
    wdh: [520, 300, 80],
    image: "boss-rc-300.png",
  },
  {
    model: "RC-5",
    name: "Boss RC-5",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-rc-5.png",
  },
];

const bossPedalsRc20xl: BossRowBase[] = [
  {
    model: "RC-20XL",
    name: "Boss RC-20XL Loop Station",
    wdh: [173, 158, 57],
    image: "boss-rc-20xl.png",
  },
];

const bossMultifxRcRest: BossRowBase[] = [
  {
    model: "RC-50",
    name: "Boss RC-50 Loop Station",
    wdh: [480, 231, 84],
    image: "boss-rc-50.png",
  },
  {
    model: "RC-500",
    name: "Boss RC-500",
    wdh: WDH_BOSS_200,
    image: "boss-rc-500.png",
  },
  {
    model: "RC-505",
    name: "Boss RC-505",
    wdh: [420, 234, 67],
    image: null,
  },
  {
    model: "RC-505 MkII",
    name: "Boss RC-505 MkII",
    wdh: [420, 234, 67],
    image: null,
  },
  {
    model: "RC-600",
    name: "Boss RC-600",
    wdh: [435, 163, 70],
    image: "boss-rc-600.png",
  },
];

// ——— Pedals (SL, XS) ———
const bossPedalsSlXs: BossRowBase[] = [
  {
    model: "SL-2",
    name: "Boss SL-2 Slicer",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-sl-2_tn.png",
  },
  {
    model: "XS-100 Poly Shifter",
    name: "Boss XS-100 Poly Shifter",
    wdh: [192, 248, 73],
    image: "boss-xs-100_tn.png",
  },
];

// ——— Multifx (SY, VE) ———
const bossMultifxSyVe: BossRowBase[] = [
  {
    model: "SY-1000",
    name: "Boss SY-1000",
    wdh: [345, 245, 67],
    image: "boss-sy-1000.png",
  },
  {
    model: "VE-22",
    name: "Boss VE-22 Vocal Performer",
    wdh: [218, 143, 64],
    image: "boss-ve-22.png",
  },
  {
    model: "VE-500",
    name: "Boss VE-500 Vocal Performer",
    wdh: [170, 138, 62],
    image: "boss-ve-500.png",
  },
  {
    model: "SY-300",
    name: "Boss SY-300",
    wdh: [420, 240, 70],
    image: "boss-sy_300_top_tn.png",
  },
];

// ——— Pedals (SY-1, SY-200, then chorus/delay/etc.) ———
const bossPedalsRest: BossRowBase[] = [
  {
    model: "SY-1",
    name: "Boss SY-1",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-sy-1_tn.png",
  },
  {
    model: "SY-200",
    name: "Boss SY-200",
    wdh: WDH_BOSS_200,
    image: "boss-sy-200_tn.png",
  },
  // Boss compact pedals (chorus, flanger, drive, etc.)
  {
    model: "BF-3",
    name: "Boss BF-3 Flanger",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-bf_3_top_tn_thumb.png",
  },
  {
    model: "CE-5",
    name: "Boss CE-5 Chorus Ensemble",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-ce_5_top_tn_thumb.png",
  },
  {
    model: "CH-1",
    name: "Boss CH-1 Super Chorus",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-ch_1_tn_thumb.png",
  },
  {
    model: "CS-3",
    name: "Boss CS-3 Compression Sustainer",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-cs_3_top_tn_thumb.png",
  },
  {
    model: "CP-1X",
    name: "Boss CP-1X Compressor",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-cp-1x_tn.png",
  },
  {
    model: "DC-2W",
    name: "Boss DC-2W Dimension C",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-dc-2w_tn.png",
  },
  {
    model: "GE-7",
    name: "Boss GE-7 Equalizer",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-ge_7_tn_thumb.png",
  },
  {
    model: "GEB-7",
    name: "Boss GEB-7 Bass Equalizer",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-geb_7_tn_thumb.png",
  },
  {
    model: "HM-2W",
    name: "Boss HM-2W",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-hm-2w_top_tn.png",
  },
  {
    model: "JB-2",
    name: "Boss JB-2 Angry Driver",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-jb-2_tn.png",
  },
  {
    model: "LS-2",
    name: "Boss LS-2 Line Selector",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-ls2_tn_thumb.png",
  },
  {
    model: "MD-2",
    name: "Boss MD-2 Mega Distortion",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-md_2_tn_thumb.png",
  },
  {
    model: "ML-2",
    name: "Boss ML-2 Metal Core",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-ml_2_top_tn_thumb.png",
  },
  {
    model: "NS-2",
    name: "Boss NS-2 Noise Suppressor",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-ns2_tn_thumb.png",
  },
  {
    model: "NS-1X",
    name: "Boss NS-1X",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-ns-1x_tn.png",
  },
  {
    model: "OC-5",
    name: "Boss OC-5 Super Octave",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-oc-5_tn.png",
  },
  {
    model: "PH-3",
    name: "Boss PH-3 Phase Shifter",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-ph3_2_tn_thumb.png",
  },
  {
    model: "PS-6",
    name: "Boss PS-6 Harmonist",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-ps-6_top_tn.png",
  },
  {
    model: "TR-2",
    name: "Boss TR-2 Tremolo",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-tr2_tn_thumb.png",
  },
  {
    model: "TU-3",
    name: "Boss TU-3 Chromatic Tuner",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-tu-3_top_tn.png",
  },
  {
    model: "TU-3S",
    name: "Boss TU-3S",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-tu-3s_top_tn.png",
  },
  {
    model: "TU-3W",
    name: "Boss TU-3W",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-tu-3w_top_tn.png",
  },
  {
    model: "VB-2W",
    name: "Boss VB-2W Vibrato",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-vb-2w_top_tn.png",
  },
  {
    model: "VO-1",
    name: "Boss VO-1 Vocoder",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-vo-1_top_tn.png",
  },
  {
    model: "TE-2",
    name: "Boss TE-2 Tera Echo",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-te-2_top_tn.png",
  },
  {
    model: "ST-2",
    name: "Boss ST-2 Power Stack",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-st-2_top_tn.png",
  },
  {
    model: "RV-6",
    name: "Boss RV-6 Reverb",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-rv_6_top_tn.png",
  },
  {
    model: "BP-1W",
    name: "Boss BP-1W Bass Preamp",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-bp-1w_tn.png",
  },
  {
    model: "XS-1",
    name: "Boss XS-1 Poly Shifter",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-xs-1_tn.png",
  },
  {
    model: "RT-2",
    name: "Boss RT-2 Rotary Ensemble",
    wdh: WDH_BOSS_COMPACT,
    image: "bodd-rt-2_tn.png",
  },
  // Boss delay / reverb (compact)
  {
    model: "DM-2W",
    name: "Boss DM-2W Delay",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-dm-2w_top_tn.png",
  },
  {
    model: "DM-101",
    name: "Boss DM-101 Delay",
    wdh: WDH_BOSS_200,
    image: "boss-dm-101_tn.png",
  },
  {
    model: "RE-202",
    name: "Boss RE-202 Space Echo",
    wdh: WDH_BOSS_500,
    image: "boss-re-202_tn.png",
  },
  {
    model: "SDE-3",
    name: "Boss SDE-3",
    wdh: WDH_BOSS_500,
    image: "boss-sde-3_tn.png",
  },
  {
    model: "SDE-3000D",
    name: "Boss SDE-3000D",
    wdh: WDH_BOSS_500,
    image: "boss-sde-3000d_tn.png",
  },
  {
    model: "SDE-3000EVH",
    name: "Boss SDE-3000EVH",
    wdh: WDH_BOSS_500,
    image: "boss-sde-3000evh_tn.png",
  },
  // Boss 200/500 series
  {
    model: "DD-200",
    name: "Boss DD-200",
    wdh: WDH_BOSS_200,
    image: "boss-dd-200_tn.png",
  },
  {
    model: "DD-500",
    name: "Boss DD-500",
    wdh: WDH_BOSS_500,
    image: "boss-dd-500_top_tn.png",
  },
  {
    model: "RV-200",
    name: "Boss RV-200",
    wdh: WDH_BOSS_200,
    image: "boss-rv-200_tn.png",
  },
  {
    model: "RV-500",
    name: "Boss RV-500",
    wdh: WDH_BOSS_500,
    image: "boss-rv-500_tn.png",
  },
  {
    model: "MD-200",
    name: "Boss MD-200",
    wdh: WDH_BOSS_200,
    image: "boss-md-200_tn.png",
  },
  {
    model: "MD-500",
    name: "Boss MD-500",
    wdh: WDH_BOSS_500,
    image: "boss-md-500_tn.png",
  },
  {
    model: "EQ-200",
    name: "Boss EQ-200",
    wdh: WDH_BOSS_200,
    image: "boss-eq-200_tn.png",
  },
  {
    model: "IR-200",
    name: "Boss IR-200",
    wdh: WDH_BOSS_200,
    image: "boss-ir-200_tn.png",
  },
  {
    model: "IR-2",
    name: "Boss IR-2",
    wdh: WDH_BOSS_COMPACT,
    image: "boss-ir-2_tn.png",
  },
];

// ——— Controllers ———
const bossControllers: BossRowBase[] = [
  {
    model: "ES-5",
    name: "Boss ES-5",
    wdh: [380, 180, 60],
    image: "boss-es-5_top_tn.png",
  },
  {
    model: "ES-8",
    name: "Boss ES-8",
    wdh: [480, 220, 70],
    image: "boss-es-8_top_tn.png",
  },
];

// ——— Pedals (delay, OD, etc.) ———
const bossPedalsFinal: BossRowBase[] = [
  {
    model: "MS-3",
    name: "Boss MS-3",
    wdh: WDH_BOSS_200,
    image: "boss-ms-3_tn.png",
  },
  {
    model: "Boss DD-3T",
    name: "Boss DD-3T",
    wdh: WDH_BOSS_COMPACT,
    image: "bass-dd-3t_tn.png",
  },
  {
    model: "Boss DD-8",
    name: "Boss DD-8",
    wdh: WDH_BOSS_COMPACT,
    image: "bass-dd-8_tn.png",
  },
  {
    model: "OD-2",
    name: "Boss OD-2",
    wdh: WDH_BOSS_COMPACT,
    image: null,
  },
  {
    model: "RE-2",
    name: "Boss RE-2 Space Echo",
    wdh: WDH_BOSS_COMPACT,
    image: "re-boss-2_tn.png",
  },
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
  ...bossControllers.map((d) => toBossRow(d, "controller")),
];

export const BOSS_DEVICE_TEMPLATES: DeviceTemplate[] = bossDevices.map((d) => ({
  ...d,
  id: deviceId("boss", d.model),
  brand: "Boss",
  image: d.image ? "boss/" + d.image : null,
}));
