export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatXion(uxion: string | number): string {
  const amount = typeof uxion === "string" ? parseInt(uxion, 10) : uxion;
  return (amount / 1_000_000).toFixed(2);
}

export function uxionToXion(uxion: number): number {
  return uxion / 1_000_000;
}

export function xionToUxion(xion: number): number {
  return Math.floor(xion * 1_000_000);
}

export function formatUsdc(amount: string | number): string {
  const val = typeof amount === "string" ? parseFloat(amount) : amount;
  return val.toFixed(2);
}

export function truncateAddress(address: string, chars = 8): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
