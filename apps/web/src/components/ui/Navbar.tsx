"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Layers,
  Play,
  ShoppingBag,
  FolderOpen,
  User,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/builder", label: "Builder", icon: Layers },
  { href: "/teach", label: "Teach", icon: Play },
  { href: "/marketplace", label: "Market", icon: ShoppingBag },
  { href: "/portfolio", label: "Portfolio", icon: FolderOpen },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/verify", label: "Verify", icon: ShieldCheck },
];

export function Navbar() {
  const pathname = usePathname();
  const { isConnected, instructor } = useAuthStore();

  // Hide navbar on landing and onboarding
  if (pathname === "/" || pathname.startsWith("/onboarding")) return null;

  return (
    <nav className="fixed top-0 z-50 flex h-16 w-full items-center border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-violet-400"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <span className="text-sm font-black text-white">P</span>
          </div>
          ProPilates
        </Link>

        {/* Nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.slice(1).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-violet-600/15 text-violet-400"
                  : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>

        {/* Connection status */}
        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-sm text-text-secondary">
                {instructor?.name || "Connected"}
              </span>
            </div>
          ) : (
            <Link href="/" className="btn-primary text-sm">
              Connect
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
