"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, DollarSign, Trash2, Loader2, FolderOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDuration, formatXion, xionToUxion } from "@/lib/utils";
import {
  buildMintAndListMsg,
  buildDelistMsg,
} from "@/contracts/marketplace";
import type { PilatesClass } from "@/types";

export default function PortfolioPage() {
  const { instructor, tier } = useAuthStore();
  const [classes, setClasses] = useState<PilatesClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    const input = prompt("Set price in XION (0 for free):");
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
    if (!instructor || !cls.price) return;
    const msg = buildMintAndListMsg(
      instructor.xion_address ?? "",
      cls.id,
      String(xionToUxion(cls.price)),
      {
        title: cls.title,
        description: cls.description,
        method: cls.method,
        difficulty: cls.difficulty,
        duration_minutes: cls.duration_minutes,
      },
    );
    // In production, execute via Abstraxion's useAbstraxionSigningClient
    console.log("Marketplace list msg:", msg);
    alert("Listing transaction prepared. Connect wallet to sign.");
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
        <p className="text-text-muted">Connect your wallet to view portfolio.</p>
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
                      ? `${formatXion(cls.price)} XION`
                      : "Set Price"}
                  </button>
                  {cls.is_public && cls.price != null && cls.price > 0 && (
                    <button
                      className="btn-primary text-xs"
                      onClick={() => handleListOnMarketplace(cls)}
                    >
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
