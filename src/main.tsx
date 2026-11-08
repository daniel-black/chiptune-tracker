import "./index.css";
import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { HomePage } from "@/pages/home-page.tsx";
import { AppWrapper } from "@/components/app-wrapper.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import { NotFoundPage } from "./pages/not-found-page";
import { demoSongs, seedDefaultSong } from "./seed-default-song";
import { startEngagementTimer, track } from "./lib/analytics";

/** Any saved app state means this browser has used the app before */
function hasVisitedBefore(): boolean {
  try {
    return localStorage.getItem("songIndex") !== null;
  } catch {
    return false;
  }
}

/** Songs in this browser that aren't demos */
function countOwnSongs(): number {
  try {
    const index: string[] = JSON.parse(localStorage.getItem("songIndex") ?? "[]");
    return index.filter((id) => !demoSongs.some((d) => d.id === id)).length;
  } catch {
    return 0;
  }
}

// The editor (grid, audio engine, drag and drop) is most of the app's code;
// load it only when needed so the home page, the page search engines and
// newcomers see first, stays light.
const EditorPage = lazy(() =>
  import("@/pages/editor-page.tsx").then((m) => ({ default: m.EditorPage })),
);
const SharePage = lazy(() =>
  import("./pages/share-page").then((m) => ({ default: m.SharePage })),
);

const isReturningVisitor = hasVisitedBefore();
seedDefaultSong();
if (isReturningVisitor) {
  track("returning-visitor", { ownSongs: countOwnSongs() });
}
startEngagementTimer();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AppWrapper />}>
          <Route index element={<HomePage />} />
          <Route
            path="/editor/:id"
            element={
              <Suspense fallback={null}>
                <EditorPage />
              </Suspense>
            }
          />
          <Route
            path="/share"
            element={
              <Suspense fallback={null}>
                <SharePage />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
