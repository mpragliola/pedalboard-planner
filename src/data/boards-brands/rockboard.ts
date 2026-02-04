import type { BoardTemplate } from "../boards";
import { boardId } from "../../lib/slug";
import type { Wdh } from "../../wdh";

/** Dimensions from RockBoard Size Comparisons 2024 (rockboard.de) */
const rockboardTemplatesRaw: { model: string; wdh: Wdh; image: string | null }[] = [
  { model: "Duo 2.0", wdh: [318, 142, 35], image: "duo2.0.png" },
  { model: "Duo 2.1", wdh: [470, 142, 35], image: "duo2.1.png" },
  { model: "Duo 2.2", wdh: [622, 142, 35], image: "duo-2.2.png" },
  { model: "Duo 2.3", wdh: [722, 142, 35], image: "duo-2.3.png" },
  { model: "Tres 3.0", wdh: [442, 236, 37], image: "tres-3.0.png" },
  { model: "Tres 3.1", wdh: [522, 236, 37], image: "tres-3.1.png" },
  { model: "Tres 3.2", wdh: [598, 236, 37], image: "tres-3.2.png" },
  { model: "Tres 3.3", wdh: [722, 236, 37], image: "tres-3.3.png" },
  { model: "Quad 4.1", wdh: [470, 330, 37], image: "quad-4.1.png" },
  { model: "Quad 4.2", wdh: [622, 330, 37], image: null },
  { model: "Quad 4.3", wdh: [828, 330, 37], image: null },
  { model: "Quad 4.4", wdh: [722, 330, 37], image: null },
  { model: "Cinque 5.2", wdh: [622, 424, 37], image: null },
  { model: "Cinque 5.3", wdh: [820, 424, 37], image: null },
  { model: "Cinque 5.3 MAX", wdh: [826, 498, 37], image: null },
  { model: "Cinque 5.4", wdh: [1002, 424, 37], image: null },
];

export const ROCKBOARD_BOARD_TEMPLATES: BoardTemplate[] = rockboardTemplatesRaw.map((entry) => {
  const { model, wdh, image } = entry;
  return {
    id: boardId("rockboard", model),
    type: "classic",
    brand: "RockBoard",
    model,
    name: `RockBoard ${model}`,
    wdh,
    image: image ? `rockboard/warwick-rockboard-${image}` : null,
  };
});
