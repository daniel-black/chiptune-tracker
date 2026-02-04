import { useAtomValue } from "jotai";
import { songAtom } from "../atoms/song";

export function SongDisplay() {
  const song = useAtomValue(songAtom);

  return (
    <div>
      <pre className="text-xs">{JSON.stringify(song, null, 2)}</pre>
    </div>
  );
}
