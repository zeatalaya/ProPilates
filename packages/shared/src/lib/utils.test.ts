import { describe, it, expect } from "vitest";
import {
  formatDuration,
  formatXion,
  uxionToXion,
  xionToUxion,
  formatUsdc,
  truncateAddress,
  slugify,
  isValidXionAddress,
  clamp,
} from "./utils";

describe("formatDuration", () => {
  it("formats 0 seconds", () => {
    expect(formatDuration(0)).toBe("0:00");
  });

  it("formats seconds only", () => {
    expect(formatDuration(5)).toBe("0:05");
    expect(formatDuration(30)).toBe("0:30");
    expect(formatDuration(59)).toBe("0:59");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(60)).toBe("1:00");
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(125)).toBe("2:05");
    expect(formatDuration(3600)).toBe("60:00");
  });

  it("pads seconds with leading zero", () => {
    expect(formatDuration(61)).toBe("1:01");
    expect(formatDuration(609)).toBe("10:09");
  });
});

describe("formatXion", () => {
  it("converts uxion string to readable format", () => {
    expect(formatXion("1000000")).toBe("1.00");
    expect(formatXion("500000")).toBe("0.50");
    expect(formatXion("1500000")).toBe("1.50");
  });

  it("converts uxion number to readable format", () => {
    expect(formatXion(1000000)).toBe("1.00");
    expect(formatXion(250000)).toBe("0.25");
  });

  it("handles zero", () => {
    expect(formatXion(0)).toBe("0.00");
    expect(formatXion("0")).toBe("0.00");
  });
});

describe("uxionToXion", () => {
  it("converts micro to standard denomination", () => {
    expect(uxionToXion(1_000_000)).toBe(1);
    expect(uxionToXion(5_500_000)).toBe(5.5);
    expect(uxionToXion(0)).toBe(0);
  });
});

describe("xionToUxion", () => {
  it("converts standard to micro denomination", () => {
    expect(xionToUxion(1)).toBe(1_000_000);
    expect(xionToUxion(5.5)).toBe(5_500_000);
    expect(xionToUxion(0)).toBe(0);
  });

  it("floors the result", () => {
    expect(xionToUxion(1.0000001)).toBe(1_000_000);
  });
});

describe("formatUsdc", () => {
  it("formats number to 2 decimal places", () => {
    expect(formatUsdc(4.99)).toBe("4.99");
    expect(formatUsdc(10)).toBe("10.00");
    expect(formatUsdc(0.1)).toBe("0.10");
  });

  it("formats string to 2 decimal places", () => {
    expect(formatUsdc("4.99")).toBe("4.99");
    expect(formatUsdc("10")).toBe("10.00");
  });
});

describe("truncateAddress", () => {
  it("truncates address with default chars", () => {
    const addr = "xion1fprvv0mmwz59u7ex6megtsku0h0ty3n3tyak55wc2u4e68zn78tq22wyf6";
    const result = truncateAddress(addr);
    expect(result).toBe("xion1fpr...tq22wyf6");
    expect(result.length).toBeLessThan(addr.length);
  });

  it("truncates with custom char count", () => {
    const addr = "xion1fprvv0mmwz59u7ex6megtsku0h0ty3n3tyak55wc2u4e68zn78tq22wyf6";
    const result = truncateAddress(addr, 4);
    expect(result).toBe("xion...wyf6");
  });
});

describe("slugify", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("Mat Pilates #1!")).toBe("mat-pilates-1");
  });

  it("removes leading and trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello");
    expect(slugify("  spaces  ")).toBe("spaces");
  });

  it("collapses multiple separators", () => {
    expect(slugify("a   b   c")).toBe("a-b-c");
    expect(slugify("a---b---c")).toBe("a-b-c");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});

describe("isValidXionAddress", () => {
  it("accepts valid xion addresses", () => {
    expect(isValidXionAddress("xion1fprvv0mmwz59u7ex6megtsku0h0ty3n3tyak55wc2u4e68zn78tq22wyf6")).toBe(true);
  });

  it("rejects invalid addresses", () => {
    expect(isValidXionAddress("")).toBe(false);
    expect(isValidXionAddress("cosmos1abc")).toBe(false);
    expect(isValidXionAddress("xion1")).toBe(false);
    expect(isValidXionAddress("xion1ABC")).toBe(false);
    expect(isValidXionAddress("not-an-address")).toBe(false);
  });

  it("rejects demo addresses", () => {
    expect(isValidXionAddress("xion1demo123")).toBe(false);
  });
});

describe("clamp", () => {
  it("clamps value to range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("handles edge values", () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
});
