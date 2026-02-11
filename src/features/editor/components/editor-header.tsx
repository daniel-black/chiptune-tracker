import { Volume2Icon, VolumeXIcon } from "lucide-react";
import { useChannelEnable } from "../../playback/atoms/enable";
import { Toggle } from "@/components/ui/toggle";
import { ResetRangeButton } from "./reset-range-button";
import { CHANNEL_CONFIG } from "@/audio/channel-config";

export function EditorHeader() {
  return (
    <thead className="h-10">
      <tr>
        <th className="sticky top-0 z-10 bg-background border-b h-full">
          <ResetRangeButton />
        </th>
        {CHANNEL_CONFIG.map((ch, i) => (
          <ChannelHeader key={i} name={ch.name} index={i} />
        ))}
      </tr>
    </thead>
  );
}

type ChannelHeaderProps = {
  name: string;
  index: number;
};

function ChannelHeader({ name, index }: ChannelHeaderProps) {
  const { isEnabled, toggleEnable } = useChannelEnable(index);

  return (
    <th className="sticky top-0 z-10 bg-background border-b border-x p-2">
      <div className="flex justify-center gap-3 items-center flex-nowrap">
        <h2 className="font-normal select-none font-mono">{name}</h2>
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
