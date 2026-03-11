import { describe, it, expect } from "vitest";
import { cn, formatDuration, formatXion, uxionToXion, xionToUxion, formatUsdc, truncateAddress, slugify } from "./utils";

describe("cn (className merger)", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("merges tailwind conflicts", () => {
    // twMerge should resolve conflicts
    const result = cn("p-4", "p-2");
    expect(result).toBe("p-2");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });
});

describe("web utils (shared functions)", () => {
  it("formatDuration works", () => {
    expect(formatDuration(65)).toBe("1:05");
  });

  it("formatXion works", () => {
    expect(formatXion(1000000)).toBe("1.00");
  });

  it("uxionToXion works", () => {
    expect(uxionToXion(1_000_000)).toBe(1);
  });

  it("xionToUxion works", () => {
    expect(xionToUxion(1)).toBe(1_000_000);
  });

  it("formatUsdc works", () => {
    expect(formatUsdc(4.99)).toBe("4.99");
  });

  it("truncateAddress works", () => {
    const addr = "xion1fprvv0mmwz59u7ex6megtsku0h0ty3n3tyak55wc2u4e68zn78tq22wyf6";
    expect(truncateAddress(addr, 4)).toBe("xion...wyf6");
  });

  it("slugify works", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
  });
});
