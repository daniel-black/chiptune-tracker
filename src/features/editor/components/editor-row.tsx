import { EditorCell } from "./editor-cell";
import { RowControl } from "./row-control";
import { useRowStyle } from "../atoms/row";
import { CHANNEL_CONFIG } from "@/audio/channel-config";

type EditorRowProps = {
  rowIndex: number;
};

export function EditorRow({ rowIndex }: EditorRowProps) {
  return (
    <RowWrapper rowIndex={rowIndex}>
      <td className="border-x border-b font-mono">
        <RowControl rowIndex={rowIndex} />
      </td>
      {CHANNEL_CONFIG.map((_, columnIndex) => (
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
    <tr data-row={rowIndex} className={`border-b ${cn} transition-all duration-10 ease-linear`}>
      {children}
    </tr>
  );
}
