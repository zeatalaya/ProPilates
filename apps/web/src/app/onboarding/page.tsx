"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { StepPersonal } from "@/components/onboarding/StepPersonal";
import { StepPractice } from "@/components/onboarding/StepPractice";
import { StepMusic } from "@/components/onboarding/StepMusic";
import { StepConfirmation } from "@/components/onboarding/StepConfirmation";
import { useAuthStore } from "@/stores/auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { PilatesMethod, ClassType } from "@/types";

export interface OnboardingData {
  // Step 1
  name: string;
  bio: string;
  country: string;
  city: string;
  languages: string[];
  // Step 2
  methods: PilatesMethod[];
  classTypes: ClassType[];
  // Step 3
  musicGenres: string[];
  spotifyConnected: boolean;
}

const steps = ["Personal", "Practice", "Music", "Confirm"];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { xionAddress, setInstructor } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: "",
    bio: "",
    country: "",
    city: "",
    languages: [],
    methods: [],
    classTypes: [],
    musicGenres: [],
    spotifyConnected: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Spotify callback return to onboarding
  useEffect(() => {
    if (searchParams.get("spotify_connected") === "true") {
      setData((prev) => ({ ...prev, spotifyConnected: true }));
      setCurrentStep(2); // Go back to music step
      window.history.replaceState({}, "", "/onboarding");
    }
  }, [searchParams]);

  function updateData(partial: Partial<OnboardingData>) {
    setData((prev) => ({ ...prev, ...partial }));
  }

  function next() {
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
  }
  function prev() {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }

  async function handleComplete() {
    setIsSubmitting(true);
    try {
      if (isSupabaseConfigured) {
        const location = [data.city, data.country]
          .filter(Boolean)
          .join(", ");
        const { data: instructor, error } = await supabase
          .from("instructors")
          .upsert(
            {
              xion_address: xionAddress,
              name: data.name,
              bio: data.bio,
              location,
              languages: data.languages,
              methods: data.methods,
              class_types: data.classTypes,
              equipment: [],
              certifications: [],
              music_style: data.musicGenres.join(", "),
              favorite_artists: [],
              onboarding_complete: true,
            },
            { onConflict: "xion_address" },
          )
          .select()
          .single();

        if (error) throw error;
        setInstructor(instructor);
      } else {
        // Demo mode: store locally when Supabase is not configured
        const location = [data.city, data.country]
          .filter(Boolean)
          .join(", ");
        setInstructor({
          id: crypto.randomUUID(),
          xion_address: xionAddress || "demo-address",
          name: data.name,
          bio: data.bio,
          avatar_url: null,
          location,
          languages: data.languages,
          methods: data.methods,
          class_types: data.classTypes,
          equipment: [],
          certifications: [],
          music_style: data.musicGenres.join(", "),
          favorite_artists: [],
          onboarding_complete: true,
          tier: "free",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      router.push("/builder");
    } catch (err) {
      console.error("Onboarding failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Progress */}
      <div className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  i <= currentStep
                    ? "bg-violet-600 text-white"
                    : "bg-bg-elevated text-text-muted"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`hidden text-sm sm:block ${
                  i <= currentStep ? "text-text-primary" : "text-text-muted"
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-bg-elevated">
          <div
            className="h-full rounded-full bg-violet-600 transition-all duration-500"
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Steps */}
      {currentStep === 0 && (
        <StepPersonal data={data} updateData={updateData} onNext={next} />
      )}
      {currentStep === 1 && (
        <StepPractice
          data={data}
          updateData={updateData}
          onNext={next}
          onPrev={prev}
        />
      )}
      {currentStep === 2 && (
        <StepMusic
          data={data}
          updateData={updateData}
          onNext={next}
          onPrev={prev}
        />
      )}
      {currentStep === 3 && (
        <StepConfirmation
          data={data}
          onPrev={prev}
          onComplete={handleComplete}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 size={24} className="animate-spin text-violet-400" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
