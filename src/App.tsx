import { Editor } from "./features/editor/components/editor";
import { EditorBody } from "./features/editor/components/editor-body";
import { EditorHeader } from "./features/editor/components/editor-header";
import { EditorRow } from "./features/editor/components/editor-row";
import { initAudioOnce, stopSubscriptions } from "./bootstrap";
import { useEffect } from "react";
import { rows } from "./audio/constants";
import { TooltipProvider } from "./components/ui/tooltip";
import { InputExplanation } from "./features/panel/components/input-explanation";
import { SongNameForm } from "./features/panel/components/song-name-form";
import { Panel } from "./features/panel/components/panel";
import { PanelControls } from "./features/panel/components/panel-controls";

const rowArray = Array.from({ length: rows }, (_, i) => i);

export function App() {
  useEffect(() => {
    initAudioOnce();

    return () => {
      stopSubscriptions();
    };
  }, []);

  return (
    <TooltipProvider>
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
    </TooltipProvider>
  );
}
