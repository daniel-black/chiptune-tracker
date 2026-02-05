import { usePulseCell } from "../atoms/cell";
import { DutyInput } from "./inputs/duty-input";
import { NoteInput } from "./inputs/note-input";
import { VolumeInput } from "./inputs/volume-input";

type PulseCellProps = {
  rowIndex: number;
  columnIndex: number;
};

export function PulseCell({ rowIndex, columnIndex }: PulseCellProps) {
  const { pulseCell, setNote, setDuty, setVolume } = usePulseCell(
    rowIndex,
    columnIndex,
  );

  return (
    <>
      <NoteInput note={pulseCell.note} setNote={setNote} />
      <DutyInput duty={pulseCell.duty} setDuty={setDuty} />
      <VolumeInput volume={pulseCell.volume} setVolume={setVolume} />
    </>
  );
}
