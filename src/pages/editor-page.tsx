import { rows } from "@/audio/constants";
import {
  songIndexAtom,
  useCurrentSongId,
  useSetCurrentSongIdAtom,
} from "@/atoms/song";
import { initAudioOnce, stopSubscriptions } from "@/bootstrap";
import { Editor } from "@/features/editor/components/editor";
import { EditorBody } from "@/features/editor/components/editor-body";
import { EditorHeader } from "@/features/editor/components/editor-header";
import { EditorRow } from "@/features/editor/components/editor-row";
import { InputExplanation } from "@/features/panel/components/input-explanation";
import { Panel } from "@/features/panel/components/panel";
import { PanelControls } from "@/features/panel/components/panel-controls";
import { PatternSequence } from "@/features/panel/components/pattern-sequence";
import { PatternLibrary } from "@/features/panel/components/pattern-library";
import { SongNameForm } from "@/features/panel/components/song-name-form";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { Navigate, useParams } from "react-router";
import { NotFoundPage } from "./not-found-page";

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

  // Point the editor's songAtom at the persisted song for this route.
  useEffect(() => {
    if (songId && songExists) {
      setCurrentSongId(songId);
    }

    return () => {
      setCurrentSongId(null);
    };
  }, [songId, songExists, setCurrentSongId]);

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

  return (
    <div className="flex">
      <Editor>
        <EditorHeader />
        <EditorBody>
          {rowArray.map((i) => (
            <EditorRow rowIndex={i} key={i} />
          ))}
        </EditorBody>
      </Editor>
      <Panel>
        <PanelControls />
        <SongNameForm />
        <div className="flex">
          <div className="flex-1">
            <PatternLibrary />
          </div>
          <div className="flex-1">
            <PatternSequence />
          </div>
        </div>
        <InputExplanation />
      </Panel>
    </div>
  );
}
