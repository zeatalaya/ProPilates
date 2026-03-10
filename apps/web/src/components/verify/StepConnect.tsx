"use client";

import { useEffect } from "react";
import { LogIn, CheckCircle } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { useAuthStore } from "@/stores/auth";
import { useOAuth3 } from "@/hooks/useOAuth3";
import { useVerifyStore } from "@/stores/verify";
import { truncateAddress } from "@/lib/utils";

export function StepConnect() {
  const { isConnected, xionAddress } = useAuthStore();
  const { login } = useOAuth3();
  const setStep = useVerifyStore((s) => s.setStep);

  useEffect(() => {
    if (isConnected && xionAddress) {
      const timer = setTimeout(() => setStep("choosing"), 800);
      return () => clearTimeout(timer);
    }
  }, [isConnected, xionAddress, setStep]);

  return (
    <div className="flex justify-center py-12">
      <Card className="w-full max-w-md text-center">
        <CardBody className="flex flex-col items-center gap-6 py-10">
          {isConnected && xionAddress ? (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-emerald-400">
                  Account Connected
                </p>
                <p className="mt-1 font-mono text-sm text-text-muted">
                  {truncateAddress(xionAddress, 12)}
                </p>
              </div>
              <p className="text-sm text-text-secondary">
                Proceeding to provider selection...
              </p>
            </>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/15">
                <LogIn size={32} className="text-violet-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Connect Your Account</h3>
                <p className="mt-1 text-sm text-text-secondary">
                  Sign in to start the verification process. Your credential
                  badge will be linked to your account.
                </p>
              </div>
              <button className="btn-primary w-full" onClick={() => login()}>
                <LogIn size={16} />
                Sign In
              </button>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
