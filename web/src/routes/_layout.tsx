import { useState } from "react";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { Menu, ShoppingCart, User } from "lucide-react";

import { NavLink } from "@/components/distribute/navbar/nav-link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getUser, getUserCartGames } from "@/lib/api";
import { decodeTokenPayload, getToken } from "@/lib/auth";
import { userNavbarQueryKey } from "@/lib/query-keys";
import { cn, getInitials } from "@/lib/utils";

export const Route = createFileRoute("/_layout")({
  component: Component,
});

/**
 * Query options for retrieving the signed in user and their cart.
 * @returns Query options.
 */
function userNavbarQueryOptions() {
  return queryOptions({
    queryKey: userNavbarQueryKey,
    async queryFn() {
      try {
        const token = getToken();
        const payload = decodeTokenPayload(token);

        const userId = payload.sub;
        const user = await getUser(userId);
        const cart = await getUserCartGames(userId);

        return { user, cart };
      } catch {
        // Ignore the error since the user might not be signed in.
        return null;
      }
    },
  });
}

function Component() {
  const location = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { data } = useSuspenseQuery(userNavbarQueryOptions());

  return (
    <div className="overflow-auto">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center px-6 py-4 space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <Link className="flex items-center space-x-2" to="/">
              <img
                alt="GOOFR Gaming Store Logo"
                className="w-28"
                src="/images/logo.png"
              />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Button
                asChild
                className="font-medium hover:bg-transparent hover:text-primary"
                variant="ghost"
              >
                <Link
                  to="/browse"
                  search={{
                    page: 1,
                  }}
                >
                  Browse
                </Link>
              </Button>

              <Button
                asChild
                className="font-medium hover:bg-transparent hover:text-primary"
                variant="ghost"
              >
                <Link to="/under-construction">News</Link>
              </Button>

              <Button
                asChild
                className="font-medium hover:bg-transparent hover:text-primary"
                variant="ghost"
              >
                <Link to="/under-construction">Support</Link>
              </Button>

              <Button
                asChild
                className="font-medium hover:bg-transparent hover:text-primary"
                variant="ghost"
              >
                <Link to="/distribute">Distribute</Link>
              </Button>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Button asChild size="icon" variant="ghost">
                <Link to="/cart">
                  <div className="relative">
                    <ShoppingCart className="size-5" />
                    {!!data?.cart.total && (
                      <Badge
                        className={cn(
                          "min-w-5 h-5 absolute p-0 -top-3 left-2 justify-center text-xs hover:bg-primary",
                          { "px-1": data.cart.total > 9 },
                        )}
                      >
                        {data.cart.total > 99 ? "99+" : data.cart.total}
                      </Badge>
                    )}
                  </div>
                  <span className="sr-only">Shopping cart</span>
                </Link>
              </Button>
              <Button
                asChild
                className={data ? "group hover:bg-transparent" : ""}
                size="icon"
                variant="ghost"
              >
                <Link to="/account">
                  {data ? (
                    <Avatar className="size-8 group-hover:brightness-90">
                      <AvatarImage
                        alt="User avatar"
                        className="object-cover"
                        src={data.user.pictureMultimedia?.url}
                      />
                      <AvatarFallback>
                        {getInitials(data.user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <User className="size-5" />
                  )}
                  <span className="sr-only">Account</span>
                </Link>
              </Button>
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button className="md:hidden" size="icon" variant="ghost">
                    <Menu className="size-5" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-64" side="left">
                  <nav className="flex flex-col space-y-2 mt-4">
                    <NavLink
                      active={location.pathname.includes("/browse")}
                      to="/browse"
                      onClick={() => setIsSheetOpen(false)}
                    >
                      Browse
                    </NavLink>
                    <NavLink
                      active={location.pathname.includes("/news")}
                      to="/under-construction"
                      onClick={() => setIsSheetOpen(false)}
                    >
                      News
                    </NavLink>
                    <NavLink
                      active={location.pathname.includes("/support")}
                      to="/under-construction"
                      onClick={() => setIsSheetOpen(false)}
                    >
                      Support
                    </NavLink>
                    <NavLink
                      active={location.pathname.includes("/distribute")}
                      to="/distribute"
                      onClick={() => setIsSheetOpen(false)}
                    >
                      Distribute
                    </NavLink>
                  </nav>
                </SheetContent>
              </Sheet>
            </nav>
          </div>
        </div>
      </header>
      <main
        className={cn("min-h-screen px-4 py-8 sm:pb-20 md:px-6", {
          "bg-gradient-to-br from-primary to-secondary":
            location.pathname.includes("/signin") ||
            location.pathname.includes("/register"),
        })}
      >
        <Outlet />
      </main>
      <footer className="w-full py-6 bg-gray-900">
        <div className="px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Browse</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    className="hover:underline"
                    to="/browse"
                    search={{
                      page: 1,
                      quickFilter: "recommended",
                    }}
                  >
                    Featured & Recommended
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:underline"
                    to="/browse"
                    search={{
                      page: 1,
                      quickFilter: "upcoming-releases",
                    }}
                  >
                    Upcoming Releases
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:underline"
                    to="/browse"
                    search={{
                      page: 1,
                      quickFilter: "best-sellers",
                    }}
                  >
                    Best Sellers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">News</h3>
              <ul className="space-y-1">
                <li>
                  <Link className="hover:underline" to="/under-construction">
                    Latest
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline" to="/under-construction">
                    Hot Topics
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Support</h3>
              <ul className="space-y-1">
                <li>
                  <Link className="hover:underline" to="/under-construction">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline" to="/under-construction">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline" to="/under-construction">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline" to="/under-construction">
                    FAQs to add
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Legal</h3>
              <ul className="space-y-1">
                <li>
                  <Link className="hover:underline" to="/terms-service">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline" to="/privacy-policy">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline" to="/cookie-policy">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <a
                    className="hover:underline"
                    href="https://www.livroreclamacoes.pt"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Complaints Book
                  </a>
                </li>
                <li>
                  <a
                    className="hover:underline"
                    href="https://www.cniacc.pt"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Dispute Resolution
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-6 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-300">
              © {new Date().getFullYear()} GOOFR. All rights reserved.{" "}
              <span className="text-[12px] opacity-5">
                It was all richards fault.
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
