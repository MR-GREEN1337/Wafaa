"use client";

import React from "react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { usePathname } from "next/navigation";
import Logo from "./logo";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { MenuIcon } from "lucide-react";
import { routes } from "@/lib/constants";
import SidebarDecoration from "./sidebardecoration";
import CreditBadge from "./creditsBadge";

export const Sidebar = () => {
  const pathname = usePathname();

  // Find the route whose href matches the current pathname exactly.
  const activeRoute = routes.find((route) => 
    pathname === route.href || // Exact match
    (pathname.startsWith(route.href) && route.href !== "/dashboard/") // Starts with, but not dashboard
  ) || routes[0];

  return (
    <div
      className="hidden relative md:block min-w-[280px]
    max-w-[280px] h-screen overflow-hidden ww-full bg-primary/5
    dark:bg-secondary/30 dark:text-foreground text-muted-foreground
    border-r-2 border-separate"
    >
      <div
        className="flex items-center justify-center gap-2
        border-b-[1px] border-separate p-4"
      >
        <Logo />
      </div>
      <div className="flex flex-col p-2">
       <CreditBadge />
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={buttonVariants({
              variant: activeRoute.href === route.href ? "sidebarActiveItem" : "sidebarItem",
            })}
          >
            <route.icon size={20} />
            {route.label}
          </Link>
        ))}
      </div>
      <SidebarDecoration />
    </div>
  );
};

export function MobileSidebar() {
  const [isOpen, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Find the route whose href matches the current pathname exactly.
  const activeRoute = routes.find((route) => 
    pathname === route.href || 
    (pathname.startsWith(route.href) && route.href !== "/dashboard/")
  ) || routes[0];

  return (
    <div className="block border-separate md:hidden">
      <nav className="container flex items-center justify-between px-8">
        <Sheet open={isOpen} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant={"ghost"} size={"icon"} className="bg-transparent">
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent
            className="w-[350px] sm:w-[300px] space-y-4"
            side={"left"}
          >
            <Logo />
            <div className="flex flex-col gap-1">
              <CreditBadge />
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={buttonVariants({
                    variant:
                      activeRoute.href === route.href
                        ? "sidebarActiveItem"
                        : "sidebarItem",
                  })}
                  onClick={() => setOpen(false)} // Close menu when clicking a link
                >
                  <route.icon size={20} />
                  {route.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}
