import "./OverlayMessage.scss";

interface OverlayMessageProps {
  message: string | null;
  visible?: boolean;
}

export function OverlayMessage({ message, visible = true }: OverlayMessageProps) {
  if (!visible || !message) return null;
  return (
    <p className="overlay-message" aria-live="polite">
      {message}
    </p>
  );
}
