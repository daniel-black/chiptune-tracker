import { Volume2Icon, VolumeXIcon } from "lucide-react";
import {
  useChannelEnable,
  type ChannelIndex,
} from "../../playback/atoms/enable";
import { Toggle } from "@/components/ui/toggle";
import { ResetRangeButton } from "./reset-range-button";

export function EditorHeader() {
  return (
    <thead className="h-10">
      <tr>
        <th className="sticky top-0 z-10 bg-background border h-full">
          <ResetRangeButton />
        </th>
        <ChannelHeader name="Channel 1" index={0} />
        <ChannelHeader name="Channel 2" index={1} />
        <ChannelHeader name="Channel 3" index={2} />
        <ChannelHeader name="Noise" index={3} />
      </tr>
    </thead>
  );
}

type ChannelHeaderProps = {
  name: string;
  index: ChannelIndex;
};

function ChannelHeader({ name, index }: ChannelHeaderProps) {
  const { isEnabled, toggleEnable } = useChannelEnable(index);

  return (
    <th className="sticky top-0 z-10 bg-background border p-2">
      <div className="flex justify-center gap-3 items-center flex-nowrap">
        <h2 className="font-semibold select-none">{name}</h2>
        <Toggle variant="outline" onClick={toggleEnable} size="sm">
          {isEnabled ? (
            <Volume2Icon className="size-4" />
          ) : (
            <VolumeXIcon className="size-4" />
          )}
        </Toggle>
      </div>
    </th>
  );
}
