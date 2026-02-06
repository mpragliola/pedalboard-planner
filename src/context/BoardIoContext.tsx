import { createContext, useContext, type ReactNode } from "react";

export interface BoardIoContextValue {
  newBoard: () => void;
  loadBoardFromFile: (file: File) => void;
  saveBoardToFile: () => void;
}

const BoardIoContext = createContext<BoardIoContextValue | null>(null);

export function BoardIoProvider({ value, children }: { value: BoardIoContextValue; children: ReactNode }) {
  return <BoardIoContext.Provider value={value}>{children}</BoardIoContext.Provider>;
}

export function useBoardIo(): BoardIoContextValue {
  const ctx = useContext(BoardIoContext);
  if (!ctx) throw new Error("useBoardIo must be used within BoardIoProvider");
  return ctx;
}
