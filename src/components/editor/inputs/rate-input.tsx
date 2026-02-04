import { useState } from "react";
import type { NoiseCell } from "../../../types";

type RateInputProps = {
  rate: NoiseCell["rate"];
  setRate: (rate: NoiseCell["rate"]) => void;
};

export function RateInput({ rate, setRate }: RateInputProps) {
  const [localRate, setLocalRate] = useState<string>(rate);

  function handleLocalRateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.trim();
    setLocalRate(value);

    if (value.length === 2) {
      setRate(value);
    }
  }

  return (
    <input
      type="text"
      value={localRate}
      onChange={handleLocalRateChange}
      className="w-6 text-sm text-center font-mono"
      maxLength={2}
      spellCheck={false}
    />
  );
}
