import { songAtomFamily } from "@/atoms/library";
import { useAtomValue } from "jotai";
import { Link } from "react-router";

export function SongListItem({ uuid }: { uuid: string }) {
  const song = useAtomValue(songAtomFamily(uuid));

  return (
    <li>
      <Link
        to={`/editor/${uuid}`}
        className="flex items-center justify-between rounded-md border px-4 py-3 font-mono transition-colors hover:bg-accent"
      >
        <span className="font-semibold truncate">
          {song.name || "Untitled"}
        </span>
        <span className="text-muted-foreground text-xs shrink-0 ml-4">
          {new Date(song.updatedAt).toLocaleDateString()}
        </span>
      </Link>
    </li>
  );
}
