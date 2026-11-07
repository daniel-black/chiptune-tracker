import { useImportSharedSong } from "@/atoms/song";
import { Button } from "@/components/ui/button";
import { decodeSong } from "@/lib/share";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

/**
 * Landing page for share links (`/share#v1.…`). Decodes the song from the
 * hash, saves it as a new local song, and opens it in the editor.
 */
export function SharePage() {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const importSharedSong = useImportSharedSong();
  const [error, setError] = useState<string | null>(null);

  // StrictMode runs effects twice in dev; share one import between the runs
  // so a link doesn't create two copies of the song.
  const importRef = useRef<{ hash: string; id: Promise<string> } | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (importRef.current?.hash !== hash) {
      importRef.current = {
        hash,
        id: decodeSong(hash.slice(1)).then(importSharedSong),
      };
    }

    importRef.current.id.then(
      (id) => {
        if (!cancelled) navigate(`/editor/${id}`, { replace: true });
      },
      (err: unknown) => {
        console.error("Failed to open share link", err);
        if (!cancelled) setError("This share link is invalid or incomplete.");
      },
    );

    return () => {
      cancelled = true;
    };
  }, [hash, importSharedSong, navigate]);

  if (!error) return null;

  return (
    <div className="h-full">
      <div className="max-w-3xl mx-auto my-20 space-y-10 text-center">
        <h1 className="text-xl md:text-4xl font-extrabold tracking-tighter font-mono">
          Couldn't open shared song
        </h1>
        <p className="text-muted-foreground">
          {error} Make sure you copied the whole link.
        </p>
        <Link to="/">
          <Button variant="secondary">Return home</Button>
        </Link>
      </div>
    </div>
  );
}
