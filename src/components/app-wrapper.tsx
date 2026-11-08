import { store } from "@/store";
import { Provider as JotaiProvider } from "jotai";
import { Outlet, useLocation } from "react-router";
import { TooltipProvider } from "./ui/tooltip";
import { AppSidebar } from "./app-sidebar";

export function AppWrapper() {
  // The home page and the share landing page are entry points with their own
  // calls to action, so they get the full width. Every other page keeps the
  // sidebar and its home button.
  const { pathname } = useLocation();
  const showSidebar = pathname !== "/" && pathname !== "/share";

  return (
    <JotaiProvider store={store}>
      <TooltipProvider>
        <div className="h-dvh flex">
          {showSidebar && <AppSidebar />}
          {/* min-w-0 lets pages shrink to the screen instead of growing to
              fit wide content (like the share page's canvas) */}
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </TooltipProvider>
    </JotaiProvider>
  );
}
