import { MouseEvent } from "react";

import { Link } from "@tanstack/react-router";
import { LinkProps } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

export function NavLink({
  to,
  children,
  active,
  onClick,
}: {
  to: LinkProps["to"];
  children: React.ReactNode;
  active: boolean;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
      )}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
