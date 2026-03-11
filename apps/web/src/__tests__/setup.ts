// Mock localStorage for Node environment
if (typeof globalThis.localStorage === "undefined") {
  const store: Record<string, string> = {};
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    },
  });
}

import "@testing-library/jest-dom/vitest";

// Mock crypto.randomUUID for test environments
if (!globalThis.crypto?.randomUUID) {
  let counter = 0;
  Object.defineProperty(globalThis, "crypto", {
    value: {
      ...globalThis.crypto,
      randomUUID: () => `test-uuid-${++counter}`,
    },
  });
}

// Mock btoa for Node environment
if (typeof globalThis.btoa === "undefined") {
  globalThis.btoa = (str: string) => Buffer.from(str, "binary").toString("base64");
}

if (typeof globalThis.atob === "undefined") {
  globalThis.atob = (str: string) => Buffer.from(str, "base64").toString("binary");
}
