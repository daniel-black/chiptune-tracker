import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HomePage } from "@/pages/home-page.tsx";
import { EditorPage } from "@/pages/editor-page.tsx";
import { AppWrapper } from "@/components/app-wrapper.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import { NotFoundPage } from "./pages/not-found-page";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AppWrapper />}>
          <Route index element={<HomePage />} />
          <Route path="/editor/:id" element={<EditorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
