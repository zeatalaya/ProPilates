"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Layers,
  BookOpen,
  Play,
  ShoppingBag,
  FolderOpen,
  User,
  ShieldCheck,
  Award,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { useOAuth3 } from "@/hooks/useOAuth3";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/builder", label: "Builder", icon: Layers },
  { href: "/templates", label: "Templates", icon: BookOpen },
  { href: "/teach", label: "Teach", icon: Play },
  { href: "/marketplace", label: "Market", icon: ShoppingBag },
  { href: "/portfolio", label: "Portfolio", icon: FolderOpen },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/verify", label: "Verify", icon: ShieldCheck },
  { href: "/gallery", label: "Gallery", icon: Award },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isConnected, instructor } = useAuthStore();
  const { logout } = useOAuth3();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  // Hide navbar on landing and onboarding
  if (pathname === "/" || pathname.startsWith("/onboarding") || pathname.startsWith("/badge/")) return null;

  function handleDisconnect() {
    setShowDropdown(false);
    logout();
    router.push("/");
  }

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
        <div className="relative flex items-center gap-3" ref={dropdownRef}>
          {isConnected ? (
            <>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-bg-elevated"
              >
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-text-secondary">
                  {instructor?.name || "Connected"}
                </span>
                <ChevronDown
                  size={14}
                  className={cn(
                    "text-text-muted transition-transform",
                    showDropdown && "rotate-180",
                  )}
                />
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 overflow-hidden rounded-lg border border-border bg-bg-elevated shadow-lg">
                  <Link
                    href="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-bg hover:text-text-primary"
                  >
                    <User size={14} />
                    Profile
                  </Link>
                  <button
                    onClick={handleDisconnect}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-bg hover:text-red-300"
                  >
                    <LogOut size={14} />
                    Disconnect
                  </button>
                </div>
              )}
            </>
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
