import { rows } from "@/audio/constants";
import { initAudioOnce, stopSubscriptions } from "@/bootstrap";
import { Editor } from "@/features/editor/components/editor";
import { EditorBody } from "@/features/editor/components/editor-body";
import { EditorHeader } from "@/features/editor/components/editor-header";
import { EditorRow } from "@/features/editor/components/editor-row";
import { InputExplanation } from "@/features/panel/components/input-explanation";
import { Panel } from "@/features/panel/components/panel";
import { PanelControls } from "@/features/panel/components/panel-controls";
import { SongNameForm } from "@/features/panel/components/song-name-form";
import { useEffect } from "react";
import { useParams } from "react-router";

const rowArray = Array.from({ length: rows }, (_, i) => i);

export function TrackerPage() {
  const params = useParams<{ id: string }>();
  const songId = params.id;

  useEffect(() => {
    initAudioOnce();

    return () => {
      stopSubscriptions();
    };
  }, []);

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
        <InputExplanation />
      </Panel>
    </div>
  );
}
