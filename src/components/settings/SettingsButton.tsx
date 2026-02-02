import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { SettingsModal } from "./SettingsModal";
import "./SettingsButton.css";

export function SettingsButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="settings-btn"
        onClick={() => setOpen(true)}
        title="Settings"
        aria-label="Settings"
      >
        <FontAwesomeIcon icon={faGear} />
      </button>
      <SettingsModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
