import { useState } from "react";
import type { Rate } from "@/audio/characteristics/rate";
import { TextInput } from "./text-input";
import { padNumberTwoDigit } from "@/utils/format";
import type { NoiseCell } from "@/models/noise-cell";

function isRateDigits(value: string) {
  return /^\d{1,2}$/.test(value);
}

type RateInputProps = {
  rate: NoiseCell["rate"];
  setRate: (rate: NoiseCell["rate"]) => void;
};

export function RateInput({ rate, setRate }: RateInputProps) {
  const [localRate, setLocalRate] = useState<string>(rate);
  const [prevRate, setPrevRate] = useState(rate);
  if (prevRate !== rate) {
    setPrevRate(rate);
    // Typing "3" saves "03" right away; keep the typed "3" so a second digit
    // can follow. Only replace the text when the rate changed from elsewhere
    // (undo, switching patterns).
    const typedRate = isRateDigits(localRate)
      ? padNumberTwoDigit(Number(localRate))
      : localRate;
    if (typedRate !== rate) setLocalRate(rate);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "-") {
      setRate("--");
      setLocalRate("--");
      return;
    }

    if (localRate === "--" && e.key === "Backspace") {
      setLocalRate(""); // clear the whole input
      return;
    }

    // Typing over a complete value ("--" or "05") starts a new one, like the
    // note and duty fields. Clearing first gets past the 2-character limit.
    if (localRate.length === 2 && /^\d$/.test(e.key)) {
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

    // Only whole numbers 0-99 ("1", "05", "99"); rejects "." / "-" / "e" etc.
    if (!isRateDigits(value)) {
      return;
    }

    const paddedRate = padNumberTwoDigit(Number(value)) as Rate;
    if (paddedRate !== rate) {
      setRate(paddedRate);
    }
    setLocalRate(value);
  }

  function handleBlur() {
    // An emptied or otherwise invalid input means "no rate", not "00"
    const nextRate: NoiseCell["rate"] = isRateDigits(localRate)
      ? (padNumberTwoDigit(Number(localRate)) as Rate)
      : "--";

    if (nextRate !== rate) {
      setRate(nextRate);
    }
    setLocalRate(nextRate);
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
