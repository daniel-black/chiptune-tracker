import { useNavigate } from "react-router";
import { Button } from "../../../components/ui/button";
import { useCreateNewSong } from "@/atoms/library";
import { PlusIcon } from "lucide-react";

export function CreateNewSongButton() {
  const navigate = useNavigate();
  const createSong = useCreateNewSong();

  const handleCreateNewSong = () => {
    const uuid = crypto.randomUUID();
    createSong(uuid); // persists via atomWithStorage
    navigate(`/editor/${uuid}`); // go to editor
  };

  return (
    <Button
      className="p-5 text-xl font-mono tracking-tight font-semibold flex items-center gap-2.5"
      onClick={handleCreateNewSong}
    >
      <span>NEW</span>
      <PlusIcon className="size-4" strokeWidth={4} />
    </Button>
  );
}
