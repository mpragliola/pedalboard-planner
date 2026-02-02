import type { DeviceTemplate } from "../devices";
import { deviceId } from "../../lib/slug";

const valetonDevices: Omit<DeviceTemplate, "type" | "brand" | "id" | "name">[] = [
  { model: "GP-100", wdh: [290, 190, 60], image: "-gp100.png" },
  { model: "GP-200", wdh: [345, 220, 65], image: null },
  { model: "GP-200LT", wdh: [270, 180, 60], image: null },
  { model: "GP-5", wdh: [93.5, 42, 52], image: "-gp-5.png" },
  {
    model: "Dapper Acoustic Mini",
    wdh: [320, 65, 42],
    image: " dapper acoustic mini.png",
  },
  {
    model: "Dapper Amp Mini",
    wdh: [320, 65, 42],
    image: " dapper amp mini.png",
  },
  {
    model: "Dapper Bass Mini",
    wdh: [320, 65, 42],
    image: " dapper bass miin.png",
  },
  {
    model: "Dapper Bass",
    wdh: [320, 65, 42],
    image: " dapper bass.png",
  },
  {
    model: "Dapper Dark Mini",
    wdh: [320, 65, 42],
    image: " dapper dark mini.png",
  },
  {
    model: "Dapper Dark",
    wdh: [320, 65, 42],
    image: " dapper dark.png",
  },
  {
    model: "Dapper Indie",
    wdh: [320, 65, 42],
    image: " dapper indie.png",
  },
  {
    model: "Dapper Looper Mini",
    wdh: [320, 65, 42],
    image: " dapper looper mini.png",
  },
  {
    model: "Dapper MDR",
    wdh: [320, 65, 42],
    image: " dapper mdr.png",
  },
  {
    model: "Dapper Mini",
    wdh: [320, 65, 42],
    image: " dapper mini.png",
  },
  { model: "Dapper", wdh: [320, 65, 42], image: " dapper.png" },
  { model: "VLP-200", wdh: [290, 190, 60], image: " vlp 200.png" },
  { model: "VLP-400", wdh: [345, 220, 65], image: " vlp 400.png" },
  { model: "GP-100VT", wdh: [290, 190, 60], image: "-gp100vt.png" },
  { model: "GP-200JR", wdh: [270, 180, 60], image: "-gp200jr.png" },
  { model: "GP-200R", wdh: [345, 220, 62.5], image: "-gp200r.png" },
  { model: "GP-200RT", wdh: [345, 220, 62.5], image: "-gp200rt.png" },
  { model: "GP-200VT", wdh: [345, 220, 62.5], image: "-gp200vt.png" },
  { model: "GP-200X", wdh: [345, 220, 62.5], image: "-gp200x.png" },
  { model: "GP-50", wdh: [150, 100, 55], image: "-gp50.png" },
];

export const VALETON_DEVICE_TEMPLATES: DeviceTemplate[] = valetonDevices.map((d) => ({
  ...d,
  name: `Valeton ${d.model}`,
  id: deviceId("valeton", d.model),
  type: "multifx",
  brand: "Valeton",
  image: d.image ? "valeton/valeton" + d.image : null,
}));
