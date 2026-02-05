import { EditorCell } from "./editor-cell";
import { RowControl } from "./row-control";
import { useRowStyle } from "../atoms/row";

type EditorRowProps = {
  rowIndex: number;
};

const columns = [0, 1, 2, 3] as const;

export function EditorRow({ rowIndex }: EditorRowProps) {
  return (
    <RowWrapper rowIndex={rowIndex}>
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
    </RowWrapper>
  );
}

function RowWrapper({
  rowIndex,
  children,
}: {
  rowIndex: number;
  children: React.ReactNode;
}) {
  const cn = useRowStyle(rowIndex);

  return (
    <tr className={`border-b ${cn} transition-all duration-10 ease-linear`}>
      {children}
    </tr>
  );
}
