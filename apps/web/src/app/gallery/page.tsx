"use client";

import { useEffect, useState } from "react";
import { Award, Loader2 } from "lucide-react";
import { getAllBadges, getBadgeCount } from "@/contracts/clearance";
import { BadgeCard } from "@/components/gallery/BadgeCard";
import type { CertificationBadge } from "@/types";

export default function GalleryPage() {
  const [badges, setBadges] = useState<CertificationBadge[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBadges() {
      const [badgesList, count] = await Promise.all([
        getAllBadges(),
        getBadgeCount(),
      ]);
      setBadges(badgesList);
      setTotalCount(count);
      setIsLoading(false);
    }
    loadBadges();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <Award className="text-violet-400" />
          Badge Gallery
        </h1>
        <p className="mt-2 text-text-secondary">
          Browse all verified Pilates instructor certification badges on XION.
          {totalCount > 0 && (
            <span className="ml-1 font-semibold text-violet-400">
              {totalCount} badge{totalCount !== 1 ? "s" : ""} minted.
            </span>
          )}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-violet-400" />
        </div>
      ) : badges.length === 0 ? (
        <div className="py-24 text-center">
          <Award
            size={48}
            className="mx-auto mb-4 text-text-muted opacity-30"
          />
          <p className="text-lg text-text-muted">No badges minted yet</p>
          <p className="mt-1 text-sm text-text-muted">
            Be the first to verify your certification and earn a badge.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((badge) => (
            <BadgeCard
              key={badge.tokenId}
              tokenId={badge.tokenId}
              owner={badge.owner}
              provider={badge.provider}
              certifiedAt={badge.certifiedAt}
              txHash={badge.txHash}
            />
          ))}
        </div>
      )}
    </div>
  );
}
