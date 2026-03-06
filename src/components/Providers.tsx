"use client";

import { type ReactNode } from "react";

/**
 * Abstraxion provider wrapper.
 *
 * When @burnt-labs/abstraxion is installed, uncomment the Abstraxion provider
 * and configure it with your treasury contract address.
 *
 * ```
 * import { AbstraxionProvider } from "@burnt-labs/abstraxion";
 * ```
 */
export function Providers({ children }: { children: ReactNode }) {
  const treasuryConfig = {
    treasury: process.env.NEXT_PUBLIC_TREASURY_CONTRACT ?? "",
  };

  // When the Abstraxion package is properly installed, wrap children:
  // <AbstraxionProvider config={treasuryConfig}>{children}</AbstraxionProvider>

  // For now, pass through directly:
  return <>{children}</>;
}
