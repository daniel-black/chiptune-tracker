import { HouseIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router";

export function AppSidebar() {
  return (
    <div className=" border-r flex flex-col gap-3 bg-primary-foreground/5">
      <Link to="/">
        <Button size="icon-lg" className="h-10 w-10">
          <HouseIcon />
        </Button>
      </Link>
    </div>
  );
}
