import { songIndexAtom } from "@/atoms/song";
import { CreateNewSongButton } from "@/features/home/components/create-new-song-button";
import { Separator } from "@/components/ui/separator";
import { useAtomValue } from "jotai";
import { SongListItem } from "@/features/home/components/song-list-item";
import { RestoreDemoButton } from "@/features/home/components/restore-demo-button";

export function HomePage() {
  const songIds = useAtomValue(songIndexAtom);

  return (
    <div className="h-full">
      <div className="max-w-3xl px-4 md:px-0 mx-auto my-20 space-y-16">
        <header className="space-y-3">
          <h1 className="scroll-m-20 text-2xl md:text-4xl font-extrabold tracking-tight text-balance font-mono">
            Chiptunes
          </h1>
          <p className="max-w-xl text-muted-foreground text-pretty">
            A chiptune tracker that runs in your browser. Write 8-bit music on
            three pulse channels and a noise channel, arrange patterns into
            songs, and share them with a link. Free, with no sign-up.
          </p>
        </header>
        <div className="space-y-6">
          <div className="flex justify-between">
            <h3 className="scroll-m-20 text-lg md:text-2xl font-semibold tracking-tight font-mono">
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
          <div className="flex justify-end">
            <RestoreDemoButton />
          </div>
        </div>
      </div>
    </div>
  );
}
