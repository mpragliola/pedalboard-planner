import { type ReactNode } from "react";
import "./Collapsible.css";

interface CollapsibleProps {
  /** The header/toggle text */
  title: string;
  /** Content to show when expanded */
  children: ReactNode;
  /** Controlled open state (optional - makes it controlled) */
  open?: boolean;
  /** Called when toggle is clicked (for controlled mode) */
  onToggle?: (open: boolean) => void;
  /** Additional CSS class for the details element */
  className?: string;
}

/**
 * Collapsible section using native <details> element.
 * Benefits:
 * - Built-in accessibility (keyboard navigation, ARIA states)
 * - Native animation support with CSS
 * - No JavaScript needed for basic show/hide
 */
export function Collapsible({ title, children, open, onToggle, className = "" }: CollapsibleProps) {
  const handleToggle = (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    if (onToggle) {
      // Prevent native toggle if controlled
      e.preventDefault();
      onToggle(!open);
    }
  };

  return (
    <details className={`collapsible ${className}`} open={open} onToggle={handleToggle}>
      <summary className="collapsible-summary">
        <span className="collapsible-chevron" aria-hidden>
          ▼
        </span>
        {title}
      </summary>
      <div className="collapsible-content">{children}</div>
    </details>
  );
}
