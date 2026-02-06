import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { HomePage } from "./pages/home-page.tsx";
import { AppWrapper } from "./components/app-wrapper.tsx";
import { EditorPage } from "./pages/editor-page.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AppWrapper />}>
          <Route index element={<HomePage />} />
          <Route path="/editor/:id" element={<EditorPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
