import { useState } from "react";
import type { NoiseCell } from "../../../types";
import type { Rate } from "../../../audio/rate";
import { TextInput } from "./text-input";

type RateInputProps = {
  rate: NoiseCell["rate"];
  setRate: (rate: NoiseCell["rate"]) => void;
};

export function RateInput({ rate, setRate }: RateInputProps) {
  const [localRate, setLocalRate] = useState<string>(rate);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "-") {
      setRate("--");
      setLocalRate("--");
      return;
    }

    if (localRate === "--" && (e.key === "Backspace" || /\d/.test(e.key))) {
      // clear the whole input
      setLocalRate("");
      return;
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.trim();
    if (value === "") {
      setLocalRate("");
      return;
    }

    const rateNum = Number(value);

    if (isNaN(rateNum) || rateNum < 0 || rateNum > 99) {
      return;
    }

    const paddedRate = padNumber(rateNum);
    setRate(paddedRate as Rate);
    setLocalRate(value);
  }

  function handleBlur() {
    const rateNum = Number(localRate);

    if (isNaN(rateNum)) {
      if (rate !== "--") {
        setRate("--");
      }
      setLocalRate("--");
      return;
    }

    // If rate num is out of range
    if (rateNum < 0 || rateNum > 99) {
      if (rate !== "--") {
        setRate("--");
      }
      setLocalRate("--");
      return;
    }

    // rate is in range
    const paddedRate = padNumber(rateNum);
    setRate(paddedRate as Rate);
    setLocalRate(paddedRate);
  }

  return (
    <TextInput
      value={localRate}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onBlur={handleBlur}
      maxLength={2}
    />
    // <input
    //   type="text"
    //   value={localRate}
    //   onKeyDown={handleKeyDown}
    //   onChange={handleChange}
    //   onBlur={handleBlur}
    //   className="w-6 text-sm text-center font-mono"
    //   maxLength={2}
    //   spellCheck={false}
    // />
  );
}

function padNumber(num: number): string {
  if (num < 10) return `0${num}`;
  return num.toString();
}
