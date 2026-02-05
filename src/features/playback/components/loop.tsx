import { useLoop } from "../atoms/loop";

export function Loop() {
  const [loop, setLoop] = useLoop();

  return (
    <div className="flex items-center gap-1 no-wrap">
      <input
        type="checkbox"
        checked={loop}
        onChange={() => setLoop(!loop)}
        id="loop"
      />{" "}
      <label htmlFor="loop">LOOP</label>
    </div>
  );
}
