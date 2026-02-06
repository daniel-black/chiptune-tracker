import { songAtomFamily, useDeleteSong } from "@/atoms/library";
import { Button } from "@/components/ui/button";
import { useAtomValue } from "jotai";
import { Link } from "react-router";

export function SongListItem({ uuid }: { uuid: string }) {
  const song = useAtomValue(songAtomFamily(uuid));
  const deleteSong = useDeleteSong();

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault(); // don't follow the link
    deleteSong(uuid);
  }

  return (
    <li>
      <Link
        to={`/editor/${uuid}`}
        className="flex items-center justify-between rounded-md border px-4 py-3 font-mono transition-colors hover:bg-accent"
      >
        <span className="font-semibold truncate">
          {song.name || "Untitled"}
        </span>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className="text-muted-foreground text-xs">
            {new Date(song.updatedAt).toLocaleDateString()}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive h-auto px-2 py-1 text-xs"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </Link>
    </li>
  );
}
