import { useIsRowPlaying } from "../../playback/atoms/playhead";
import { EditorCell } from "./editor-cell";

type EditorRowProps = {
  rowIndex: number;
};

const columns = [0, 1, 2, 3] as const;

export function EditorRow({ rowIndex }: EditorRowProps) {
  const isPlaying = useIsRowPlaying(rowIndex);

  return (
    <tr
      className={`border-b hover:bg-amber-100 ${isPlaying ? "bg-red-400" : ""}`}
    >
      <td className="border-x text-center font-mono text-xs px-2">
        {rowIndex + 1}
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
