import { useEffect, useRef } from "react";
import { useAtomValue } from "jotai";
import { playbackClock } from "@/audio/playback-clock";
import { canStopPlaybackAtom } from "@/features/playback/atoms/playback";

/**
 * The playback bar over the grid. It glides between rows in step with the
 * audio, so it's positioned from an animation-frame loop that reads the
 * engine's clock and writes the transform directly, never through React state.
 */
export function PlayheadOverlay({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const isActive = useAtomValue(canStopPlaybackAtom);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;
    const container = containerRef.current;
    const bar = barRef.current;
    if (!container || !bar) return;

    // Respect reduced-motion: step row to row instead of gliding
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let frameId = 0;
    const tick = () => {
      const position = playbackClock.position;
      const index = Math.floor(position);
      const row = container.querySelector<HTMLElement>(`[data-row="${index}"]`);

      if (row) {
        const containerTop = container.getBoundingClientRect().top;
        const rowRect = row.getBoundingClientRect();
        const fraction = reduceMotion ? 0 : position - index;
        const y = rowRect.top - containerTop + fraction * rowRect.height;

        bar.style.transform = `translateY(${y}px)`;
        bar.style.height = `${rowRect.height}px`;
        bar.style.opacity = "1";
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      bar.style.opacity = "0";
    };
  }, [isActive, containerRef]);

  return (
    <div
      ref={barRef}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-[2] opacity-0 bg-primary/25 shadow-[inset_3px_0_0_var(--color-primary)] will-change-transform"
    />
  );
}
