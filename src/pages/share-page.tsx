import { useImportSharedSong } from "@/atoms/song";
import { Button } from "@/components/ui/button";
import { decodeSong, type SharedSong } from "@/lib/share";
import { SongTextError } from "@/lib/song-text";
import { SongPlayer } from "@/features/share/song-player";
import type { Song } from "@/models/song";
import { WandSparklesIcon } from "lucide-react";
import { trackOnce } from "@/lib/analytics";
import { usePageMeta } from "@/lib/use-page-meta";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

/** "#v1.abc" -> "v1". Bounded so a junk link can't send a junk event. */
function shareVersion(hash: string): string {
  const match = /^#([vt]\d{1,3})\./.exec(hash);
  return match ? match[1] : "unknown";
}

/** A coarse category only; error messages could echo link contents */
function failureReason(err: unknown): string {
  if (err instanceof SongTextError) return "text-invalid";
  const message = err instanceof Error ? err.message : "";
  if (message.startsWith("Unsupported share link version")) return "version";
  if (message.includes("invalid song")) return "invalid-song";
  if (message.includes("too large")) return "too-large";
  return "corrupt";
}

/**
 * Landing page for share links (`/share#v1.…`). Lets people hear the song
 * first, with the same animated grid as the video export, and only saves a
 * copy to their songs when they choose to remix it.
 */
export function SharePage() {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const importSharedSong = useImportSharedSong();
  const [shared, setShared] = useState<SharedSong | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Line-by-line problems when a text link (e.g. from a chatbot) has mistakes
  const [problems, setProblems] = useState<string[]>([]);
  usePageMeta({ title: shared?.name || "Shared song", noindex: true });

  // StrictMode runs effects twice in dev; decode once per link
  const decodeRef = useRef<{ hash: string; song: Promise<SharedSong> } | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    if (decodeRef.current?.hash !== hash) {
      decodeRef.current = { hash, song: decodeSong(hash.slice(1)) };
    }

    decodeRef.current.song.then(
      (song) => {
        if (cancelled) return;
        trackOnce("shared-song-opened", { version: shareVersion(hash) });
        setShared(song);
      },
      (err: unknown) => {
        console.error("Failed to open share link", err);
        if (cancelled) return;
        trackOnce("share-decode-failed", { reason: failureReason(err) });
        if (err instanceof SongTextError) {
          setError("This song's text has some mistakes.");
          setProblems(err.problems);
        } else {
          setError("This share link is invalid or incomplete.");
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [hash]);

  // The player wants a full Song; the id and dates aren't used for playback
  const previewSong = useMemo<Song | null>(
    () =>
      shared
        ? { ...shared, id: "shared-preview", createdAt: "", updatedAt: "" }
        : null,
    [shared],
  );

  const remixed = useRef(false);
  function remix() {
    if (!shared || remixed.current) return;
    remixed.current = true;
    const id = importSharedSong(shared);
    trackOnce("shared-song-remixed");
    navigate(`/editor/${id}`);
  }

  if (error) {
    return (
      <div className="h-full">
        <div className="max-w-3xl mx-auto my-20 px-4 space-y-10 text-center">
          <h1 className="text-xl md:text-4xl font-extrabold tracking-tighter font-mono">
            Couldn't open shared song
          </h1>
          {problems.length > 0 ? (
            <div className="space-y-3 text-left">
              <p className="text-muted-foreground text-center">
                {error} If a chatbot wrote it, you can paste these back and
                ask it to fix them:
              </p>
              <pre className="whitespace-pre-wrap rounded-lg border bg-secondary p-4 text-xs leading-relaxed font-mono">
                {problems.join("\n")}
              </pre>
            </div>
          ) : (
            <p className="text-muted-foreground">
              {error} Make sure you copied the whole link.
            </p>
          )}
          <Link to="/">
            <Button variant="secondary">Return home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!previewSong) return null;

  return (
    <main className="min-h-full flex items-center justify-center px-4 py-8">
      {/* Sized so the square player fits on screen with its controls */}
      <div className="w-full max-w-[min(36rem,calc(100dvh-14rem))] min-w-0 space-y-5">
        <p className="text-xs font-medium text-muted-foreground">
          Someone shared a song with you
        </p>

        <SongPlayer
          song={previewSong}
          onFirstPlay={() => trackOnce("shared-song-played")}
        />

        <div className="flex flex-col gap-4 rounded-xl border bg-secondary/50 p-4 sm:flex-row sm:items-center">
          <p className="flex-1 text-sm text-muted-foreground text-pretty">
            Made with <span className="font-medium text-foreground">Chiptunes</span>
            , a free 8-bit music tracker that runs in your browser. Remix this
            song, or{" "}
            <Link to="/" className="text-foreground underline underline-offset-4">
              start your own
            </Link>
            .
          </p>
          <Button size="lg" onClick={remix} className="shrink-0">
            <WandSparklesIcon />
            Remix this song
          </Button>
        </div>
      </div>
    </main>
  );
}
