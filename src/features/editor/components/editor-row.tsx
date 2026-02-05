// import { useIsRowPlaying } from "../../playback/atoms/playhead";
import { useIsEndRow, useIsStartRow } from "@/features/playback/atoms/range";
import { EditorCell } from "./editor-cell";
import { RowControl } from "./row-control";
import { useIsRowPlaying } from "@/features/playback/atoms/playhead";

type EditorRowProps = {
  rowIndex: number;
};

const columns = [0, 1, 2, 3] as const;

export function EditorRow({ rowIndex }: EditorRowProps) {
  // const isRowPlaying = useIsRowPlaying(rowIndex);
  const isStartRow = useIsStartRow(rowIndex);
  const isEndRow = useIsEndRow(rowIndex);
  const isRowPlaying = useIsRowPlaying(rowIndex);

  let bg = isStartRow ? "bg-blue-600" : isEndRow ? "bg-red-500" : "";
  if (isRowPlaying) {
    bg = "bg-purple-400";
  }

  return (
    <tr className={`border-b hover:bg-zinc-500 ${bg}`}>
      <td className="border-x font-mono">
        <RowControl rowIndex={rowIndex} />
      </td>
      {columns.map((columnIndex) => (
        <EditorCell
          rowIndex={rowIndex}
          columnIndex={columnIndex}
          key={`cell-row-${rowIndex}-col-${columnIndex}`}
        />
      ))}
    </tr>
  );
}
