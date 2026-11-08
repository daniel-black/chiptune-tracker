import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useCreateNewSong } from "@/atoms/song";
import { PlusIcon } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="lg" onClick={handleCreateNewSong}>
          <PlusIcon />
          New song
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <Kbd>Ctrl</Kbd> + <Kbd>N</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}
