import type { ComponentPropsWithoutRef } from "react";
import {
  useSetFocusedInputType,
  type EditorInputType,
} from "../../atoms/focus";

interface TextInputProps extends Omit<
  ComponentPropsWithoutRef<"input">,
  "spellCheck" | "className" | "maxLength"
> {
  maxLength: number;
  editorInputType: EditorInputType;
}

export function TextInput({
  maxLength,
  editorInputType,
  onFocus,
  ...inputProps
}: TextInputProps) {
  const setFocusedInputType = useSetFocusedInputType();

  const isContinue = inputProps.value === "---" || inputProps.value === "--";

  const width = maxLength === 3 ? "w-8" : "w-6";
  const textColor = isContinue ? "text-foreground/40" : "text-foreground";

  return (
    <input
      {...inputProps}
      onFocus={() => setFocusedInputType(editorInputType)}
      className={`${width} ${textColor} text-sm text-center font-mono outline-none selection:bg-transparent focus:ring-2 focus:ring-primary`}
      type="text"
      maxLength={maxLength}
      spellCheck={false}
    />
  );
}
