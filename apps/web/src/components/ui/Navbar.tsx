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
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { useOAuth3 } from "@/hooks/useOAuth3";
import { useThemeStore } from "@/stores/theme";

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
  const { theme, setTheme } = useThemeStore();
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
          className="flex items-center flex-shrink-0"
        >
          {/* Mobile icon — light mode */}
          <img
            src="/icon-70-light.svg"
            alt="ProPilates"
            className="block md:hidden dark:hidden h-8 w-8 rounded-lg"
          />
          {/* Mobile icon — dark mode */}
          <img
            src="/icon-70-dark.svg"
            alt="ProPilates"
            className="hidden dark:block dark:md:hidden h-8 w-8 rounded-lg"
          />
          {/* Desktop logo — light mode */}
          <img
            src="/propilates-logo-light.svg"
            alt="ProPilates"
            className="hidden md:block dark:hidden h-8"
          />
          {/* Desktop logo — dark mode */}
          <img
            src="/propilates-logo-dark.svg"
            alt="ProPilates"
            className="hidden dark:hidden dark:md:block h-8"
          />
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

        {/* Theme toggle + Connection status */}
        <div className="relative flex items-center gap-2" ref={dropdownRef}>
          <button
            onClick={() =>
              setTheme(
                theme === "dark" ? "light" : theme === "light" ? "system" : "dark",
              )
            }
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
            title={`Theme: ${theme}`}
          >
            {theme === "dark" ? (
              <Moon size={16} />
            ) : theme === "light" ? (
              <Sun size={16} />
            ) : (
              <Monitor size={16} />
            )}
          </button>

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
                    Sign Out
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link href="/" className="btn-primary text-sm">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
