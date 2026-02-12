import { rows } from "@/audio/constants";
import { useCurrentSongId, useSetCurrentSongIdAtom } from "@/atoms/song";
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
import { useEffect } from "react";
import { Navigate, useParams } from "react-router";

const rowArray = Array.from({ length: rows }, (_, i) => i);

export function EditorPage() {
  const params = useParams<{ id: string }>();
  const songId = params.id;

  const currentSongId = useCurrentSongId();
  const setCurrentSongId = useSetCurrentSongIdAtom();

  // Point the editor's songAtom at the persisted song for this route.
  useEffect(() => {
    if (songId) {
      setCurrentSongId(songId);
    }

    return () => {
      setCurrentSongId(null);
    };
  }, [songId, setCurrentSongId]);

  useEffect(() => {
    initAudioOnce();

    return () => {
      stopSubscriptions();
    };
  }, []);

  if (!songId) return <Navigate to="/" replace />;

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
