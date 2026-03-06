"use client";

import { type ReactNode } from "react";
import { CrossmintProvider } from "@crossmint/client-sdk-react-ui";

const crossmintApiKey = process.env.NEXT_PUBLIC_CROSSMINT_API_KEY ?? "";

/**
 * App providers:
 * - CrossmintProvider: USDC credit card payments via Crossmint hosted checkout
 * - OAuth3 authentication is handled via useOAuth3 hook (no provider needed)
 */
export function Providers({ children }: { children: ReactNode }) {
  if (!crossmintApiKey) {
    return <>{children}</>;
  }

  return (
    <CrossmintProvider apiKey={crossmintApiKey}>
      {children}
    </CrossmintProvider>
  );
}
