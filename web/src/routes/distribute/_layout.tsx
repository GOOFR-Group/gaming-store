import { useEffect } from "react";

import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import {
  ChartArea,
  Gamepad2,
  LogOut,
  Menu,
  Newspaper,
  PercentSquare,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { clearToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/distribute/_layout")({
  component: Component,
});

function SignOut() {
  /**
   * Signs out a publisher and reloads the current page.
   */
  function handleClick() {
    clearToken();
    window.location.reload();
  }

  return (
    <Button
      className="px-2 w-full h-8 rounded-sm justify-start"
      variant="ghost"
      onClick={handleClick}
    >
      <LogOut className="mr-2 size-4" /> Sign Out
    </Button>
  );
}

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
      {/* Top bar */}
      <header className="flex px-6 py-4 items-center justify-between border-b bg-background">
        <div className="flex items-center space-x-6">
          <Link href="/">
            <img
              alt="GOOFR Gaming Store Logo"
              className="w-28"
              src="/images/logo.png"
            />
          </Link>

          <Link
            className="flex items-center gap-4 space-x-2"
            href="/distribute"
          >
            <h1 className="font-semibold text-xl">Distribution Center</h1>
          </Link>
        </div>

        <div className="flex gap-2">
          {/* Mobile sidebar */}
          <Sheet>
            <SheetTrigger asChild>
              <Button className="md:hidden size-8" size="icon" variant="ghost">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-64" side="left">
              <nav className="flex flex-col space-y-2 mt-4">
                <NavLink
                  active={location.pathname.includes("/distribute/games")}
                  href="/distribute/games"
                >
                  <Gamepad2 className="mr-2 size-4" />
                  Games
                </NavLink>
                <NavLink
                  active={location.pathname.includes("/distribute/campaigns")}
                  href="/distribute/campaigns"
                >
                  <PercentSquare className="mr-2 size-4" />
                  Campaigns
                </NavLink>
                <NavLink
                  active={location.pathname.includes("/distribute/news")}
                  href="/distribute/news"
                >
                  <Newspaper className="mr-2 size-4" />
                  News
                </NavLink>
                <NavLink
                  active={location.pathname.includes("/distribute/statistics")}
                  href="/distribute/statistics"
                >
                  <ChartArea className="mr-2 size-4" />
                  Statistics
                </NavLink>
              </nav>
            </SheetContent>
          </Sheet>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="relative size-8" size="icon" variant="ghost">
                  <User className="size-4" />
                  <span className="sr-only">Open user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link className="cursor-pointer" to="/distribute/account">
                    <User className="mr-2 size-4" />
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <SignOut />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for larger screens */}
        <aside className="hidden w-64 flex-col border-r bg-background md:flex">
          <nav className="flex-1 space-y-2 p-4">
            <NavLink
              active={location.pathname.includes("/distribute/games")}
              href="/distribute/games"
            >
              <Gamepad2 className="mr-2 size-4" />
              Games
            </NavLink>
            <NavLink
              active={location.pathname.includes("/distribute/campaigns")}
              href="/distribute/campaigns"
            >
              <PercentSquare className="mr-2 size-4" />
              Campaigns
            </NavLink>
            <NavLink
              active={location.pathname.includes("/distribute/news")}
              href="/distribute/news"
            >
              <Newspaper className="mr-2 size-4" />
              News
            </NavLink>
            <NavLink
              active={location.pathname.includes("/distribute/statistics")}
              href="/distribute/statistics"
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

function NavLink({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
      )}
    >
      {children}
    </Link>
  );
}
