import { faCircleInfo, faFloppyDisk, faFolderOpen, faGear, faPlus, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";
import { useBoardIo } from "../../context/BoardIoContext";
import { useConfirmation } from "../../context/ConfirmationContext";
import { useSettingsModal } from "../../context/SettingsModalContext";
import { GptModal } from "../gpt/GptModal";
import { InfoModal } from "../info/InfoModal";
import "./BoardMenu.scss";

interface BoardMenuAction {
  key: string;
  title: string;
  ariaLabel: string;
  icon: IconDefinition;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
}

export function BoardMenu() {
  const { newBoard, loadBoardFromFile, saveBoardToFile } = useBoardIo();
  const { requestConfirmation } = useConfirmation();
  const { setOpen: setSettingsOpen } = useSettingsModal();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isGptOpen, setIsGptOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

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

  const actions: BoardMenuAction[] = [
    {
      key: "new",
      title: "New pedalboard (clear current)",
      ariaLabel: "New pedalboard",
      icon: faPlus,
      onClick: handleNewBoard,
    },
    {
      key: "load",
      title: isLoadingFile ? "Loading pedalboard..." : "Load pedalboard from JSON file",
      ariaLabel: "Load pedalboard",
      icon: faFolderOpen,
      onClick: handleLoadClick,
      disabled: isLoadingFile,
    },
    {
      key: "save",
      title: "Save pedalboard to JSON file",
      ariaLabel: "Save pedalboard",
      icon: faFloppyDisk,
      onClick: saveBoardToFile,
    },
    {
      key: "gpt",
      title: "Build price estimate prompt for LLM",
      ariaLabel: "Build price estimate prompt for LLM",
      icon: faWandMagicSparkles,
      onClick: () => setIsGptOpen(true),
    },
    {
      key: "info",
      title: "About PedalboardFactory",
      ariaLabel: "About PedalboardFactory",
      icon: faCircleInfo,
      onClick: () => setIsInfoOpen(true),
    },
    {
      key: "settings",
      title: "Settings",
      ariaLabel: "Settings",
      icon: faGear,
      onClick: () => setSettingsOpen(true),
    },
  ];

  return (
    <div className="board-menu">
      {actions.map((action) => (
        <button
          key={action.key}
          type="button"
          className="board-menu-btn"
          onClick={() => void action.onClick()}
          title={action.title}
          aria-label={action.ariaLabel}
          disabled={action.disabled}
        >
          <FontAwesomeIcon icon={action.icon} />
        </button>
      ))}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="board-menu-file-input"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleFileChange}
      />
      <GptModal open={isGptOpen} onClose={() => setIsGptOpen(false)} />
      <InfoModal open={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
      {loadError ? (
        <p className="board-menu-error" role="alert">
          {loadError}
        </p>
      ) : null}
    </div>
  );
}
