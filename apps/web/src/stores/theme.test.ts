import { describe, it, expect, beforeEach } from "vitest";
import { useThemeStore } from "./theme";

describe("themeStore", () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: "dark" });
  });

  it("defaults to dark theme", () => {
    expect(useThemeStore.getState().theme).toBe("dark");
  });

  it("setTheme changes to light", () => {
    useThemeStore.getState().setTheme("light");
    expect(useThemeStore.getState().theme).toBe("light");
  });

  it("setTheme changes to system", () => {
    useThemeStore.getState().setTheme("system");
    expect(useThemeStore.getState().theme).toBe("system");
  });

  it("setTheme changes back to dark", () => {
    useThemeStore.getState().setTheme("light");
    useThemeStore.getState().setTheme("dark");
    expect(useThemeStore.getState().theme).toBe("dark");
  });
});
