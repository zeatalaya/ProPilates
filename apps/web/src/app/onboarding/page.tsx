"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  location: string;
  languages: string[];
  // Step 2
  methods: PilatesMethod[];
  classTypes: ClassType[];
  equipment: string[];
  certifications: string[];
  // Step 3
  musicStyle: string;
  favoriteArtists: string[];
}

const steps = ["Personal", "Practice", "Music", "Confirm"];

export default function OnboardingPage() {
  const router = useRouter();
  const { xionAddress, setInstructor } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: "",
    bio: "",
    location: "",
    languages: [],
    methods: [],
    classTypes: [],
    equipment: [],
    certifications: [],
    musicStyle: "",
    favoriteArtists: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        const { data: instructor, error } = await supabase
          .from("instructors")
          .upsert(
            {
              xion_address: xionAddress,
              name: data.name,
              bio: data.bio,
              location: data.location,
              languages: data.languages,
              methods: data.methods,
              class_types: data.classTypes,
              equipment: data.equipment,
              certifications: data.certifications,
              music_style: data.musicStyle,
              favorite_artists: data.favoriteArtists,
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
        setInstructor({
          id: crypto.randomUUID(),
          xion_address: xionAddress || "demo-address",
          name: data.name,
          bio: data.bio,
          avatar_url: null,
          location: data.location,
          languages: data.languages,
          methods: data.methods,
          class_types: data.classTypes,
          equipment: data.equipment,
          certifications: data.certifications,
          music_style: data.musicStyle,
          favorite_artists: data.favoriteArtists,
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
