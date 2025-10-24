"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "AI Tutorial Chat", href: "/ai-tutorial" },
  { label: "AI Experts", href: "/experts" },
  { label: "AI Exam", href: "/exam" },
  { label: "AI Summarizer", href: "/summarizer" },
  { label: "Dashboard", href: "/dashboard" }
];

export function Header() {
  const pathname = usePathname();
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 p-2 text-white">AI</span>
          <span>AI-Mentor</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {hasClerk ? (
            <>
              <SignedIn>
                <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
              </SignedIn>
              <SignedOut>
                <Button asChild size="sm" className="rounded-full">
                  <Link href="/sign-in">Sign in</Link>
                </Button>
              </SignedOut>
            </>
          ) : (
            <Button asChild size="sm" className="rounded-full">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
