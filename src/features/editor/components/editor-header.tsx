import { Volume2Icon, VolumeXIcon } from "lucide-react";
import { useChannelEnable } from "../../playback/atoms/enable";
import { Toggle } from "@/components/ui/toggle";
import { ResetRangeButton } from "./reset-range-button";
import { CHANNEL_CONFIG } from "@/audio/channel-config";

export function EditorHeader() {
  return (
    <thead className="h-10">
      <tr>
        <th className="sticky top-0 left-0 z-20 bg-background border-b border-r h-full w-px">
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
    <th className="sticky top-0 z-10 bg-background border-b border-r px-3">
      <div className="flex justify-between gap-3 items-center flex-nowrap">
        <h2
          className={`text-xs font-medium select-none ${
            isEnabled ? "text-foreground/90" : "text-muted-foreground/60 line-through"
          }`}
        >
          {name}
        </h2>
        <Toggle
          size="sm"
          pressed={!isEnabled}
          onClick={toggleEnable}
          aria-label={isEnabled ? `Mute ${name}` : `Unmute ${name}`}
          className="text-muted-foreground data-[state=on]:text-destructive data-[state=on]:bg-destructive/10"
        >
          {isEnabled ? (
            <Volume2Icon className="size-3.5" />
          ) : (
            <VolumeXIcon className="size-3.5" />
          )}
        </Toggle>
      </div>
    </th>
  );
}
