import { useEffect, useState, useCallback, useRef } from "react";
import { ENV } from "../lib/config";

export function useUsdcBalance(address: string | null) {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setBalance(null);
      setError(null);
      return;
    }

    // Cancel any in-flight request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${ENV.XION_REST}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${ENV.USDC_DENOM}`,
        { signal: controller.signal },
      );
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      const amount = parseInt(data.balance?.amount ?? "0", 10);
      setBalance(amount / 1_000_000);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError(err?.message ?? "Failed to fetch balance");
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (!address) {
      setBalance(null);
      setError(null);
      return;
    }

    fetchBalance();
    const interval = setInterval(fetchBalance, 30_000);
    return () => {
      clearInterval(interval);
      abortControllerRef.current?.abort();
    };
  }, [fetchBalance, address]);

  return { balance, isLoading, error, refetch: fetchBalance };
}
