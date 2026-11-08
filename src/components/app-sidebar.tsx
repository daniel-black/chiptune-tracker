import { HouseIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router";
import { HelpButton } from "./help-button";

export function AppSidebar() {
  return (
    <div className="w-11 border-r flex flex-col items-center justify-between py-1.5 gap-3 bg-background">
      <Link to="/" aria-label="Home">
        <Button size="icon-lg" variant="ghost" className="text-muted-foreground hover:text-primary">
          <HouseIcon />
        </Button>
      </Link>
      <HelpButton />
    </div>
  );
}
