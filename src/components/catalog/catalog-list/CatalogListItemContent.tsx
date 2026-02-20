import { DEFAULT_OBJECT_COLOR } from "../../../constants";
import { buildCatalogImageSourceSet } from "../../../lib/catalogImageSources";
import type { CatalogListGroupOption, CatalogListOption, CatalogViewMode } from "./types";

type CatalogListRenderableOption = CatalogListOption | CatalogListGroupOption;

function buildPlaceholderStyle(widthMm: number | undefined, depthMm: number | undefined, color: string) {
  const w = typeof widthMm === "number" && widthMm > 0 ? widthMm : 1;
  const d = typeof depthMm === "number" && depthMm > 0 ? depthMm : 1;
  const ratio = w / d;
  const safeRatio = Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
  if (safeRatio >= 1) {
    return {
      backgroundColor: color,
      width: "100%",
      height: `${(1 / safeRatio) * 100}%`,
    };
  }
  return {
    backgroundColor: color,
    width: `${safeRatio * 100}%`,
    height: "100%",
  };
}

function CatalogThumbnailImage({ relativePath, sizes }: { relativePath: string; sizes: string }) {
  const { src, srcSet, fullSrc } = buildCatalogImageSourceSet(relativePath, sizes);

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt=""
      aria-hidden
      loading="lazy"
      decoding="async"
      onError={(event) => {
        const target = event.currentTarget;
        if (target.dataset.catalogFallbackApplied === "1") return;
        target.dataset.catalogFallbackApplied = "1";
        target.src = fullSrc;
        target.removeAttribute("srcset");
        target.removeAttribute("sizes");
      }}
    />
  );
}

interface CatalogListItemContentProps {
  option: CatalogListRenderableOption;
  viewMode: CatalogViewMode;
  imageBase: string;
  thumbnailSizes: string;
}

export function CatalogListItemContent({ option, viewMode, imageBase, thumbnailSizes }: CatalogListItemContentProps) {
  return (
    <>
      {viewMode !== "text" && (
        <span className="catalog-list-item-thumb">
          {option.image ? (
            <CatalogThumbnailImage relativePath={`${imageBase}${option.image}`} sizes={thumbnailSizes} />
          ) : (
            <span
              className="catalog-list-item-placeholder"
              style={buildPlaceholderStyle(option.widthMm, option.depthMm, option.color ?? DEFAULT_OBJECT_COLOR)}
            />
          )}
        </span>
      )}
      <span className="catalog-list-item-text">{option.name}</span>
    </>
  );
}
