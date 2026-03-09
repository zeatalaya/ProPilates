"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, ExternalLink, Copy, Check, Award, LayoutGrid } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useVerifyStore } from "@/stores/verify";
import { useAuthStore } from "@/stores/auth";
import { truncateAddress } from "@/lib/utils";

export function StepSuccess() {
  const { txHash, selectedProviderName, reset } = useVerifyStore();
  const { xionAddress } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const badgeUrl = xionAddress ? `/badge/${xionAddress}` : "/gallery";
  const explorerUrl = txHash?.startsWith("demo-")
    ? "#"
    : `https://explorer.burnt.com/xion-testnet-1/tx/${txHash}`;

  function copyBadgeLink() {
    const fullUrl = `${window.location.origin}${badgeUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex justify-center py-6">
      <Card className="w-full max-w-lg">
        <CardBody className="flex flex-col items-center gap-6 py-8">
          {/* Success icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle size={40} className="text-emerald-400" />
          </div>

          <div className="text-center">
            <h3 className="text-xl font-bold text-emerald-400">
              Verification Successful!
            </h3>
            <p className="mt-2 text-sm text-text-secondary">
              Your {selectedProviderName} certification has been verified and
              minted as an on-chain badge.
            </p>
          </div>

          <Badge variant="emerald">Certified Pilates Instructor</Badge>

          {/* Transaction details */}
          {txHash && (
            <div className="w-full rounded-lg border border-border bg-bg-elevated p-4">
              <div className="mb-2 text-xs text-text-muted">
                Transaction Hash
              </div>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-mono text-sm text-violet-400 hover:text-violet-300"
              >
                {truncateAddress(txHash, 12)}
                <ExternalLink size={12} />
              </a>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex w-full flex-col gap-3">
            <Link href={badgeUrl} className="btn-primary w-full text-center">
              <Award size={16} />
              View Your Badge
            </Link>

            <Link
              href="/gallery"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
            >
              <LayoutGrid size={16} />
              View Gallery
            </Link>

            <button
              onClick={copyBadgeLink}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Share Badge Link
                </>
              )}
            </button>
          </div>

          {/* Verify another */}
          <button
            onClick={reset}
            className="text-sm text-text-muted transition-colors hover:text-text-primary"
          >
            Verify another certification
          </button>
        </CardBody>
      </Card>
    </div>
  );
}
