"use client";

import { useState } from "react";
import type { OnboardingData } from "@/app/onboarding/page";
import { COUNTRIES, CITIES } from "@/data/countries-cities";

interface Props {
  data: OnboardingData;
  updateData: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
}

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Portuguese", "Italian",
  "Japanese", "Mandarin", "Korean", "Arabic", "Hindi", "Dutch",
];

export function StepPersonal({ data, updateData, onNext }: Props) {
  const [showOtherCity, setShowOtherCity] = useState(false);

  const canNext = data.name.trim().length > 0 && data.country.trim().length > 0;

  const citiesForCountry = data.country ? CITIES[data.country] ?? [] : [];

  function addLanguage(lang: string) {
    if (!data.languages.includes(lang)) {
      updateData({ languages: [...data.languages, lang] });
    }
  }

  function removeLanguage(lang: string) {
    updateData({ languages: data.languages.filter((l) => l !== lang) });
  }

  function handleCountryChange(country: string) {
    updateData({ country, city: "" });
    setShowOtherCity(false);
  }

  function handleCityChange(city: string) {
    if (city === "__other__") {
      setShowOtherCity(true);
      updateData({ city: "" });
    } else {
      setShowOtherCity(false);
      updateData({ city });
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Tell us about yourself</h2>
        <p className="text-text-secondary">
          Let&apos;s start with some basic info.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label-text mb-1.5 block">Name *</label>
          <input
            className="input-field"
            placeholder="Your full name"
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
          />
        </div>

        <div>
          <label className="label-text mb-1.5 block">Bio</label>
          <textarea
            className="input-field min-h-[100px] resize-none"
            placeholder="Tell clients about your teaching style and experience..."
            value={data.bio}
            onChange={(e) => updateData({ bio: e.target.value })}
          />
        </div>

        <div>
          <label className="label-text mb-1.5 block">Country *</label>
          <select
            className="input-field"
            value={data.country}
            onChange={(e) => handleCountryChange(e.target.value)}
          >
            <option value="">Select country...</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {data.country && (
          <div>
            <label className="label-text mb-1.5 block">City</label>
            {citiesForCountry.length > 0 ? (
              <>
                <select
                  className="input-field"
                  value={showOtherCity ? "__other__" : data.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                >
                  <option value="">Select city...</option>
                  {citiesForCountry.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                  <option value="__other__">Other...</option>
                </select>
                {showOtherCity && (
                  <input
                    className="input-field mt-2"
                    placeholder="Enter your city..."
                    value={data.city}
                    onChange={(e) => updateData({ city: e.target.value })}
                    autoFocus
                  />
                )}
              </>
            ) : (
              <input
                className="input-field"
                placeholder="Enter your city..."
                value={data.city}
                onChange={(e) => updateData({ city: e.target.value })}
              />
            )}
          </div>
        )}

        <div>
          <label className="label-text mb-1.5 block">Languages</label>
          <div className="mb-2 flex flex-wrap gap-2">
            {data.languages.map((lang) => (
              <span
                key={lang}
                className="badge-violet cursor-pointer"
                onClick={() => removeLanguage(lang)}
              >
                {lang} &times;
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.filter((l) => !data.languages.includes(l)).map(
              (lang) => (
                <button
                  key={lang}
                  onClick={() => addLanguage(lang)}
                  className="rounded-lg border border-border px-3 py-1 text-xs text-text-secondary transition-colors hover:border-violet-500 hover:text-violet-400"
                >
                  + {lang}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button className="btn-primary" onClick={onNext} disabled={!canNext}>
          Continue
        </button>
      </div>
    </div>
  );
}
