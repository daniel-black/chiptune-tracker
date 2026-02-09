import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  canStopPlaybackAtom,
  togglePlaybackAtom,
  stopPlaybackAtom,
} from "@/features/playback/atoms/playback";
import { loopAtom } from "@/features/playback/atoms/loop";
import { autoScrollAtom } from "@/features/playback/atoms/auto-scroll";
import { playheadAtom } from "@/features/playback/atoms/playhead";

export function Editor({ children }: { children: React.ReactNode }) {
  const togglePlayback = useSetAtom(togglePlaybackAtom);
  const stopPlayback = useSetAtom(stopPlaybackAtom);
  const [loop, setLoop] = useAtom(loopAtom);
  const scrollRef = useRef<HTMLDivElement>(null);

  useHotkeys("ctrl+Space", () => togglePlayback());
  useHotkeys("ctrl+e", () => stopPlayback());
  useHotkeys("ctrl+l", () => setLoop(!loop));

  return (
    <div ref={scrollRef} className="h-dvh min-w-fit w-fit overflow-auto">
      <table className="border-separate border-spacing-0">{children}</table>
      <UserScrollDetector scrollRef={scrollRef} />
      <PlayheadScrollTracker scrollRef={scrollRef} />
    </div>
  );
}

/**
 * Detects user-initiated scroll (wheel / touch) and disables auto-scroll
 * so the playhead doesn't hijack the viewport while the user is browsing.
 */
function UserScrollDetector({
  scrollRef,
}: {
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const canStop = useAtomValue(canStopPlaybackAtom);
  const setAutoScroll = useSetAtom(autoScrollAtom);

  const handleUserScroll = useCallback(() => {
    if (canStop) {
      setAutoScroll(false);
    }
  }, [canStop, setAutoScroll]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("wheel", handleUserScroll, { passive: true });
    el.addEventListener("touchmove", handleUserScroll, { passive: true });

    return () => {
      el.removeEventListener("wheel", handleUserScroll);
      el.removeEventListener("touchmove", handleUserScroll);
    };
  }, [scrollRef, handleUserScroll]);

  return null;
}

/**
 * Subscribes to the playhead position and scrolls the active row into view
 * when playback is running and auto-scroll is enabled.
 *
 * Instead of scrollIntoView({ block: 'nearest' }) — which only scrolls once
 * the row is flush against the viewport edge — we manually calculate scroll
 * so there's always a comfortable margin below the playhead.
 */
function PlayheadScrollTracker({
  scrollRef,
}: {
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const playhead = useAtomValue(playheadAtom);
  const canStop = useAtomValue(canStopPlaybackAtom);
  const autoScroll = useAtomValue(autoScrollAtom);

  useEffect(() => {
    if (!canStop || !autoScroll) return;

    const container = scrollRef.current;
    if (!container) return;

    const row = container.querySelector<HTMLElement>(
      `[data-row="${playhead}"]`,
    );
    if (!row) return;

    const rowRect = row.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Bottom margin: keep ~5 rows of breathing room below the playhead
    const bottomMargin = rowRect.height * 5;

    // If the row is too close to the bottom edge, scroll down
    const bottomOverflow =
      rowRect.bottom - (containerRect.bottom - bottomMargin);
    if (bottomOverflow > 0) {
      container.scrollBy({ top: bottomOverflow, behavior: "smooth" });
      return;
    }

    // If the row is above the top edge (e.g. after looping), scroll up
    const topOverflow = containerRect.top - rowRect.top;
    if (topOverflow > 0) {
      container.scrollBy({ top: -topOverflow, behavior: "smooth" });
    }
  }, [playhead, canStop, autoScroll, scrollRef]);

  return null;
}
