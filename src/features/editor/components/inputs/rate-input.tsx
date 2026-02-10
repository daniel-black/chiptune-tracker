import { useState } from "react";
import type { Rate } from "@/audio/characteristics/rate";
import { TextInput } from "./text-input";
import { padNumberTwoDigit } from "@/utils/format";
import type { NoiseCell } from "@/models/noise-cell";

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

    const paddedRate = padNumberTwoDigit(rateNum);
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
    const paddedRate = padNumberTwoDigit(rateNum);
    setRate(paddedRate as Rate);
    setLocalRate(paddedRate);
  }

  return (
    <TextInput
      editorInputType="rate"
      field={0}
      value={localRate}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onBlur={handleBlur}
      maxLength={2}
    />
  );
}
