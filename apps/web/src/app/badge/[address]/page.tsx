"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { truncateAddress } from "@/lib/utils";
import { getUserBadge } from "@/contracts/clearance";
import type { CertificationBadge, VerificationProvider } from "@/types";

const PROVIDER_NAMES: Record<VerificationProvider, string> = {
  basi: "BASI Pilates",
  stott: "STOTT PILATES",
  balanced_body: "Balanced Body",
  polestar: "Polestar Pilates",
  other: "Other",
};

export default function BadgePage() {
  const params = useParams<{ address: string }>();
  const address = params.address;

  const [badge, setBadge] = useState<CertificationBadge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadBadge() {
      if (!address) return;
      try {
        const result = await getUserBadge(address);
        setBadge(result);
      } catch (err) {
        console.error("Failed to load badge:", err);
      }
      setIsLoading(false);
    }
    loadBadge();
  }, [address]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareOnX() {
    const text = encodeURIComponent(
      `I'm a verified Pilates instructor on-chain! Check my certification badge:`,
    );
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://x.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 size={24} className="animate-spin text-violet-400" />
      </div>
    );
  }

  if (!badge) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShieldCheck size={64} className="mb-4 text-text-muted opacity-30" />
          <h2 className="text-xl font-semibold text-text-secondary">
            No Badge Found
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            No certification badge was found for address{" "}
            <span className="font-mono">{truncateAddress(address, 10)}</span>.
          </p>
          <Link
            href="/gallery"
            className="mt-6 flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300"
          >
            <ArrowLeft size={14} />
            Browse all badges
          </Link>
        </div>
      </div>
    );
  }

  const providerName = PROVIDER_NAMES[badge.provider] ?? badge.provider;
  const dateStr = badge.certifiedAt
    ? new Date(badge.certifiedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";
  const explorerUrl =
    badge.txHash && !badge.txHash.startsWith("demo-")
      ? `https://explorer.burnt.com/xion-testnet-1/tx/${badge.txHash}`
      : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/gallery"
        className="mb-6 flex items-center gap-2 text-sm text-text-muted hover:text-text-primary"
      >
        <ArrowLeft size={14} />
        Back to Gallery
      </Link>

      <Card className="overflow-hidden border-2 border-violet-500/30">
        {/* Certificate header */}
        <div className="bg-gradient-to-br from-violet-600/20 via-violet-900/10 to-bg-card px-8 py-10 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-violet-500/30 bg-violet-500/10">
            <Award size={40} className="text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold">Certified Pilates Instructor</h1>
          <Badge variant="violet" className="mt-3">
            {providerName}
          </Badge>
        </div>

        <CardBody className="space-y-6 px-8 py-8">
          {/* Badge details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-xs text-text-muted">Token ID</div>
              <div className="font-mono text-sm">{badge.tokenId}</div>
            </div>
            <div>
              <div className="text-xs text-text-muted">Verification Method</div>
              <div className="text-sm">Reclaim zkTLS</div>
            </div>
            <div>
              <div className="text-xs text-text-muted">Owner</div>
              <div className="font-mono text-sm">
                {truncateAddress(badge.owner, 12)}
              </div>
            </div>
            <div>
              <div className="text-xs text-text-muted">Verified On</div>
              <div className="text-sm">{dateStr}</div>
            </div>
          </div>

          {/* Transaction link */}
          {explorerUrl && (
            <div className="rounded-lg border border-border bg-bg-elevated p-4">
              <div className="mb-1 text-xs text-text-muted">
                Transaction Hash
              </div>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-mono text-sm text-violet-400 hover:text-violet-300"
              >
                {truncateAddress(badge.txHash, 16)}
                <ExternalLink size={12} />
              </a>
            </div>
          )}

          {/* Share buttons */}
          <div className="flex gap-3">
            <button
              onClick={copyLink}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy Link
                </>
              )}
            </button>
            <button
              onClick={shareOnX}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
            >
              Share on X
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
