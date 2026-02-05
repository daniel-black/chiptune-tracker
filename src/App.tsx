import { Provider } from "jotai";
import { Editor } from "./features/editor/components/editor";
import { EditorBody } from "./features/editor/components/editor-body";
import { EditorHeader } from "./features/editor/components/editor-header";
import { EditorRow } from "./features/editor/components/editor-row";
import { store } from "./store";
import { initAudioOnce } from "./bootstrap-audio";
import { useEffect } from "react";
import { Controls } from "./features/playback/components/controls";

const rows = Array.from({ length: 64 }, (_, i) => i);

export function App() {
  useEffect(() => {
    initAudioOnce();
  }, []);

  return (
    <Provider store={store}>
      <div className="flex">
        <Editor>
          <EditorHeader />
          <EditorBody>
            {rows.map((rowIndex) => (
              <EditorRow rowIndex={rowIndex} key={rowIndex} />
            ))}
          </EditorBody>
        </Editor>
        <div className="px-2">
          <Controls />
        </div>
      </div>
    </Provider>
  );
}
