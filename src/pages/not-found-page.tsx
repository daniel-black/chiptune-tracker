import { useCreateNewSong } from "@/atoms/song";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";

export function NotFoundPage() {
  const navigate = useNavigate();
  const createSong = useCreateNewSong();

  const handleCreateNewSong = () => {
    const uuid = crypto.randomUUID();
    createSong(uuid); // persists via atomWithStorage
    navigate(`/editor/${uuid}`); // go to editor
  };

  return (
    <div className="h-full">
      <div className="max-w-3xl mx-auto my-20 space-y-10 md:space-y-16">
        <h1 className="scroll-m-20 text-center text-6xl md:text-9xl font-extrabold tracking-tighter text-balance font-mono italic ">
          404
        </h1>
        <h1 className="scroll-m-20 text-center text-xl md:text-4xl font-extrabold tracking-tighter text-balance font-mono">
          Uh oh, page not found :(
        </h1>
        <div className="flex justify-center gap-2 items-center flex-col md:flex-row">
          <Link to="/">
            <Button
              className="p-5 text-lg md:text-xl font-mono tracking-tight font-semibold"
              variant="secondary"
            >
              Return home
            </Button>
          </Link>

          <Button
            className="p-5 text-lg md:text-xl font-mono tracking-tight font-semibold"
            onClick={handleCreateNewSong}
          >
            Create new song
          </Button>
        </div>
      </div>
    </div>
  );
}
