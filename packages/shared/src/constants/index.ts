import type { PilatesMethod, ExerciseCategory, Difficulty } from "../types";

export const MOBILE_METHODS: { value: PilatesMethod; label: string }[] = [
  { value: "mat", label: "Mat" },
  { value: "reformer", label: "Reformer" },
  { value: "x-reformer", label: "x-Reformer" },
];

export const ALL_METHODS: { value: PilatesMethod; label: string }[] = [
  { value: "mat", label: "Mat" },
  { value: "reformer", label: "Reformer" },
  { value: "x-reformer", label: "x-Reformer" },
];

export const CATEGORIES: { value: ExerciseCategory; label: string }[] = [
  { value: "warmup", label: "Warm Up" },
  { value: "strength", label: "Strength" },
  { value: "flexibility", label: "Flexibility" },
  { value: "balance", label: "Balance" },
  { value: "cooldown", label: "Cool Down" },
  { value: "flow", label: "Flow" },
  { value: "cardio", label: "Cardio" },
];

export const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const XION_TESTNET = {
  chainId: "xion-testnet-2",
  rpc: "https://rpc.xion-testnet-2.burnt.com:443",
  rest: "https://api.xion-testnet-2.burnt.com",
  devPortal: "https://dev.testnet2.burnt.com",
  faucet: "https://faucet.xion-testnet-2.burnt.com",
  explorer: "https://www.mintscan.io/xion-testnet",
};

export const DURATION_PRESETS = [30, 45, 60, 90, 120];
