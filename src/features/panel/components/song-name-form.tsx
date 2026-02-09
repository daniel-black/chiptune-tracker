import { useSongName } from "@/atoms/song";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SongNameForm() {
  const [name, setName] = useSongName();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }

  return (
    <div className="p-4 space-y-1 block">
      <Label htmlFor="song-name" className="text-lg font-semibold font-mono">
        Song name
      </Label>
      <Input
        autoFocus
        value={name}
        onChange={handleChange}
        id="song-name"
        name="song-name"
        maxLength={300}
        spellCheck={false}
      />
    </div>
  );
}
