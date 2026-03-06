"use client";

import { useEffect, useState } from "react";
import { Search, ShoppingBag, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatXion } from "@/lib/utils";
import { MarketplaceListingCard } from "@/components/marketplace/ListingCard";
import type { PilatesClass, Instructor } from "@/types";

interface ListingWithDetails {
  class: PilatesClass;
  instructor: Instructor;
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<ListingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
