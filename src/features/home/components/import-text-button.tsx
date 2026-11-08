import { useState } from "react";
import { useNavigate } from "react-router";
import { FileTextIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { track } from "@/lib/analytics";
import { encodeSong } from "@/lib/share";
import { SongTextError, songFromText } from "@/lib/song-text";

const PLACEHOLDER = `chiptunes 1
title: My song
bpm: 120

pattern Intro
00  C-4 50 08 | .         | C-2 50 08 | 05 08
04  E-4 -- -- | .         | .         | 30 06
08  G-4 -- -- | .         | G-2 -- -- | 05 08

order: Intro`;

/**
 * Paste a song written in the text format (by hand, or by a chatbot that has
 * read /llms.txt). It opens on the share page so it can be heard first, with
 * the same "Remix this song" button to save it.
 */
export function ImportTextButton() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [problems, setProblems] = useState<string[]>([]);

  async function handleImport() {
    try {
      const shared = songFromText(text);
      const hash = await encodeSong({
        ...shared,
        id: "",
        createdAt: "",
        updatedAt: "",
      });
      track("song-imported", { via: "text" });
      setOpen(false);
      navigate(`/share#${hash}`);
    } catch (err) {
      if (err instanceof SongTextError) {
        setProblems(err.problems);
        track("song-import-failed", { via: "text" });
      } else {
        console.error("Couldn't import song text", err);
        setProblems(["Something went wrong reading that text."]);
      }
    }
  }

  return (
    <>
      <Button size="lg" variant="outline" onClick={() => setOpen(true)}>
        <FileTextIcon />
        Import from text
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setProblems([]);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import a song from text</DialogTitle>
            <DialogDescription>
              Paste a song in the Chiptunes text format. To have a chatbot write
              one, ask it to read{" "}
              <a
                href="/llms.txt"
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline underline-offset-4"
              >
                chiptunes.studio/llms.txt
              </a>{" "}
              first.
            </DialogDescription>
          </DialogHeader>

          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (problems.length) setProblems([]);
            }}
            placeholder={PLACEHOLDER}
            spellCheck={false}
            aria-label="Song text"
            aria-invalid={problems.length > 0}
            className="h-72 w-full resize-y rounded-md border bg-secondary p-3 font-mono text-xs leading-relaxed outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring aria-invalid:border-destructive"
          />

          {problems.length > 0 && (
            <pre
              role="alert"
              className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-md border border-destructive/40 bg-destructive/10 p-3 font-mono text-xs leading-relaxed text-destructive"
            >
              {problems.join("\n")}
            </pre>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!text.trim()}>
              Open song
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
