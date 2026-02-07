import type { CSSProperties } from "react";
import { CONNECTOR_ICON_MAP } from "../../constants";
import type { ConnectorKind } from "../../types";

interface ConnectorIconProps {
  kind: ConnectorKind;
  title?: string;
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
  style?: CSSProperties;
  fallbackLabel?: string;
}

export function ConnectorIcon({
  kind,
  title,
  className,
  width,
  height,
  alt = "",
  style,
  fallbackLabel,
}: ConnectorIconProps) {
  const src = CONNECTOR_ICON_MAP[kind];
  if (!src) {
    if (!fallbackLabel) return null;
    return <span title={title}>{fallbackLabel}</span>;
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      title={title}
      width={width}
      height={height}
      style={style}
    />
  );
}
