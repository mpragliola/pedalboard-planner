import { CONNECTOR_ICON_MAP } from "../../constants";
import type { ConnectorKind } from "../../types";

interface ConnectorIconProps {
  kind: ConnectorKind;
  title?: string;
  className?: string;
  size?: number;
}

export function ConnectorIcon({
  kind,
  title,
  className,
  size = 24,
}: ConnectorIconProps) {
  const src = CONNECTOR_ICON_MAP[kind];
  if (!src) {
    return <span title={title}>{kind}</span>;
  }
  return (
    <img
      src={src}
      alt=""
      className={className}
      title={title}
      width={size}
      height={size}
    />
  );
}
