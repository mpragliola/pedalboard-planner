import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface SettingsModalContextValue {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const SettingsModalContext = createContext<SettingsModalContextValue | null>(null);

export function SettingsModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const setOpenStable = useCallback((value: boolean) => setOpen(value), []);
  return (
    <SettingsModalContext.Provider value={{ open, setOpen: setOpenStable }}>
      {children}
    </SettingsModalContext.Provider>
  );
}

export function useSettingsModal() {
  const ctx = useContext(SettingsModalContext);
  if (!ctx) throw new Error("useSettingsModal must be used within SettingsModalProvider");
  return ctx;
}
