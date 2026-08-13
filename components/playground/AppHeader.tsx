"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Menu, Moon, Sun } from "lucide-react";
import { Button, SimpleSheet } from "@open-resource-discovery/ui-components";
import { useTheme } from "@/src/lib/card-view";

const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/playground", label: "Playground" },
];

export function AppHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();

  const toggleTheme = () =>
    setTheme(resolvedTheme === "dark" ? "light" : "dark");

  return (
    <header className="relative flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <Link href="/" className="flex items-center gap-2 text-lg font-bold">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
          <Layers className="h-4 w-4" />
        </span>
        <span className="text-sm sm:text-base">Overlay Editor</span>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden items-center gap-1 sm:flex">
        {NAV_LINKS.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </nav>

      {/* Mobile nav */}
      <div className="flex items-center gap-1 sm:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        <SimpleSheet
          side="top"
          trigger={
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          }
        >
          <nav className="flex flex-col gap-1 p-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </SimpleSheet>
      </div>
    </header>
  );
}
