import { store } from "@/store";
import { Provider as JotaiProvider } from "jotai";
import { Outlet, useLocation } from "react-router";
import { TooltipProvider } from "./ui/tooltip";
import { AppSidebar } from "./app-sidebar";

export function AppWrapper() {
  // The home page is the starting point, so it has no need for a home button
  // and gets the full width. Every other page keeps the sidebar.
  const { pathname } = useLocation();
  const showSidebar = pathname !== "/";

  return (
    <JotaiProvider store={store}>
      <TooltipProvider>
        <div className="h-dvh flex">
          {showSidebar && <AppSidebar />}
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </TooltipProvider>
    </JotaiProvider>
  );
}
