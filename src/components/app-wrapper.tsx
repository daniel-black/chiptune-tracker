import { store } from "@/store";
import { Provider as JotaiProvider } from "jotai";
import { Outlet } from "react-router";
import { TooltipProvider } from "./ui/tooltip";
import { AppSidebar } from "./app-sidebar";

export function AppWrapper() {
  return (
    <JotaiProvider store={store}>
      <TooltipProvider>
        <div className="h-dvh flex">
          <AppSidebar />
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </TooltipProvider>
    </JotaiProvider>
  );
}
