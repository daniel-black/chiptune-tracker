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

  const width = maxLength === 3 ? "w-8" : "w-6";
  const textColor = isContinue ? "text-foreground/40" : "text-foreground";

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
      className={`${width} ${textColor} text-sm text-center font-mono outline-none selection:bg-transparent focus:ring-2 focus:ring-primary`}
      type="text"
      maxLength={maxLength}
      spellCheck={false}
    />
  );
}
