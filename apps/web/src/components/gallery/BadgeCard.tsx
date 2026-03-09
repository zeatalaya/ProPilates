"use client";

import Link from "next/link";
import { Award, ExternalLink } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { truncateAddress } from "@/lib/utils";
import type { VerificationProvider } from "@/types";

const PROVIDER_NAMES: Record<VerificationProvider, string> = {
  basi: "BASI Pilates",
  stott: "STOTT PILATES",
  balanced_body: "Balanced Body",
  polestar: "Polestar Pilates",
  other: "Other",
};

interface BadgeCardProps {
  tokenId: string;
  owner: string;
  provider: VerificationProvider;
  certifiedAt: string;
  txHash?: string;
}

export function BadgeCard({
  tokenId,
  owner,
  provider,
  certifiedAt,
  txHash,
}: BadgeCardProps) {
  const providerName = PROVIDER_NAMES[provider] ?? provider;
  const dateStr = certifiedAt
    ? new Date(certifiedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  return (
    <Card className="overflow-hidden transition-all hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5">
      {/* Gradient header */}
      <div className="bg-gradient-to-br from-violet-600/20 to-violet-900/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award size={20} className="text-violet-400" />
            <span className="font-semibold text-violet-300">
              Badge #{tokenId}
            </span>
          </div>
          <Badge variant="violet">{providerName}</Badge>
        </div>
      </div>

      <CardBody>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-text-muted">Owner</div>
            <div className="font-mono text-sm text-text-secondary">
              {truncateAddress(owner, 10)}
            </div>
          </div>

          <div>
            <div className="text-xs text-text-muted">Verified</div>
            <div className="text-sm text-text-secondary">{dateStr}</div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Link
              href={`/badge/${owner}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600/15 px-3 py-2 text-sm font-medium text-violet-400 transition-colors hover:bg-violet-600/25"
            >
              View Badge
            </Link>
            {txHash && !txHash.startsWith("demo-") && (
              <a
                href={`https://explorer.burnt.com/xion-testnet-1/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-lg border border-border p-2 text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-primary"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
