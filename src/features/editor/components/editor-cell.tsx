import { NoiseCell } from "./noise-cell";
import { PulseCell } from "./pulse-cell";

type EditorCellProps = {
  rowIndex: number;
  columnIndex: number;
};

export function EditorCell({ rowIndex, columnIndex }: EditorCellProps) {
  const isNoiseColumn = columnIndex === 3;

  return (
    <td className="border-x border-b w-44 p-1 hover:bg-primary/30">
      <div className="flex justify-around">
        {isNoiseColumn ? (
          <NoiseCell rowIndex={rowIndex} columnIndex={columnIndex} />
        ) : (
          <PulseCell rowIndex={rowIndex} columnIndex={columnIndex} />
        )}
      </div>
    </td>
  );
}
