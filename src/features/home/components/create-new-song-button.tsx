import { useNavigate } from "react-router";
import { Button } from "../../../components/ui/button";
import { useCreateNewSong } from "@/atoms/library";

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
      className="p-5 text-xl font-mono tracking-tight font-semibold"
      onClick={handleCreateNewSong}
    >
      CREATE NEW
    </Button>
  );
}
