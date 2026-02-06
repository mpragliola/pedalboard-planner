import { faFloppyDisk, faFolderOpen, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";
import { useBoardIo } from "../../context/BoardIoContext";
import { useConfirmation } from "../../context/ConfirmationContext";
import { GptButton } from "../gpt/GptButton";
import { InfoButton } from "../info/InfoButton";
import { SettingsButton } from "../settings/SettingsButton";
import "./BoardMenu.scss";

export function BoardMenu() {
  const { newBoard, loadBoardFromFile, saveBoardToFile } = useBoardIo();
  const { requestConfirmation } = useConfirmation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleNewBoard = async () => {
    const confirmed = await requestConfirmation({
      title: "New pedalboard",
      message: "Clear the current pedalboard and start fresh? Unsaved changes will be lost.",
      confirmLabel: "New",
      cancelLabel: "Cancel",
      danger: true,
    });
    if (confirmed) newBoard();
  };

  const handleLoadClick = () => {
    if (isLoadingFile) return;
    setLoadError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingFile(true);
    setLoadError(null);
    try {
      await loadBoardFromFile(file);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load pedalboard file.");
    } finally {
      e.target.value = "";
      setIsLoadingFile(false);
    }
  };

  return (
    <div className="board-menu">
      <button
        type="button"
        className="board-menu-btn"
        onClick={handleNewBoard}
        title="New pedalboard (clear current)"
        aria-label="New pedalboard"
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
      <button
        type="button"
        className="board-menu-btn"
        onClick={handleLoadClick}
        title={isLoadingFile ? "Loading pedalboard..." : "Load pedalboard from JSON file"}
        aria-label="Load pedalboard"
        disabled={isLoadingFile}
      >
        <FontAwesomeIcon icon={faFolderOpen} />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="board-menu-file-input"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleFileChange}
      />
      <button
        type="button"
        className="board-menu-btn"
        onClick={saveBoardToFile}
        title="Save pedalboard to JSON file"
        aria-label="Save pedalboard"
      >
        <FontAwesomeIcon icon={faFloppyDisk} />
      </button>
      <GptButton />
      <InfoButton />
      <SettingsButton />
      {loadError ? (
        <p className="board-menu-error" role="alert">
          {loadError}
        </p>
      ) : null}
    </div>
  );
}
