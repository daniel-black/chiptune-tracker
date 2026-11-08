import { useMemo } from "react";
import { CellContext } from "../context/cell-context";
import { NoiseCell } from "./noise-cell";
import { PulseCell } from "./pulse-cell";
import { CHANNEL_CONFIG } from "@/audio/channel-config";

type EditorCellProps = {
  rowIndex: number;
  columnIndex: number;
};

export function EditorCell({ rowIndex, columnIndex }: EditorCellProps) {
  const kind = CHANNEL_CONFIG[columnIndex].kind;
  const cellPosition = useMemo(
    () => ({ row: rowIndex, column: columnIndex }),
    [rowIndex, columnIndex],
  );

  return (
    <CellContext.Provider value={cellPosition}>
      <td className="border-r border-b px-3 hover:bg-foreground/[0.04]">
        <div className="flex justify-center gap-2.5 2xl:gap-4">
          {kind === "noise" ? (
            <NoiseCell rowIndex={rowIndex} columnIndex={columnIndex} />
          ) : (
            <PulseCell rowIndex={rowIndex} columnIndex={columnIndex} />
          )}
        </div>
      </td>
    </CellContext.Provider>
  );
}
