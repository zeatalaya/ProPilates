"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { StepPersonal } from "@/components/onboarding/StepPersonal";
import { StepPractice } from "@/components/onboarding/StepPractice";
import { StepMusic } from "@/components/onboarding/StepMusic";
import { StepConfirmation } from "@/components/onboarding/StepConfirmation";
import { useAuthStore } from "@/stores/auth";
import { useOAuth3 } from "@/hooks/useOAuth3";
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

/** SessionStorage key for persisting form data across OAuth redirect */
const PENDING_ONBOARDING_KEY = "propilates_pending_onboarding";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { xionAddress, isConnected, isLoading, setInstructor } = useAuthStore();
  const { login, isOAuth3Configured } = useOAuth3();
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
  const hasSavedPending = useRef(false);

  // Detect if we're returning from an OAuth callback
  const oauthResult = searchParams.get("oauth_result");
  const isOAuthCallback = oauthResult === "code" || oauthResult === "success";
  const isOAuthError = oauthResult === "error";
  const oauthErrorMsg = searchParams.get("error");

  // Track whether we're waiting for the OAuth exchange to complete
  const [waitingForAuth, setWaitingForAuth] = useState(isOAuthCallback);

  // Once connected after OAuth callback, save pending onboarding data
  useEffect(() => {
    if (isConnected && waitingForAuth) {
      setWaitingForAuth(false);

      // Check for pending onboarding data saved before the OAuth redirect
      const pendingRaw = sessionStorage.getItem(PENDING_ONBOARDING_KEY);
      if (pendingRaw && !hasSavedPending.current) {
        hasSavedPending.current = true;
        try {
          const pendingData: OnboardingData = JSON.parse(pendingRaw);
          sessionStorage.removeItem(PENDING_ONBOARDING_KEY);
          // Auto-save profile with the real XION address
          saveProfile(pendingData);
        } catch {
          sessionStorage.removeItem(PENDING_ONBOARDING_KEY);
        }
      }
    }
  }, [isConnected, waitingForAuth]);

  // Handle Spotify callback return to onboarding
  useEffect(() => {
    if (searchParams.get("spotify_connected") === "true") {
      setData((prev) => ({ ...prev, spotifyConnected: true }));
      setCurrentStep(2);
      window.history.replaceState({}, "", "/onboarding");
    }
  }, [searchParams]);

  /** Save profile to Supabase (or local in demo mode) and redirect to builder */
  const saveProfile = useCallback(
    async (profileData: OnboardingData) => {
      setIsSubmitting(true);
      try {
        const address = useAuthStore.getState().xionAddress;
        if (isSupabaseConfigured) {
          const location = [profileData.city, profileData.country]
            .filter(Boolean)
            .join(", ");
          const { data: instructor, error } = await supabase
            .from("instructors")
            .upsert(
              {
                xion_address: address,
                name: profileData.name,
                bio: profileData.bio,
                location,
                languages: profileData.languages,
                methods: profileData.methods,
                class_types: profileData.classTypes,
                equipment: [],
                certifications: [],
                music_style: profileData.musicGenres.join(", "),
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
          const location = [profileData.city, profileData.country]
            .filter(Boolean)
            .join(", ");
          setInstructor({
            id: crypto.randomUUID(),
            xion_address: address || "demo-address",
            name: profileData.name,
            bio: profileData.bio,
            avatar_url: null,
            location,
            languages: profileData.languages,
            methods: profileData.methods,
            class_types: profileData.classTypes,
            equipment: [],
            certifications: [],
            music_style: profileData.musicGenres.join(", "),
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
        setIsSubmitting(false);
      }
    },
    [router, setInstructor],
  );

  /**
   * Called when user clicks "Create Profile" on step 4.
   *
   * Checks for a real xionAddress (not just isConnected) to decide whether
   * to call login(). This prevents saving with a null address if isConnected
   * is stale or set without a corresponding session.
   */
  async function handleComplete() {
    const currentAddress = useAuthStore.getState().xionAddress;

    if (currentAddress) {
      // Already have a real XION address — save directly
      await saveProfile(data);
      return;
    }

    if (!isOAuth3Configured) {
      // Demo mode: login() creates a demo address synchronously
      await login();
      await saveProfile(data);
      return;
    }

    // OAuth mode: save form data to sessionStorage, then redirect to Abstraxion
    // After OAuth, the callback returns to /onboarding and the useEffect above
    // detects the pending data and auto-saves.
    sessionStorage.setItem(PENDING_ONBOARDING_KEY, JSON.stringify(data));
    await login();
    // login() sets window.location.href, so execution stops here
  }

  function updateData(partial: Partial<OnboardingData>) {
    setData((prev) => ({ ...prev, ...partial }));
  }

  function next() {
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
  }
  function prev() {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }

  // Show loading while auth store initializes
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <Loader2 size={32} className="animate-spin text-violet-400" />
      </div>
    );
  }

  // Show loading while OAuth exchange is in progress (returning from Abstraxion)
  if (waitingForAuth || (isOAuthCallback && isSubmitting)) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <Loader2 size={32} className="animate-spin text-violet-400" />
        <p className="text-lg font-medium">Setting up your account...</p>
        <p className="text-sm text-text-secondary">
          Creating your account and setting up permissions
        </p>
      </div>
    );
  }

  // Show error if OAuth failed
  if (isOAuthError) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <AlertCircle size={48} className="text-red-400" />
        <p className="text-lg font-medium">Authentication Failed</p>
        <p className="max-w-md text-center text-sm text-text-secondary">
          {oauthErrorMsg ||
            "Something went wrong during authentication. Please try again."}
        </p>
        <button
          onClick={() => router.replace("/")}
          className="btn-primary mt-4 px-6 py-2"
        >
          Back to Home
        </button>
      </div>
    );
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
