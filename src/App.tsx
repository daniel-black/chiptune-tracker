import { Provider as JotaiProvider } from "jotai";
import { Editor } from "./features/editor/components/editor";
import { EditorBody } from "./features/editor/components/editor-body";
import { EditorHeader } from "./features/editor/components/editor-header";
import { EditorRow } from "./features/editor/components/editor-row";
import { store } from "./store";
import { initAudioOnce, stopSubscriptions } from "./bootstrap";
import { useEffect } from "react";
import { Controls } from "./features/playback/components/controls";
import { rows } from "./audio/constants";
import { TooltipProvider } from "./components/ui/tooltip";

const rowArray = Array.from({ length: rows }, (_, i) => i);

export function App() {
  useEffect(() => {
    initAudioOnce();

    return () => {
      stopSubscriptions();
    };
  }, []);

  return (
    <JotaiProvider store={store}>
      <TooltipProvider>
        <div className="flex">
          <Editor>
            <EditorHeader />
            <EditorBody>
              {rowArray.map((rowIndex) => (
                <EditorRow rowIndex={rowIndex} key={rowIndex} />
              ))}
            </EditorBody>
          </Editor>
          <div className="px-2">
            <Controls />
          </div>
        </div>
      </TooltipProvider>
    </JotaiProvider>
  );
}
