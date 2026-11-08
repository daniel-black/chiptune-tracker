import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useCreateNewSong } from "@/atoms/song";
import { PlusIcon } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";

export function CreateNewSongButton() {
  const navigate = useNavigate();
  const createSong = useCreateNewSong();

  useHotkeys("ctrl+n", handleCreateNewSong);

  function handleCreateNewSong() {
    const uuid = crypto.randomUUID();
    createSong(uuid); // persists via atomWithStorage
    navigate(`/editor/${uuid}`); // go to editor
  }

  return (
    <Button size="lg" onClick={handleCreateNewSong}>
      <PlusIcon />
      New song
    </Button>
  );
}
