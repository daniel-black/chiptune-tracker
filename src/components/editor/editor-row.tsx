import { EditorCell } from "./editor-cell";

type EditorRowProps = {
  rowIndex: number;
};

const columns = [0, 1, 2, 3] as const;

export function EditorRow({ rowIndex }: EditorRowProps) {
  return (
    <tr className="nth-4:bg-blue-300 border-b hover:bg-amber-100">
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
