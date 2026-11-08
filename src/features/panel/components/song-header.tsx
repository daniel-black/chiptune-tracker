import { useState } from "react";
import { PencilIcon } from "lucide-react";
import { useSongName } from "@/atoms/song";
import { useIsDesktop } from "@/lib/use-media-query";
import { ShareButton } from "./share-button";

/**
 * The song's title, editable in place, with song-level actions beside it.
 * Matches the grid header's height so the borders line up across the screen.
 */
export function SongHeader({ children }: { children?: React.ReactNode }) {
  const [name, setName] = useSongName();
  const isDesktop = useIsDesktop();
  // Only grab focus for a brand-new song, so naming it is the first step.
  // Otherwise keyboard shortcuts (Space to play) should work straight away.
  const [autoFocus] = useState(() => isDesktop && name === "");

  return (
    <div className="h-10 shrink-0 border-b flex items-center gap-2 pl-2 pr-3 sm:pr-4 bg-background">
      <label className="group relative flex-1 min-w-0 flex items-center">
        <span className="sr-only">Song name</span>
        <input
          autoFocus={autoFocus}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur();
          }}
          maxLength={300}
          spellCheck={false}
          placeholder="Untitled song"
          className="w-full min-w-0 truncate rounded-md bg-transparent px-2 py-1 pr-7 text-sm font-semibold tracking-tight outline-none placeholder:text-muted-foreground/70 hover:bg-muted/60 focus:bg-muted focus:ring-1 focus:ring-ring"
        />
        <PencilIcon
          aria-hidden
          className="pointer-events-none absolute right-2 size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-0"
        />
      </label>
      <ShareButton />
      {children}
    </div>
  );
}
