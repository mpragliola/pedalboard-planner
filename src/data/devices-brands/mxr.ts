import { WDH_MXR_BASS, WDH_MXR_STANDARD } from '../../wdh'
import type { DeviceTemplate } from '../devices'

export const MXR_DEVICE_TEMPLATES: DeviceTemplate[] = [
  { id: 'device-mxr-standard', type: 'pedal', brand: 'MXR', model: 'Standard Pedal', name: 'MXR Standard Pedal', wdh: WDH_MXR_STANDARD, image: 'mxr/mxr-phase90.png' },
  { id: 'device-mxr-bass-di', type: 'pedal', brand: 'MXR', model: 'M81 Bass D.I.+', name: 'MXR M81 Bass D.I.+', wdh: WDH_MXR_BASS, image: 'mxr/mxr-bass-di.png' },
  { id: 'device-mxr-bass-overdrive', type: 'pedal', brand: 'MXR', model: 'M89 Bass Overdrive', name: 'MXR M89 Bass Overdrive', wdh: [70, 110, 50], image: 'mxr/mxr-bass-overdrive.png' },
  { id: 'device-mxr-blackout', type: 'pedal', brand: 'MXR', model: 'Blackout Series', name: 'MXR Blackout Series', wdh: WDH_MXR_STANDARD, image: 'mxr/mxr-blackout.png' },
  { id: 'device-mxr-cae-boost', type: 'pedal', brand: 'MXR', model: 'MC401 CAE Boost/Line Driver', name: 'MXR MC401 CAE Boost/Line Driver', wdh: WDH_MXR_STANDARD, image: 'mxr/mxr-cae-boost.png' },
  { id: 'device-mxr-carboncopy-10th', type: 'pedal', brand: 'MXR', model: 'M299 Carbon Copy 10th Anniv', name: 'MXR M299 Carbon Copy 10th Anniversary', wdh: WDH_MXR_STANDARD, image: 'mxr/mxr-carboncopy 10th anniv.png' },
  { id: 'device-mxr-dime-distortion', type: 'pedal', brand: 'MXR', model: 'DD11 Dime Distortion', name: 'MXR DD11 Dime Distortion', wdh: WDH_MXR_BASS, image: 'mxr/mxr-dime.png' },
  { id: 'device-mxr-dookie-drive-v3', type: 'pedal', brand: 'MXR', model: 'Dookie Drive V3', name: 'MXR Dookie Drive V3', wdh: WDH_MXR_STANDARD, image: 'mxr/mxr-dookie-drive-v3.png' },
  { id: 'device-mxr-dookie-drive', type: 'pedal', brand: 'MXR', model: 'Dookie Drive', name: 'MXR Dookie Drive', wdh: WDH_MXR_STANDARD, image: 'mxr/mxr-dookie-drive.png' },
  { id: 'device-mxr-dookie-drive-v2', type: 'pedal', brand: 'MXR', model: 'Dookie Drive V2', name: 'MXR Dookie Drive V2', wdh: WDH_MXR_STANDARD, image: 'mxr/mxr-dookie.drive-v2.png' },
  { id: 'device-mxr-doubledouble-od', type: 'pedal', brand: 'MXR', model: 'M250 Double-Double Overdrive', name: 'MXR M250 Double-Double Overdrive', wdh: WDH_MXR_STANDARD, image: 'mxr/mxr-doubledouble-od.png' },
  { id: 'device-mxr-gt-od', type: 'pedal', brand: 'MXR', model: 'M193 GT-OD Overdrive', name: 'MXR M193 GT-OD Overdrive', wdh: WDH_MXR_STANDARD, image: 'mxr/mxr-gt-od.png' },
  { id: 'device-mxr-hybrid-fuzz', type: 'pedal', brand: 'MXR', model: 'M296 Hybrid Fuzz', name: 'MXR M296 Hybrid Fuzz', wdh: WDH_MXR_STANDARD, image: 'mxr/mxr-hybrid-fuzz.png' },
  { id: 'device-mxr-ilovedust-carboncopy', type: 'pedal', brand: 'MXR', model: 'ILOVEDUST Carbon Copy', name: 'MXR ILOVEDUST Carbon Copy', wdh: WDH_MXR_STANDARD, image: 'mxr/mxr-ilovedust-carboncopy.png' },
  { id: 'device-mxr-kerry-king-10band', type: 'pedal', brand: 'MXR', model: 'KFK1 Kerry King 10-Band EQ', name: 'MXR KFK1 Kerry King 10-Band EQ', wdh: WDH_MXR_BASS, image: 'mxr/mxr-kerry-king-10-band-eq.png' },
  { id: 'device-mxr-octavio-fuzz', type: 'pedal', brand: 'MXR', model: 'M267 Octavio Fuzz', name: 'MXR M267 Octavio Fuzz', wdh: WDH_MXR_STANDARD, image: 'mxr/mxr-octavio-fuzz.png' },
  { id: 'device-mxr-phase-99', type: 'pedal', brand: 'MXR', model: 'CSP099 Phase 99', name: 'MXR CSP099 Phase 99', wdh: WDH_MXR_STANDARD, image: 'mxr/mxr-phase-99.png' },
  { id: 'device-mxr-raijin-drive', type: 'pedal', brand: 'MXR', model: 'CSP037 Raijin Drive', name: 'MXR CSP037 Raijin Drive', wdh: WDH_MXR_STANDARD, image: 'mxr/mxr-raijin-drive.png' },
  { id: 'device-mxr-thump-bass-preamp', type: 'pedal', brand: 'MXR', model: 'M281 Thump Bass Preamp', name: 'MXR M281 Thump Bass Preamp', wdh: WDH_MXR_STANDARD, image: 'mxr/mxr-thump-bass-preamp.png' },
  { id: 'device-mxr75-phase-vintage-45', type: 'pedal', brand: 'MXR', model: 'CSP105 \'75 Vintage Phase 45', name: 'MXR CSP105 \'75 Vintage Phase 45', wdh: WDH_MXR_STANDARD, image: 'mxr/mxr75-phase-vintage-45.png' },
  { id: 'device-mxr-dd30', type: 'pedal', brand: 'MXR', model: 'DD30 Dookie Drive', name: 'MXR DD30 Dookie Drive', wdh: WDH_MXR_STANDARD, image: 'mxr/mxrDD30.MAIN__92700.png' },
  { id: 'device-mxr-m309', type: 'pedal', brand: 'MXR', model: 'M309 Joshua Ambient Echo', name: 'MXR M309 Joshua Ambient Echo', wdh: WDH_MXR_STANDARD, image: 'mxr/mxrM309.MAIN__43410.png' },
  { id: 'device-mxr-suboctave-fuzz', type: 'pedal', brand: 'MXR', model: 'M287 Sub Octave Bass Fuzz', name: 'MXR M287 Sub Octave Bass Fuzz', wdh: WDH_MXR_BASS, image: 'mxr/mxt-suboctave-fuzz.png' },
]
