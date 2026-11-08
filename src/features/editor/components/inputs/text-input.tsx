import type { ComponentPropsWithoutRef } from "react";
import {
  useSetFocusedInputType,
  type EditorInputType,
} from "../../atoms/focus";
import { useCellPosition } from "../../context/cell-context";
import {
  moveUp,
  moveDown,
  moveLeft,
  moveRight,
} from "../../utils/navigation";

interface TextInputProps extends Omit<
  ComponentPropsWithoutRef<"input">,
  "spellCheck" | "className" | "maxLength"
> {
  maxLength: number;
  editorInputType: EditorInputType;
  field: number;
}

const fieldColors: Record<NonNullable<EditorInputType>, string> = {
  note: "text-field-note font-medium",
  duty: "text-field-duty",
  volume: "text-field-volume",
  rate: "text-field-rate",
};

export function TextInput({
  maxLength,
  editorInputType,
  field,
  onFocus,
  onKeyDown,
  ...inputProps
}: TextInputProps) {
  const setFocusedInputType = useSetFocusedInputType();
  const { row, column } = useCellPosition();

  const isContinue = inputProps.value === "---" || inputProps.value === "--";

  const width = maxLength === 3 ? "w-[3.5ch]" : "w-[2.5ch]";
  const textColor = isContinue
    ? "text-field-empty"
    : editorInputType
      ? fieldColors[editorInputType]
      : "text-foreground";

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        moveUp();
        return;
      case "ArrowDown":
        e.preventDefault();
        moveDown();
        return;
      case "ArrowLeft":
        e.preventDefault();
        moveLeft();
        return;
      case "ArrowRight":
        e.preventDefault();
        moveRight();
        return;
      case "Escape":
        e.currentTarget.blur();
        return;
    }

    // Delegate to parent's onKeyDown for all other keys
    onKeyDown?.(e);
  }

  return (
    <input
      {...inputProps}
      data-row={row}
      data-col={column}
      data-field={field}
      onFocus={() => setFocusedInputType(editorInputType)}
      onKeyDown={handleKeyDown}
      className={`${width} ${textColor} h-6 text-[13px] text-center font-mono outline-none selection:bg-transparent focus:bg-primary/15 focus:ring-1 focus:ring-primary focus:text-foreground`}
      type="text"
      maxLength={maxLength}
      spellCheck={false}
    />
  );
}
