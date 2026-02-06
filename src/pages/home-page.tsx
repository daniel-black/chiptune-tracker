import { songIndexAtom } from "@/atoms/library";
import { CreateNewSongButton } from "@/features/home/components/create-new-song-button";
import { Separator } from "@/components/ui/separator";
import { useAtomValue } from "jotai";
import { SongListItem } from "@/features/home/components/song-list-item";

export function HomePage() {
  const songIds = useAtomValue(songIndexAtom);

  return (
    <div className="h-full">
      <div className="max-w-3xl mx-auto my-20 space-y-16">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance font-mono">
          Chiptunes
        </h1>
        <div className="space-y-6">
          <div className="flex justify-between">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight font-mono">
              Songs
            </h3>
            <CreateNewSongButton />
          </div>
          <Separator />
          {songIds.length === 0 ? (
            <p className="text-muted-foreground font-mono text-sm py-4">
              No songs yet. Create one to get started.
            </p>
          ) : (
            <ul className="space-y-4">
              {songIds.map((id) => (
                <SongListItem key={id} uuid={id} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
