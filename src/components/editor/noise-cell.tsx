import { useNoiseCell } from "../../atoms/cell";
import { VolumeInput } from "./inputs/volume-input";

type NoiseCellProps = {
  rowIndex: number;
  columnIndex: number;
};

export function NoiseCell({ rowIndex, columnIndex }: NoiseCellProps) {
  const { noiseCell, setRate, setVolume } = useNoiseCell(rowIndex, columnIndex);

  return (
    <>
      <div>rate</div>
      <VolumeInput volume={noiseCell.volume} setVolume={setVolume} />
    </>
  );
}
