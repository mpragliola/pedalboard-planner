import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSettingsModal } from "../../context/SettingsModalContext";
import "./SettingsButton.scss";

export function SettingsButton() {
  const { setOpen } = useSettingsModal();

  return (
    <button
      type="button"
      className="settings-btn"
      onClick={() => setOpen(true)}
      title="Settings"
      aria-label="Settings"
    >
      <FontAwesomeIcon icon={faGear} />
    </button>
  );
}
