type EditorCellProps = {
  rowIndex: number;
  columnIndex: number;
};

export function EditorCell({ rowIndex, columnIndex }: EditorCellProps) {
  return (
    <td className="border w-40">
      row {rowIndex}, col {columnIndex}
    </td>
  );
}
