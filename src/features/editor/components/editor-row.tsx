import { EditorCell } from "./editor-cell";
import { RowControl } from "./row-control";
import { useRowStyle } from "../atoms/row";
import { CHANNEL_CONFIG } from "@/audio/channel-config";

type EditorRowProps = {
  rowIndex: number;
};

export function EditorRow({ rowIndex }: EditorRowProps) {
  const rowStyle = useRowStyle(rowIndex);

  return (
    <tr data-row={rowIndex} className={rowStyle}>
      {/* Row numbers stay pinned when scrolling sideways. The cell needs an
          opaque background, so the row highlight is repeated as an overlay. */}
      <td className="sticky left-0 z-[1] bg-secondary border-b border-r font-mono">
        <div
          aria-hidden
          className={`absolute inset-0 pointer-events-none ${rowStyle}`}
        />
        <RowControl rowIndex={rowIndex} />
      </td>
      {CHANNEL_CONFIG.map((_, columnIndex) => (
        <EditorCell
          rowIndex={rowIndex}
          columnIndex={columnIndex}
          key={`cell-row-${rowIndex}-col-${columnIndex}`}
        />
      ))}
    </tr>
  );
}
