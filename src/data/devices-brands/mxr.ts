import type { Wdh } from "../../wdh";
import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { pedal, img } = createBrandHelpers("mxr", "MXR");
/** MXR standard (e.g. Phase 90, Carbon Copy). */
const WDH_MXR_STANDARD: Wdh = [60, 110, 50];
/** MXR bass / double (e.g. Bass D.I.+, Dime Distortion). */
const WDH_MXR_BASS: Wdh = [124, 92, 55];

export const MXR_DEVICE_TEMPLATES: DeviceTemplate[] = [
  pedal("Standard Pedal", WDH_MXR_STANDARD, img("mxr-phase90.png")),
  pedal("M81 Bass D.I.+", WDH_MXR_BASS, img("mxr-bass-di.png")),
  pedal("M89 Bass Overdrive", [70, 110, 50], img("mxr-bass-overdrive.png")),
  pedal("Blackout Series", WDH_MXR_STANDARD, img("mxr-blackout.png")),
  pedal("MC401 CAE Boost/Line Driver", WDH_MXR_STANDARD, img("mxr-cae-boost.png")),
  pedal(
    "M299 Carbon Copy 10th Anniv",
    WDH_MXR_STANDARD,
    img("mxr-carboncopy 10th anniv.png"),
    "MXR M299 Carbon Copy 10th Anniversary"
  ),
  pedal("DD11 Dime Distortion", WDH_MXR_BASS, img("mxr-dime.png")),
  pedal("Dookie Drive V3", WDH_MXR_STANDARD, img("mxr-dookie-drive-v3.png")),
  pedal("Dookie Drive", WDH_MXR_STANDARD, img("mxr-dookie-drive.png")),
  pedal("Dookie Drive V2", WDH_MXR_STANDARD, img("mxr-dookie.drive-v2.png")),
  pedal("M250 Double-Double Overdrive", WDH_MXR_STANDARD, img("mxr-doubledouble-od.png")),
  pedal("M193 GT-OD Overdrive", WDH_MXR_STANDARD, img("mxr-gt-od.png")),
  pedal("M296 Hybrid Fuzz", WDH_MXR_STANDARD, img("mxr-hybrid-fuzz.png")),
  pedal("ILOVEDUST Carbon Copy", WDH_MXR_STANDARD, img("mxr-ilovedust-carboncopy.png")),
  pedal("KFK1 Kerry King 10-Band EQ", WDH_MXR_BASS, img("mxr-kerry-king-10-band-eq.png")),
  pedal("M267 Octavio Fuzz", WDH_MXR_STANDARD, img("mxr-octavio-fuzz.png")),
  pedal("CSP099 Phase 99", WDH_MXR_STANDARD, img("mxr-phase-99.png")),
  pedal("CSP037 Raijin Drive", WDH_MXR_STANDARD, img("mxr-raijin-drive.png")),
  pedal("M281 Thump Bass Preamp", WDH_MXR_STANDARD, img("mxr-thump-bass-preamp.png")),
  pedal(
    "CSP105 '75 Vintage Phase 45",
    WDH_MXR_STANDARD,
    img("mxr75-phase-vintage-45.png"),
    "MXR CSP105 '75 Vintage Phase 45"
  ),
  pedal("DD30 Dookie Drive", WDH_MXR_STANDARD, img("mxrdd30.main__92700.png")),
  pedal("M309 Joshua Ambient Echo", WDH_MXR_STANDARD, img("mxrm309.main__43410.png")),
  pedal("M287 Sub Octave Bass Fuzz", WDH_MXR_BASS, img("mxt-suboctave-fuzz.png")),
];
