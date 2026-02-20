import { CatalogDraggableItem } from "../CatalogDndProvider";
import { CatalogListItemContent } from "./CatalogListItemContent";
import type { CatalogMode, CatalogListGroupOption, CatalogListOption, CatalogViewMode } from "./types";

type CatalogListDraggableOption = CatalogListOption | CatalogListGroupOption;

interface CatalogListItemProps {
  option: CatalogListDraggableOption;
  catalogMode: CatalogMode;
  viewMode: CatalogViewMode;
  imageBase: string;
  thumbnailSizes: string;
  defaultWidthMm: number;
  defaultDepthMm: number;
}

export function CatalogListItem({
  option,
  catalogMode,
  viewMode,
  imageBase,
  thumbnailSizes,
  defaultWidthMm,
  defaultDepthMm,
}: CatalogListItemProps) {
  return (
    <CatalogDraggableItem
      id={option.id}
      catalogMode={catalogMode}
      imageUrl={option.image ? `${imageBase}${option.image}` : null}
      widthMm={option.widthMm ?? defaultWidthMm}
      depthMm={option.depthMm ?? defaultDepthMm}
      className="catalog-list-item"
      title={`Long-press to drag ${option.name} onto the board`}
    >
      <CatalogListItemContent option={option} viewMode={viewMode} imageBase={imageBase} thumbnailSizes={thumbnailSizes} />
    </CatalogDraggableItem>
  );
}
