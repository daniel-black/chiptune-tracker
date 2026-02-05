import { Volume2Icon, VolumeXIcon } from "lucide-react";
import { useChannelMute, type ChannelIndex } from "../../playback/atoms/mute";

export function EditorHeader() {
  return (
    <thead className="h-10">
      <tr>
        <th className="sticky top-0 z-10 bg-gray-100 border"></th>
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
  const { isMuted, toggleMute } = useChannelMute(index);

  return (
    <th className="sticky top-0 z-10 bg-gray-100 border p-2">
      <div className="flex justify-center gap-2 items-center flex-nowrap">
        <h2 className="font-semibold select-none">{name}</h2>
        <button
          onClick={toggleMute}
          className="rounded-lg p-1.5 hover:cursor-pointer hover:bg-gray-300"
        >
          {isMuted ? (
            <VolumeXIcon className="size-4" />
          ) : (
            <Volume2Icon className="size-4" />
          )}
        </button>
      </div>
    </th>
  );
}
