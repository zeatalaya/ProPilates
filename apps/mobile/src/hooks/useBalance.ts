import { useEffect, useState, useCallback } from "react";
import { ENV } from "../lib/config";

export function useUsdcBalance(address: string | null) {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setBalance(null);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(
        `${ENV.XION_REST}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${ENV.USDC_DENOM}`,
      );
      const data = await res.json();
      const amount = parseInt(data.balance?.amount ?? "0", 10);
      setBalance(amount / 1_000_000);
    } catch {
      setBalance(0);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 30_000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  return { balance, isLoading, refetch: fetchBalance };
}
