"use client";

import { useEffect, useState } from "react";
import { Search, ShoppingBag, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth";
import {
  submitTransaction,
  buildMarketplacePurchaseMsg,
  CONTRACTS,
} from "@/lib/xion-transactions";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatUsdc } from "@/lib/utils";
import { MarketplaceListingCard } from "@/components/marketplace/ListingCard";
import type { PilatesClass, Instructor } from "@/types";

interface ListingWithDetails {
  class: PilatesClass;
  instructor: Instructor;
}

export default function MarketplacePage() {
  const { xionAddress, oauthAccessToken } = useAuthStore();
  const [listings, setListings] = useState<ListingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

  useEffect(() => {
    async function loadListings() {
      const { data } = await supabase
        .from("classes")
        .select("*, instructor:instructors(*)")
        .eq("is_public", true)
        .not("price", "is", null)
        .order("created_at", { ascending: false });

      if (data) {
        setListings(
          data.map((d: any) => ({
            class: d,
            instructor: d.instructor,
          })),
        );
      }
      setIsLoading(false);
    }
    loadListings();
  }, []);

  async function handlePurchase(listing: ListingWithDetails) {
    const cls = listing.class;
    if (!xionAddress || !cls.price) return;

    if (!confirm(`Purchase "${cls.title}" for $${formatUsdc(cls.price)}?`))
      return;

    setIsPurchasing(cls.id);
    try {
      const priceUsdc = String(Math.floor(cls.price * 1_000_000));
      const swapId = (cls as any).swap_id;

      if (oauthAccessToken && CONTRACTS.marketplace && swapId) {
        // Production: finish the swap on the marketplace contract
        const txMsg = buildMarketplacePurchaseMsg(
          xionAddress,
          swapId,
          priceUsdc,
        );
        await submitTransaction(oauthAccessToken, [txMsg]);

        // Record purchase in Supabase
        await supabase.from("portfolio_access").insert({
          buyer_address: xionAddress,
          seller_address: listing.instructor.xion_address,
          class_id: cls.id,
          token_id: (cls as any).token_id ?? "",
          price_paid: cls.price,
        });

        alert(
          "Purchase successful! The class has been added to your portfolio.",
        );
      } else {
        // Demo mode — contracts not deployed yet
        console.log("Demo mode — purchase:", { cls, priceUsdc });
        await new Promise((r) => setTimeout(r, 1000));
        alert(
          "Purchase successful! (demo mode — contracts not yet deployed)",
        );
      }
    } catch (err: any) {
      alert(`Purchase failed: ${err.message}`);
    } finally {
      setIsPurchasing(null);
    }
  }

  const filtered = listings.filter((l) => {
    if (search && !l.class.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (methodFilter && l.class.method !== methodFilter) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <p className="mt-2 text-text-secondary">
          Browse and purchase instructor class portfolios.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            className="input-field pl-10"
            placeholder="Search classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field w-auto"
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
        >
          <option value="">All Methods</option>
          <option value="mat">Mat</option>
          <option value="reformer">Reformer</option>
          <option value="chair">Chair</option>
          <option value="tower">Tower</option>
          <option value="barrel">Barrel</option>
          <option value="ring">Ring</option>
          <option value="band">Band</option>
          <option value="foam_roller">Foam Roller</option>
        </select>
      </div>

      {/* Listings grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-violet-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center">
          <ShoppingBag size={48} className="mx-auto mb-4 text-text-muted opacity-30" />
          <p className="text-text-muted">No listings found</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => (
            <MarketplaceListingCard
              key={listing.class.id}
              pilatesClass={listing.class}
              instructor={listing.instructor}
              onPurchase={() => handlePurchase(listing)}
              isPurchasing={isPurchasing === listing.class.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
