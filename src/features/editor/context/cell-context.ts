import { createContext, useContext } from "react";

type CellPosition = {
  row: number;
  column: number;
};

export const CellContext = createContext<CellPosition | null>(null);

export function useCellPosition(): CellPosition {
  const ctx = useContext(CellContext);
  if (!ctx) {
    throw new Error("useCellPosition must be used within a CellContext.Provider");
  }
  return ctx;
}
