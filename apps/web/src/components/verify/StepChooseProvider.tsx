"use client";

import { ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useVerifyStore } from "@/stores/verify";
import type { VerificationProvider } from "@/types";

interface ProviderOption {
  id: VerificationProvider;
  name: string;
  description: string;
  reclaimProviderId: string;
}

export const PROVIDERS: ProviderOption[] = [
  {
    id: "basi",
    name: "BASI Pilates",
    description:
      "Body Arts and Science International — comprehensive Pilates education.",
    reclaimProviderId: "basi-certification-provider",
  },
  {
    id: "stott",
    name: "STOTT PILATES",
    description:
      "Merrithew's contemporary approach to Pilates exercise.",
    reclaimProviderId: "stott-certification-provider",
  },
  {
    id: "balanced_body",
    name: "Balanced Body",
    description:
      "Education and equipment for mind-body movement professionals.",
    reclaimProviderId: "balanced-body-certification-provider",
  },
  {
    id: "polestar",
    name: "Polestar Pilates",
    description: "Rehabilitation-based Pilates education.",
    reclaimProviderId: "polestar-certification-provider",
  },
];

export function StepChooseProvider() {
  const setProvider = useVerifyStore((s) => s.setProvider);

  return (
    <div className="py-6">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold">Select Your Certification</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Choose the certification body to verify your credentials against.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {PROVIDERS.map((provider) => (
          <Card
            key={provider.id}
            onClick={() => setProvider(provider.id, provider.name)}
            className="transition-all hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{provider.name}</h3>
                <Badge variant="violet">ZK Proof</Badge>
              </div>
            </CardHeader>
            <CardBody>
              <p className="mb-4 text-sm text-text-secondary">
                {provider.description}
              </p>
              <div className="flex items-center gap-2 text-sm text-violet-400">
                <ShieldCheck size={16} />
                Verify Credential
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
