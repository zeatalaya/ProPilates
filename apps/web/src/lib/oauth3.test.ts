import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAuthorizeUrl,
  getLoginUrl,
  getLogoutUrl,
  isOAuth3Configured,
  exchangeCodeForTokens,
  getMetaAccount,
  getUserInfo,
  refreshAccessToken,
  proxyRequest,
  getAttestation,
  verifyGmail,
} from "./oauth3";

describe("oauth3", () => {
  describe("getAuthorizeUrl", () => {
    it("builds authorize URL with required params", () => {
      const url = getAuthorizeUrl("challenge123", "state456");
      expect(url).toContain("/oauth/authorize?");
      expect(url).toContain("response_type=code");
      expect(url).toContain("code_challenge=challenge123");
      expect(url).toContain("code_challenge_method=S256");
      expect(url).toContain("state=state456");
      expect(url).toContain("scope=");
    });

    it("includes provider param when specified", () => {
      const url = getAuthorizeUrl("ch", "st", "google");
      expect(url).toContain("provider=google");
    });

    it("omits provider param when not specified", () => {
      const url = getAuthorizeUrl("ch", "st");
      expect(url).not.toContain("provider=");
    });
  });

  describe("getLoginUrl", () => {
    it("builds login URL with provider", () => {
      const url = getLoginUrl("google");
      expect(url).toContain("/auth/google");
    });

    it("defaults to google provider", () => {
      const url = getLoginUrl();
      expect(url).toContain("/auth/google");
    });
  });

  describe("getLogoutUrl", () => {
    it("returns logout URL", () => {
      const url = getLogoutUrl();
      expect(url).toContain("/logout");
    });
  });

  describe("exchangeCodeForTokens", () => {
    it("posts to token endpoint and returns tokens", async () => {
      const mockTokens = {
        access_token: "at",
        refresh_token: "rt",
        token_type: "Bearer",
        expires_in: 3600,
      };
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTokens),
      });

      const result = await exchangeCodeForTokens("code123", "verifier456");
      expect(result).toEqual(mockTokens);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/oauth/token"),
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("throws on failure", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: false });
      await expect(exchangeCodeForTokens("bad", "bad")).rejects.toThrow(
        "Token exchange failed"
      );
    });
  });

  describe("getMetaAccount", () => {
    it("fetches meta account with bearer token", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: "xion1abc" }),
      });
      const result = await getMetaAccount("token");
      expect(result.id).toBe("xion1abc");
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/me"),
        expect.objectContaining({
          headers: { Authorization: "Bearer token" },
        }),
      );
    });

    it("throws on failure", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: false });
      await expect(getMetaAccount("bad")).rejects.toThrow(
        "Failed to fetch Meta Account info"
      );
    });
  });

  describe("getUserInfo (deprecated)", () => {
    it("delegates to getMetaAccount", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: "xion1abc" }),
      });
      const result = await getUserInfo("token");
      expect(result.id).toBe("xion1abc");
    });
  });

  describe("refreshAccessToken", () => {
    it("posts refresh token and returns new tokens", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ access_token: "new-at" }),
      });
      const result = await refreshAccessToken("rt");
      expect(result.access_token).toBe("new-at");
    });

    it("throws on failure", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: false });
      await expect(refreshAccessToken("bad")).rejects.toThrow(
        "Token refresh failed"
      );
    });
  });

  describe("proxyRequest", () => {
    it("proxies request through OAuth3 server", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: "result" }),
      });
      const result = await proxyRequest("token", "spotify", "me");
      expect(result.data).toBe("result");
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/proxy/spotify/me"),
        expect.any(Object),
      );
    });

    it("throws on failure", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
      });
      await expect(proxyRequest("t", "p", "path")).rejects.toThrow(
        "Proxy request failed: 403"
      );
    });
  });

  describe("getAttestation", () => {
    it("fetches attestation", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ attested: true }),
      });
      const result = await getAttestation();
      expect(result.attested).toBe(true);
    });

    it("throws on failure", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: false });
      await expect(getAttestation()).rejects.toThrow("Attestation fetch failed");
    });
  });

  describe("verifyGmail", () => {
    it("verifies gmail with bearer token", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ verified: true }),
      });
      const result = await verifyGmail("token");
      expect(result.verified).toBe(true);
    });

    it("throws on failure", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: false });
      await expect(verifyGmail("bad")).rejects.toThrow(
        "Gmail verification failed"
      );
    });
  });
});
