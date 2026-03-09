"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  MapPin,
  Globe,
  Award,
  ShieldCheck,
  Zap,
  Crown,
  Loader2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { supabase } from "@/lib/supabase";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { truncateAddress } from "@/lib/utils";
import { PremiumCheckout } from "@/components/profile/PremiumCheckout";
import type { Verification, Subscription } from "@/types";

export default function ProfilePage() {
  const { instructor, xionAddress, tier, isConnected, setInstructor } = useAuthStore();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore instructor from Supabase when xionAddress is available but instructor is null
  // (happens after page refresh — useOAuth3 restores xionAddress from localStorage but
  //  instructor data is only in Zustand memory)
  useEffect(() => {
    if (instructor || !xionAddress) return;
    async function restoreInstructor() {
      try {
        const { data } = await supabase
          .from("instructors")
          .select("*")
          .eq("xion_address", xionAddress)
          .maybeSingle();
        if (data) {
          setInstructor(data);
        }
      } catch (err) {
        console.error("Failed to restore instructor:", err);
      }
    }
    restoreInstructor();
  }, [instructor, xionAddress, setInstructor]);

  useEffect(() => {
    if (!instructor) return;
    async function load() {
      const [vRes, sRes] = await Promise.all([
        supabase
          .from("verifications")
          .select("*")
          .eq("instructor_id", instructor!.id),
        supabase
          .from("subscriptions")
          .select("*")
          .eq("instructor_id", instructor!.id)
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (vRes.data) setVerifications(vRes.data);
      if (sRes.data) setSubscription(sRes.data);

      // Fetch USDC balance via XION REST
      if (xionAddress) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_XION_REST}/cosmos/bank/v1beta1/balances/${xionAddress}`,
          );
          const data = await res.json();
          const usdcDenom = process.env.NEXT_PUBLIC_USDC_DENOM ?? "ibc/usdc";
          const usdc = data?.balances?.find(
            (b: any) => b.denom === usdcDenom,
          );
          setBalance(usdc ? (parseInt(usdc.amount) / 1_000_000).toFixed(2) : "0.00");
        } catch {
          setBalance("—");
        }
      }
      setIsLoading(false);
    }
    load();
  }, [instructor, xionAddress]);

  if (!instructor && !isConnected) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <User size={48} className="mx-auto mb-4 text-text-muted opacity-30" />
          <p className="text-text-muted">Connect your wallet to view profile.</p>
        </div>
      </div>
    );
  }

  if (!instructor || isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 size={24} className="animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Profile header */}
      <div className="mb-8 flex items-start gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-600/20 text-3xl font-bold text-violet-400">
          {instructor.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{instructor.name}</h1>
            <Badge variant={tier === "premium" ? "violet" : "gray"}>
              <Crown size={12} className="mr-1" />
              {tier === "premium" ? "Premium" : "Free"}
            </Badge>
          </div>
          {instructor.bio && (
            <p className="mt-2 text-text-secondary">{instructor.bio}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-text-muted">
            {instructor.location && (
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {instructor.location}
              </span>
            )}
            {instructor.languages.length > 0 && (
              <span className="flex items-center gap-1">
                <Globe size={14} /> {instructor.languages.join(", ")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* USDC Balance */}
        <Card>
          <CardHeader>
            <h3 className="flex items-center gap-2 font-semibold">
              <Zap size={16} className="text-emerald-400" /> USDC Balance
            </h3>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-bold">
              ${balance ?? "—"}{" "}
              <span className="text-lg text-text-secondary">USDC</span>
            </div>
            {xionAddress && (
              <div className="mt-2 font-mono text-xs text-text-muted">
                {truncateAddress(xionAddress, 12)}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <h3 className="flex items-center gap-2 font-semibold">
              <Crown size={16} className="text-violet-400" /> Subscription
            </h3>
          </CardHeader>
          <CardBody>
            {subscription ? (
              <div>
                <Badge variant="emerald" className="mb-2">
                  Active
                </Badge>
                <div className="text-sm text-text-secondary">
                  Since{" "}
                  {new Date(subscription.started_at).toLocaleDateString()}
                </div>
                {subscription.expires_at && (
                  <div className="text-sm text-text-muted">
                    Expires{" "}
                    {new Date(subscription.expires_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            ) : (
              <PremiumCheckout instructorId={instructor.id} />
            )}
          </CardBody>
        </Card>

        {/* Verifications / Certifications */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold">
              <ShieldCheck size={16} className="text-violet-400" />{" "}
              Certifications
            </h3>
            <Link href="/verify" className="btn-ghost text-sm">
              Verify More
            </Link>
          </CardHeader>
          <CardBody>
            {verifications.length === 0 ? (
              <div className="rounded-lg border border-dashed border-violet-500/30 bg-violet-500/5 p-6 text-center">
                <ShieldCheck
                  size={40}
                  className="mx-auto mb-3 text-violet-400"
                />
                <h4 className="mb-2 font-semibold text-text-primary">
                  Verify Your Credentials
                </h4>
                <p className="mx-auto mb-4 max-w-md text-sm text-text-secondary">
                  Use Reclaim Protocol to verify your Pilates certifications
                  on-chain with zero-knowledge proofs. Verified credentials
                  build trust with clients and unlock marketplace features.
                </p>
                <Link
                  href="/verify"
                  className="btn-primary inline-flex items-center gap-2 text-sm"
                >
                  <ShieldCheck size={16} />
                  Verify Your Certifications
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {verifications.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <ShieldCheck size={20} className="text-emerald-400" />
                    <div className="flex-1">
                      <div className="font-medium capitalize">
                        {v.provider.replace("_", " ")}
                      </div>
                      <div className="text-xs text-text-muted">
                        {v.on_chain ? "Verified on-chain" : "Pending on-chain"}{" "}
                        &middot;{" "}
                        {new Date(v.verified_at).toLocaleDateString()}
                      </div>
                    </div>
                    {!v.on_chain && (
                      <Link
                        href="/verify"
                        className="text-xs text-violet-400 hover:text-violet-300"
                      >
                        Verify on-chain
                        <ExternalLink size={10} className="ml-1 inline" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Methods & Practice */}
        <Card className="md:col-span-2">
          <CardHeader>
            <h3 className="flex items-center gap-2 font-semibold">
              <Award size={16} className="text-violet-400" /> Practice Details
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <div className="mb-1 text-sm text-text-muted">Methods</div>
                <div className="flex flex-wrap gap-2">
                  {instructor.methods.map((m) => (
                    <Badge key={m} variant="violet">
                      {m}
                    </Badge>
                  ))}
                </div>
              </div>
              {instructor.class_types && instructor.class_types.length > 0 && (
                <div>
                  <div className="mb-1 text-sm text-text-muted">
                    Class Types
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {instructor.class_types.map((ct) => (
                      <Badge key={ct} variant="blue">
                        {ct}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {instructor.music_style && (
                <div>
                  <div className="mb-1 text-sm text-text-muted">
                    Music Preferences
                  </div>
                  <div className="text-sm text-text-secondary">
                    {instructor.music_style}
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
