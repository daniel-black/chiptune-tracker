import { rows } from "@/audio/constants";
import {
  songIndexAtom,
  useCurrentSongId,
  useSetCurrentSongIdAtom,
  useSongName,
} from "@/atoms/song";
import { usePageMeta } from "@/lib/use-page-meta";
import { useResetSongHistory } from "@/atoms/song-history";
import { initAudioOnce, stopSubscriptions } from "@/bootstrap";
import { Editor } from "@/features/editor/components/editor";
import { EditorBody } from "@/features/editor/components/editor-body";
import { EditorHeader } from "@/features/editor/components/editor-header";
import { EditorRow } from "@/features/editor/components/editor-row";
import { Arrangement } from "@/features/panel/components/arrangement";
import { FieldHint } from "@/features/panel/components/field-guide";
import { Panel } from "@/features/panel/components/panel";
import { PanelControls } from "@/features/panel/components/panel-controls";
import { PatternLibrary } from "@/features/panel/components/pattern-library";
import { SongHeader } from "@/features/panel/components/song-header";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { Navigate, useParams } from "react-router";
import { NotFoundPage } from "./not-found-page";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsDesktop } from "@/lib/use-media-query";
import { PanelRightIcon } from "lucide-react";

const rowArray = Array.from({ length: rows }, (_, i) => i);

export function EditorPage() {
  const params = useParams<{ id: string }>();
  const songId = params.id;
  const songIndex = useAtomValue(songIndexAtom);
  // Unknown ids (deleted songs, typos) must not open an editor: songAtomFamily
  // would create a default song and persist it without adding it to the index.
  const songExists = !!songId && songIndex.includes(songId);

  const currentSongId = useCurrentSongId();
  const setCurrentSongId = useSetCurrentSongIdAtom();
  const resetSongHistory = useResetSongHistory();
  const isDesktop = useIsDesktop();
  const [songName] = useSongName();
  usePageMeta({
    title: songExists ? songName || "Untitled song" : undefined,
    noindex: true,
  });

  // Point the editor's songAtom at the persisted song for this route.
  useEffect(() => {
    if (songId && songExists) {
      setCurrentSongId(songId);
      // Undo must never cross songs
      resetSongHistory();
    }

    return () => {
      setCurrentSongId(null);
    };
  }, [songId, songExists, setCurrentSongId, resetSongHistory]);

  useEffect(() => {
    initAudioOnce();

    return () => {
      stopSubscriptions();
    };
  }, []);

  if (!songId) return <Navigate to="/" replace />;
  if (!songExists) return <NotFoundPage />;

  // Don't render the editor until currentSongIdAtom matches the URL param.
  // The effect above runs after the first render, so without this guard the
  // editor would briefly mount with songAtom pointing at a blank default song.
  if (currentSongId !== songId) return null;

  const grid = (
    <Editor>
      <EditorHeader />
      <EditorBody>
        {rowArray.map((i) => (
          <EditorRow rowIndex={i} key={i} />
        ))}
      </EditorBody>
    </Editor>
  );

  // Controls are rendered in exactly one place (they register hotkeys), so pick
  // the layout in JS rather than hiding a duplicate with CSS.
  if (isDesktop) {
    return (
      <div className="flex h-dvh">
        {grid}
        <Panel>
          <SongHeader />
          <PanelControls />
          <div className="flex-1 min-h-0 overflow-y-auto divide-y">
            <Arrangement />
            <PatternLibrary />
          </div>
          <FieldHint />
        </Panel>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh">
      <SongHeader>
        <MobilePanelSheet />
      </SongHeader>
      <PanelControls />
      {grid}
    </div>
  );
}

function MobilePanelSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Arrangement and patterns">
          <PanelRightIcon />
        </Button>
      </SheetTrigger>
      <SheetContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[min(24rem,90vw)] max-w-none p-0 gap-0 overflow-y-auto @container">
        <SheetTitle className="px-4 pt-4 text-sm font-semibold">
          Arrangement and patterns
        </SheetTitle>
        <div className="divide-y">
          <Arrangement />
          <PatternLibrary />
        </div>
      </SheetContent>
    </Sheet>
  );
}
