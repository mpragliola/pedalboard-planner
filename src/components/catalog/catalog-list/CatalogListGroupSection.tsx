import {
  faChevronDown,
  faChevronRight,
  faGaugeHigh,
  faGuitar,
  faLayerGroup,
  faLinkSlash,
  faPlug,
  faSliders,
  faVolumeHigh,
  faWifi,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { DeviceType } from "../../../data/devices";
import { CatalogListItem } from "./CatalogListItem";
import { isCardCatalogViewMode } from "./catalogListView";
import type { CatalogListGroup, CatalogMode, CatalogViewMode } from "./types";

const CATALOG_GROUP_DEVICE_TYPE_ICON: Record<DeviceType, IconDefinition> = {
  pedal: faGuitar,
  multifx: faLayerGroup,
  expression: faGaugeHigh,
  volume: faVolumeHigh,
  power: faPlug,
  controller: faSliders,
  wireless: faWifi,
  loopswitcher: faLinkSlash,
};

function groupDomId(listId: string, groupLabel: string): string {
  return `${listId}-group-${groupLabel.replace(/\s+/g, "-")}`;
}

interface CatalogListGroupSectionProps {
  listId: string;
  group: CatalogListGroup;
  catalogMode: CatalogMode;
  viewMode: CatalogViewMode;
  imageBase: string;
  thumbnailSizes: string;
  isCollapsed: boolean;
  onToggle: (groupLabel: string) => void;
}

export function CatalogListGroupSection({
  listId,
  group,
  catalogMode,
  viewMode,
  imageBase,
  thumbnailSizes,
  isCollapsed,
  onToggle,
}: CatalogListGroupSectionProps) {
  const { deviceType, label: groupLabel, options: groupOptions } = group;
  if (groupOptions.length === 0) return null;

  const cardMode = isCardCatalogViewMode(viewMode);
  const domId = groupDomId(listId, groupLabel);
  const deviceTypeIcon = deviceType ? CATALOG_GROUP_DEVICE_TYPE_ICON[deviceType] : undefined;

  return (
    <div className="catalog-list-group">
      {!cardMode && (
        <button
          type="button"
          className="catalog-list-group-label"
          onClick={(event) => {
            event.preventDefault();
            onToggle(groupLabel);
          }}
          aria-expanded={!isCollapsed}
          aria-controls={domId}
        >
          <span className="catalog-list-group-label-text">{groupLabel}</span>
          <span className="catalog-list-group-label-icons">
            {deviceTypeIcon ? <FontAwesomeIcon icon={deviceTypeIcon} className="catalog-list-group-icon" aria-hidden /> : null}
            <FontAwesomeIcon icon={isCollapsed ? faChevronRight : faChevronDown} className="catalog-list-group-chevron" aria-hidden />
          </span>
        </button>
      )}
      <div
        id={!cardMode ? domId : undefined}
        className={`catalog-list-group-inner ${!cardMode && isCollapsed ? "collapsed" : "expanded"}`}
        style={cardMode ? { display: "block" } : { display: "grid" }}
      >
        <div className={cardMode ? "catalog-list-group-grid" : "catalog-list-group-content"}>
          {groupOptions.map((option) => (
            <CatalogListItem
              key={option.id}
              option={option}
              catalogMode={catalogMode}
              viewMode={viewMode}
              imageBase={imageBase}
              thumbnailSizes={thumbnailSizes}
              defaultWidthMm={75}
              defaultDepthMm={120}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
