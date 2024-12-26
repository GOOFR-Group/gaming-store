import { useEffect } from "react";

import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { ChartArea, Gamepad2, Newspaper, PercentSquare } from "lucide-react";

import { NavLink } from "@/components/distribute/navbar/nav-link";
import { DistributeNavbar } from "@/components/distribute/navbar/navbar";

export const Route = createFileRoute("/distribute/_layout")({
  component: Component,
});

function Component() {
  const location = useLocation();

  useEffect(() => {
    // Hide the global scrollbar when the user is in the distribution routes.
    document.body.style.overflow = "hidden";

    return () => {
      // Restore global scrollbar when user exits from the distribution routes.
      document.body.style.removeProperty("overflow");
    };
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <DistributeNavbar variant="full" />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for larger screens */}
        <aside className="hidden w-64 flex-col border-r bg-background md:flex">
          <nav className="flex-1 space-y-2 p-4">
            <NavLink
              active={location.pathname.includes("/distribute/games")}
              to="/distribute/games"
            >
              <Gamepad2 className="mr-2 size-4" />
              Games
            </NavLink>
            <NavLink
              active={location.pathname.includes("/distribute/campaigns")}
              to="/distribute/under-construction"
            >
              <PercentSquare className="mr-2 size-4" />
              Campaigns
            </NavLink>
            <NavLink
              active={location.pathname.includes("/distribute/news")}
              to="/distribute/under-construction"
            >
              <Newspaper className="mr-2 size-4" />
              News
            </NavLink>
            <NavLink
              active={location.pathname.includes("/distribute/statistics")}
              to="/distribute/under-construction"
            >
              <ChartArea className="mr-2 size-4" />
              Statistics
            </NavLink>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
