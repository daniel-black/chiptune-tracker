import { Editor } from "./components/editor/editor";
import { EditorBody } from "./components/editor/editor-body";
import { EditorHeader } from "./components/editor/editor-header";
import { EditorRow } from "./components/editor/editor-row";
import { SongDisplay } from "./components/song-display";

const rows = Array.from({ length: 32 }, (_, i) => i);

export function App() {
  return (
    <div className="flex">
      <Editor>
        <EditorHeader />
        <EditorBody>
          {rows.map((rowIndex) => (
            <EditorRow rowIndex={rowIndex} key={rowIndex} />
          ))}
        </EditorBody>
      </Editor>
      <div>
        <SongDisplay />
      </div>
    </div>
  );
}
