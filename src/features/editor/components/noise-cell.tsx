import { useNoiseCell } from "../atoms/cell";
import { RateInput } from "./inputs/rate-input";
import { VolumeInput } from "./inputs/volume-input";

type NoiseCellProps = {
  rowIndex: number;
  columnIndex: number;
};

export function NoiseCell({ rowIndex, columnIndex }: NoiseCellProps) {
  const { noiseCell, setRate, setVolume } = useNoiseCell(rowIndex, columnIndex);

  return (
    <>
      <RateInput rate={noiseCell.rate} setRate={setRate} />
      <VolumeInput volume={noiseCell.volume} setVolume={setVolume} field={1} />
    </>
  );
}
