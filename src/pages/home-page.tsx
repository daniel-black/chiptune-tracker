import { CreateNewSongButton } from "@/components/create-new-song-button";
import { Separator } from "@/components/ui/separator";

export function HomePage() {
  return (
    <div className="h-full">
      <div className="max-w-4xl mx-auto my-20 space-y-16">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance font-mono">
          Chiptunes
        </h1>
        <div className="space-y-4">
          <div className="flex justify-between">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight font-mono">
              Songs
            </h3>
            <CreateNewSongButton />
          </div>
          <Separator />
        </div>
      </div>
    </div>
  );
}
