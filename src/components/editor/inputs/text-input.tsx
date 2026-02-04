import type { ComponentPropsWithoutRef } from "react";

interface TextInputProps extends Omit<
  ComponentPropsWithoutRef<"input">,
  "spellCheck" | "className" | "maxLength"
> {
  maxLength: number;
}

// For consistent input styling within the editor grid
export function TextInput(props: TextInputProps) {
  let width = "w-6";

  if (props.maxLength === 3) {
    width = "w-8";
  }

  return (
    <input
      {...props}
      className={`${width} text-sm text-center font-mono outline-none rounded-xs selection:bg-red-300 focus:ring-2 focus:ring-orange-400`}
      type="text"
      spellCheck={false}
    />
  );
}
