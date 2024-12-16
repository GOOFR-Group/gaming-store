import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { LogOut, Menu, ShoppingCart, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { clearToken } from "@/lib/auth";

export const Route = createFileRoute("/_layout")({
  component: Component,
});

function SignOut() {
  function handleClick() {
    clearToken();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    localStorage.removeItem("publisherConfig");
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/signin";
  }
  return (
    <Button variant="ghost" onClick={handleClick}>
      <LogOut /> Sign Out
    </Button>
  );
}

function Component() {
  return (
    <div className="overflow-auto">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center px-6 py-4 space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <Link className="flex items-center space-x-2" href="/">
              <img
                alt="GOOFR Gaming Store Logo"
                className="size-16"
                src="/images/logo.png"
              />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Button
                asChild
                className="text-sm font-medium hover:bg-transparent hover:text-primary"
                variant="ghost"
              >
                <Link href="/browse">Browse</Link>
              </Button>
              <Button
                asChild
                className="text-sm font-medium hover:bg-transparent hover:text-primary"
                variant="ghost"
              >
                <Link href="/news">News</Link>
              </Button>
              <Button
                asChild
                className="text-sm font-medium hover:bg-transparent hover:text-primary"
                variant="ghost"
              >
                <Link href="/support">Support</Link>
              </Button>
              <Button
                asChild
                className="text-sm font-medium hover:bg-transparent hover:text-primary"
                variant="ghost"
              >
                <Link href="/distribute">Distribute</Link>
              </Button>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Button asChild size="icon" variant="ghost">
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="sr-only">Shopping cart</span>
                </Link>
              </Button>
              <Button asChild size="icon" variant="ghost">
                <Link href="/account">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Account</span>
                </Link>
              </Button>
              <SignOut />
              <Button className="md:hidden" size="icon" variant="ghost">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <Outlet />
      <footer className="w-full py-6">
        <div className="px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Browse</h3>
              <ul className="space-y-1">
                <li>
                  <Link className="hover:underline" href="#">
                    Featured & Recommended
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline" href="#">
                    Deals
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline" href="#">
                    Best Sellers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">News</h3>
              <ul className="space-y-1">
                <li>
                  <Link className="hover:underline" href="#">
                    Latest
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline" href="#">
                    Hot Topics
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Support</h3>
              <ul className="space-y-1">
                <li>
                  <Link className="hover:underline" href="#">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline" href="#">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline" href="#">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline" href="#">
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Legal</h3>
              <ul className="space-y-1">
                <li>
                  <Link className="hover:underline" href="#">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline" href="#">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline" href="#">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline" href="#">
                    Complaints Book
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline" href="#">
                    Dispute Resolution
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-6 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} GOOFR. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
