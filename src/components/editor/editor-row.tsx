import { EditorCell } from "./editor-cell";

type EditorRowProps = {
  rowIndex: number;
};

const columns = [0, 1, 2, 3] as const;

export function EditorRow({ rowIndex }: EditorRowProps) {
  return (
    <tr>
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
