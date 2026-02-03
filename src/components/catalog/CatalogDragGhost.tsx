import { useApp } from "../../context/AppContext";
import { DEFAULT_OBJECT_COLOR } from "../../constants";
import "./CatalogDragGhost.css";

const GHOST_MAX_PX = 80;

function ghostDimensions(widthMm: number, depthMm: number): { w: number; h: number } {
  const max = Math.max(widthMm, depthMm);
  if (max <= 0) return { w: GHOST_MAX_PX, h: GHOST_MAX_PX };
  const scale = GHOST_MAX_PX / max;
  return {
    w: Math.round(widthMm * scale),
    h: Math.round(depthMm * scale),
  };
}

export function CatalogDragGhost() {
  const { catalogDrag, catalogDragPosition } = useApp();

  // Note: body.catalog-dragging class is managed by AppContext's startCatalogDrag/endCatalogDrag

  if (!catalogDrag) return null;
  const { w, h } = ghostDimensions(catalogDrag.widthMm, catalogDrag.depthMm);
  const x = catalogDragPosition.x - w / 2;
  const y = catalogDragPosition.y - h / 2;
  return (
    <div
      className="catalog-drag-ghost"
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
      }}
      aria-hidden
    >
      {catalogDrag.imageUrl ? (
        <img src={catalogDrag.imageUrl} alt="" className="catalog-drag-ghost-image" width={w} height={h} />
      ) : (
        <span className="catalog-drag-ghost-placeholder" style={{ backgroundColor: DEFAULT_OBJECT_COLOR }} />
      )}
    </div>
  );
}
