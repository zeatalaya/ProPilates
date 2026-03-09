"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, BookOpen, Play, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";

const bottomNavItems = [
  { href: "/builder", label: "Builder", icon: Layers },
  { href: "/templates", label: "Templates", icon: BookOpen },
  { href: "/teach", label: "Teach", icon: Play },
  { href: "/marketplace", label: "Market", icon: ShoppingBag },
  { href: "/profile", label: "Profile", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  if (
    pathname === "/" ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/badge/")
  )
    return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-bg/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around pb-[env(safe-area-inset-bottom)] pt-2">
        {bottomNavItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium transition-colors",
                isActive ? "text-violet-400" : "text-text-muted",
              )}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
