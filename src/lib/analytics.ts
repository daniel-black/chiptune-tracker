/**
 * Custom Umami events. Page views are tracked by the script in index.html;
 * these cover the funnel: hear it → edit → compose → share → come back.
 *
 * Events never throw and never block the app: if Umami is blocked or hasn't
 * loaded yet, events wait briefly in a queue and are dropped if it never
 * arrives. In development they're logged to the console instead of sent.
 */

type EventData = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: { track: (name: string, data?: EventData) => void };
  }
}

const queue: Array<[string, EventData | undefined]> = [];
const MAX_QUEUE = 50;
const MAX_FLUSH_ATTEMPTS = 10;
let flushTimer: number | null = null;
let flushAttempts = 0;

export function track(name: string, data?: EventData): void {
  if (import.meta.env.DEV) {
    console.debug("[analytics]", name, data ?? "");
    return;
  }
  if (queue.length < MAX_QUEUE) queue.push([name, data]);
  flush();
}

function flush(): void {
  const umami = window.umami;
  if (umami) {
    for (const [name, data] of queue.splice(0)) {
      try {
        umami.track(name, data);
      } catch {
        // Analytics must never break the app
      }
    }
    return;
  }

  // The script loads with `defer`, or may be blocked: retry for a few seconds
  if (flushTimer !== null || flushAttempts >= MAX_FLUSH_ATTEMPTS) return;
  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    flushAttempts++;
    flush();
  }, 1000);
}

const firedThisSession = new Set<string>();

/** Track an event at most once per page load (per distinct data) */
export function trackOnce(name: string, data?: EventData): void {
  const key = name + JSON.stringify(data ?? {});
  if (firedThisSession.has(key)) return;
  firedThisSession.add(key);
  track(name, data);
}

// --- Composing milestones -------------------------------------------------

const NOTE_MILESTONES = [16, 64, 256];
let notesEnteredThisSession = 0;

/**
 * Call on every grid edit with how many notes it entered (a pitch typed
 * into a cell, not cleared or turned off).
 */
export function recordEdit(notesEntered: number, source: string): void {
  trackOnce("first-edit", { source });
  if (notesEntered <= 0) return;
  const count = notesEntered;

  const before = notesEnteredThisSession;
  notesEnteredThisSession += count;
  for (const milestone of NOTE_MILESTONES) {
    if (before < milestone && notesEnteredThisSession >= milestone) {
      trackOnce("notes-milestone", { count: milestone });
    }
  }
}

// --- Active time ----------------------------------------------------------

const ENGAGED_AFTER_MS = 5 * 60 * 1000;
const IDLE_AFTER_MS = 60 * 1000;
const TICK_MS = 15 * 1000;

/**
 * Fires `engaged-5min` after five minutes of actual use: time only counts
 * while the tab is visible and there was input in the last minute, so a tab
 * left open in the background doesn't count.
 */
export function startEngagementTimer(): void {
  let lastInput = Date.now();
  let activeMs = 0;

  const onInput = () => {
    lastInput = Date.now();
  };
  for (const type of ["keydown", "pointerdown", "wheel"] as const) {
    window.addEventListener(type, onInput, { passive: true });
  }

  const timer = window.setInterval(() => {
    const active =
      document.visibilityState === "visible" &&
      Date.now() - lastInput < IDLE_AFTER_MS;
    if (active) activeMs += TICK_MS;

    if (activeMs >= ENGAGED_AFTER_MS) {
      trackOnce("engaged-5min");
      window.clearInterval(timer);
      for (const type of ["keydown", "pointerdown", "wheel"] as const) {
        window.removeEventListener(type, onInput);
      }
    }
  }, TICK_MS);
}
