import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { pedal, power, img } = createBrandHelpers("tonecity", "Tone City");

const WDH_TC: [number, number, number] = [70, 120, 50];
const WDH_TC_POWER: [number, number, number] = [150, 80, 35];

export const TONE_CITY_DEVICE_TEMPLATES: DeviceTemplate[] = [
  pedal("Allspark", WDH_TC, img("tonecity-allspark.png")),
  pedal("Angel Wing", WDH_TC, img("tonecity-angel-wing.png")),
  pedal("Bad Horse", WDH_TC, img("tonecity-bad-horse.png")),
  pedal("Big Rumble", WDH_TC, img("tonecity-big-rumble.png")),
  pedal("Black Tea", WDH_TC, img("tonecity-black-tea.png")),
  pedal("Bluesman", WDH_TC, img("tonecity-bluesman.png")),
  pedal("Comp Engine", WDH_TC, img("tonecity-comp-engine.png")),
  pedal("Double Durple", WDH_TC, img("tonecity-double-durple.png")),
  pedal("Dry Martini", WDH_TC, img("tonecity-dry-martini.png")),
  pedal("Durple", WDH_TC, img("tonecity-durple.png")),
  pedal("Fuxx Fuzz", WDH_TC, img("tonecity-fuxx-fuzz.png")),
  pedal("Heat", WDH_TC, img("tonecity-heat.png")),
  pedal("Heavenly Lake", WDH_TC, img("tonecity-heavenly-lake.png")),
  pedal("Holy Aura", WDH_TC, img("tonecity-holy-aura.png")),
  pedal("Kaffir Lime", WDH_TC, img("tonecity-kaffir-lime.png")),
  pedal("King of Blues", WDH_TC, img("tonecity-king-of-blues.png")),
  pedal("Mandragora", WDH_TC, img("tonecity-mandragora.png")),
  pedal("Matcha Cream", WDH_TC, img("tonecity-matcha-cream.png")),
  pedal("Mickey", WDH_TC, img("tonecity-mickey.png")),
  pedal("Nobleman", WDH_TC, img("tonecity-nobleman.png")),
  pedal("Pedal Substation 1", WDH_TC, img("tonecity-pedal-substation-1.png")),
  pedal("Summer Orange", WDH_TC, img("tonecity-summer-orange.png")),
  pedal("Sweet Cream", WDH_TC, img("tonecity-sweet-cream.png")),
  pedal("Tape Machine", WDH_TC, img("tonecity-tape-machine.png")),
  pedal("Tiny Spring", WDH_TC, img("tonecity-tiny-spring.png")),
  pedal("Tremble", WDH_TC, img("tonecity-tremble.png")),
  pedal("Wild Fire", WDH_TC, img("tonecity-wild-fire.png")),
  pedal("Wildfro", WDH_TC, img("tonecity-wildfro.png")),
  power("TPS-06 Multi Power Supply", WDH_TC_POWER, null),
  power("TPS-5", WDH_TC_POWER, img("tonecity-tps5.png")),
  power("TPS-6", WDH_TC_POWER, img("tonecity-tps6.png")),
  power("TPS-8", WDH_TC_POWER, img("tonecity-tps8.png")),
  power("TPS-10", WDH_TC_POWER, img("tonecity-tps10.png")),
  power("TPS-12", WDH_TC_POWER, img("tonecity-tps12.png")),
];
