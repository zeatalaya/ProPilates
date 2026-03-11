"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, DollarSign, Trash2, Loader2, FolderOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth";
import { CONTRACTS } from "@/lib/xion-transactions";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDuration, formatUsdc } from "@/lib/utils";
import type { PilatesClass } from "@/types";

export default function PortfolioPage() {
  const { instructor, tier, oauthAccessToken, xionAddress } = useAuthStore();
  const [classes, setClasses] = useState<PilatesClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isListing, setIsListing] = useState(false);

  useEffect(() => {
    if (!instructor) return;
    async function load() {
      const { data } = await supabase
        .from("classes")
        .select("*")
        .eq("instructor_id", instructor!.id)
        .order("updated_at", { ascending: false });
      if (data) setClasses(data as PilatesClass[]);
      setIsLoading(false);
    }
    load();
  }, [instructor]);

  async function togglePublic(cls: PilatesClass) {
    const { error } = await supabase
      .from("classes")
      .update({ is_public: !cls.is_public })
      .eq("id", cls.id);
    if (!error) {
      setClasses((prev) =>
        prev.map((c) =>
          c.id === cls.id ? { ...c, is_public: !c.is_public } : c,
        ),
      );
    }
  }

  async function setPrice(cls: PilatesClass) {
    const input = prompt("Set price in USD (0 for free):");
    if (input === null) return;
    const price = parseFloat(input) || 0;
    const { error } = await supabase
      .from("classes")
      .update({ price })
      .eq("id", cls.id);
    if (!error) {
      setClasses((prev) =>
        prev.map((c) => (c.id === cls.id ? { ...c, price } : c)),
      );
    }
  }

  async function handleListOnMarketplace(cls: PilatesClass) {
    if (!xionAddress || !cls.price || !instructor) return;
    setIsListing(true);
    try {
      const tokenId = `propilates-${cls.id}-${Date.now()}`;
      const priceUsdc = String(Math.floor(cls.price * 1_000_000));

      // Check if contracts are configured (production mode)
      if (CONTRACTS.nft && CONTRACTS.marketplace) {
        // Server-side: mint NFT + approve marketplace + list — all atomic
        const res = await fetch("/api/nft/mint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenId,
            priceAmount: priceUsdc,
            metadata: {
              class_id: cls.id,
              title: cls.title,
              description: cls.description,
              method: cls.method,
              difficulty: cls.difficulty,
              duration_minutes: cls.duration_minutes,
              instructor_id: instructor.id,
            },
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error);
        }

        // Record listing in Supabase for marketplace display
        await supabase.from("classes").update({
          token_id: tokenId,
        }).eq("id", cls.id);

        alert("Listed successfully on the marketplace!");
      } else {
        // Demo mode — contracts not deployed yet
        console.log("Demo mode — listing:", { tokenId, priceUsdc, cls });
        await new Promise((r) => setTimeout(r, 1000));
        alert("Listed on marketplace! (demo mode — contracts not yet deployed)");
      }
    } catch (err: any) {
      alert(`Listing failed: ${err.message}`);
    } finally {
      setIsListing(false);
    }
  }

  async function handleDelete(classId: string) {
    if (!confirm("Delete this class? This cannot be undone.")) return;
    const { error } = await supabase.from("classes").delete().eq("id", classId);
    if (!error) {
      setClasses((prev) => prev.filter((c) => c.id !== classId));
    }
  }

  if (!instructor) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-text-muted">Sign in to view your portfolio.</p>
      </div>
    );
  }

  if (tier === "free") {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <FolderOpen size={48} className="mx-auto mb-4 text-text-muted opacity-30" />
          <h2 className="text-xl font-bold">Premium Required</h2>
          <p className="mt-2 text-text-secondary">
            Upgrade to premium to save and monetize your classes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Portfolio</h1>
        <p className="mt-2 text-text-secondary">
          Manage your saved classes, set visibility, and list on the
          marketplace.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-violet-400" />
        </div>
      ) : classes.length === 0 ? (
        <div className="py-24 text-center">
          <FolderOpen size={48} className="mx-auto mb-4 text-text-muted opacity-30" />
          <p className="text-text-muted">
            No saved classes yet. Build your first class!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Card key={cls.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <h3 className="font-semibold">{cls.title}</h3>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="violet">{cls.method}</Badge>
                    <Badge variant="gray">{cls.difficulty}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {cls.is_public ? (
                    <Badge variant="emerald">Public</Badge>
                  ) : (
                    <Badge variant="gray">Private</Badge>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                <p className="mb-4 text-sm text-text-secondary line-clamp-2">
                  {cls.description || "No description"}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="btn-ghost text-xs"
                    onClick={() => togglePublic(cls)}
                  >
                    {cls.is_public ? (
                      <EyeOff size={14} />
                    ) : (
                      <Eye size={14} />
                    )}
                    {cls.is_public ? "Make Private" : "Make Public"}
                  </button>
                  <button
                    className="btn-ghost text-xs"
                    onClick={() => setPrice(cls)}
                  >
                    <DollarSign size={14} />
                    {cls.price != null
                      ? `$${formatUsdc(cls.price)}`
                      : "Set Price"}
                  </button>
                  {cls.is_public && cls.price != null && cls.price > 0 && (
                    <button
                      className="btn-primary text-xs"
                      onClick={() => handleListOnMarketplace(cls)}
                      disabled={isListing}
                    >
                      {isListing && <Loader2 size={14} className="animate-spin" />}
                      List on Market
                    </button>
                  )}
                  <button
                    className="btn-ghost text-xs text-red-400"
                    onClick={() => handleDelete(cls.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
