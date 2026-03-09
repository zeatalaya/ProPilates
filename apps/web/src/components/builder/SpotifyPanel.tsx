"use client";

import { useState, useEffect, useCallback } from "react";
import { useSpotifyStore } from "@/stores/spotify";
import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer";
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Wifi,
  ListMusic,
  Check,
  Loader2,
  Plus,
  X,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SpotifyPlaylist {
  id: string;
  name: string;
  images: { url: string }[];
  tracks: { href: string; total: number } | null;
  uri: string;
}

/** Helper: make a Spotify API request with automatic token refresh on 401 */
async function spotifyFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const store = useSpotifyStore.getState();
  const token = await store.getValidToken();
  if (!token) throw new Error("No Spotify token available");

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  // If 401, try refreshing the token once and retry
  if (res.status === 401) {
    console.log("[Spotify] Got 401, attempting token refresh...");
    const newToken = await store.refreshAccessToken();
    if (newToken) {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    }
  }

  return res;
}

export function SpotifyPanel() {
  const spotify = useSpotifyStore();
  const { togglePlay, nextTrack, previousTrack } = useSpotifyPlayer();
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [selectedPlaylistUri, setSelectedPlaylistUri] = useState<string | null>(
    null,
  );
  const [startingPlayback, setStartingPlayback] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user playlists when connected
  const fetchPlaylists = useCallback(async () => {
    if (!spotify.accessToken) return;
    setLoadingPlaylists(true);
    setError(null);
    try {
      const res = await spotifyFetch(
        "https://api.spotify.com/v1/me/playlists?limit=50",
      );
      if (res.ok) {
        const data = await res.json();
        setPlaylists(
          (data.items ?? []).filter(
            (p: SpotifyPlaylist | null) => p != null,
          ),
        );
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("[Spotify] Fetch playlists failed:", res.status, errData);
        if (res.status === 401) {
          setError("Session expired — please reconnect Spotify.");
        } else if (res.status === 403) {
          setError("Permission denied — please reconnect Spotify with updated permissions.");
        } else {
          setError(`Failed to load playlists (${res.status})`);
        }
      }
    } catch (err) {
      console.error("[Spotify] Fetch playlists error:", err);
      setError("Network error loading playlists.");
    } finally {
      setLoadingPlaylists(false);
    }
  }, [spotify.accessToken]);

  useEffect(() => {
    if (spotify.accessToken && spotify.isReady) {
      fetchPlaylists();
    }
  }, [spotify.accessToken, spotify.isReady, fetchPlaylists]);

  // Start playing a playlist on the ProPilates device
  const playPlaylist = async (uri: string) => {
    if (!spotify.accessToken || !spotify.deviceId) return;
    setStartingPlayback(true);
    setSelectedPlaylistUri(uri);
    setError(null);
    try {
      const res = await spotifyFetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${spotify.deviceId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ context_uri: uri }),
        },
      );
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.error("[Spotify] Play failed:", res.status, errText);
        let errMsg = "";
        try {
          const errJson = JSON.parse(errText);
          errMsg = errJson?.error?.message || errJson?.error?.reason || "";
        } catch {
          errMsg = errText;
        }
        if (res.status === 403) {
          setError(`Playback failed: ${errMsg || "permission denied — try reconnecting Spotify."}`);
        } else if (res.status === 404) {
          setError(`Player not found: ${errMsg || "try refreshing the page."}`);
        } else {
          setError(`Playback failed (${res.status}): ${errMsg}`);
        }
      }
    } catch (err) {
      console.error("[Spotify] Play error:", err);
      setError("Network error starting playback.");
    } finally {
      setStartingPlayback(false);
    }
  };

  // Create a new playlist
  const createPlaylist = async () => {
    if (!spotify.accessToken || !newPlaylistName.trim()) return;
    setCreatingPlaylist(true);
    setError(null);
    try {
      // Use POST /me/playlists (the /users/{id}/playlists endpoint is
      // deprecated for development-mode apps since the Feb 2026 API changes)
      const createRes = await spotifyFetch(
        "https://api.spotify.com/v1/me/playlists",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newPlaylistName.trim(),
            description: "Created with ProPilates",
            public: false,
          }),
        },
      );
      if (createRes.ok) {
        setNewPlaylistName("");
        setShowCreateForm(false);
        // Refresh playlists
        await fetchPlaylists();
      } else {
        const errText = await createRes.text().catch(() => "");
        console.error("[Spotify] Create playlist failed:", createRes.status, errText);
        let errMsg = "";
        try {
          const errJson = JSON.parse(errText);
          errMsg = errJson?.error?.message || errJson?.error?.reason || errText;
        } catch {
          errMsg = errText;
        }
        if (createRes.status === 403) {
          setError(`Permission denied: ${errMsg}`);
        } else {
          setError(`Failed to create playlist (${createRes.status}): ${errMsg}`);
        }
      }
    } catch (err) {
      console.error("[Spotify] Create playlist error:", err);
      setError("Network error creating playlist.");
    } finally {
      setCreatingPlaylist(false);
    }
  };

  // ── Not connected ──
  if (!spotify.accessToken) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Music size={16} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-text-secondary">Music</h3>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
            <Music size={24} className="text-emerald-400" />
          </div>
          <p className="text-sm text-text-secondary mb-3">
            Connect Spotify to play music during your class.
          </p>
          <a
            href="/api/auth/spotify"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
          >
            <Wifi size={14} />
            Connect Spotify
          </a>
        </div>
      </div>
    );
  }

  // ── Connecting (token present, SDK loading) ──
  if (!spotify.isReady) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Music size={16} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-text-secondary">Music</h3>
        </div>
        <div className="glass-card p-4 text-center">
          <Loader2 size={24} className="text-emerald-400 animate-spin mx-auto mb-2" />
          <p className="text-sm text-text-secondary">
            Connecting to Spotify...
          </p>
        </div>
      </div>
    );
  }

  // ── Connected ──
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Music size={16} className="text-emerald-400" />
        <h3 className="text-sm font-semibold text-text-secondary">Music</h3>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-emerald-400">Connected</span>
          <a
            href="/api/auth/spotify"
            onClick={() => spotify.reset()}
            className="ml-1 text-text-muted hover:text-text-secondary transition-colors"
            title="Reconnect Spotify"
          >
            <RefreshCw size={10} />
          </a>
        </div>
      </div>

      {/* Now Playing */}
      {spotify.currentTrack && (
        <div className="glass-card p-3 mb-3">
          <div className="flex items-center gap-3">
            {spotify.currentTrack.image_url && (
              <img
                src={spotify.currentTrack.image_url}
                alt=""
                className="w-10 h-10 rounded"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {spotify.currentTrack.name}
              </div>
              <div className="truncate text-xs text-text-muted">
                {spotify.currentTrack.artist}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-3">
            <button
              className="text-text-secondary hover:text-white transition-colors"
              onClick={previousTrack}
            >
              <SkipBack size={16} />
            </button>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
              onClick={togglePlay}
            >
              {spotify.isPlaying ? (
                <Pause size={14} />
              ) : (
                <Play size={14} className="ml-0.5" />
              )}
            </button>
            <button
              className="text-text-secondary hover:text-white transition-colors"
              onClick={nextTrack}
            >
              <SkipForward size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 mb-3">
          <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300">{error}</p>
          <button
            className="ml-auto text-red-400 hover:text-red-300 flex-shrink-0"
            onClick={() => setError(null)}
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Playlists */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <ListMusic size={14} className="text-text-muted" />
          <span className="text-xs font-medium text-text-secondary">
            Your Playlists
          </span>
          <div className="ml-auto flex items-center gap-1">
            {loadingPlaylists && (
              <Loader2 size={12} className="text-text-muted animate-spin" />
            )}
            <button
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              onClick={() => setShowCreateForm(!showCreateForm)}
              title="Create playlist"
            >
              {showCreateForm ? <X size={12} /> : <Plus size={12} />}
            </button>
          </div>
        </div>

        {/* Create Playlist Form */}
        {showCreateForm && (
          <div className="px-3 py-2 border-b border-border bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") createPlaylist();
                  if (e.key === "Escape") {
                    setShowCreateForm(false);
                    setNewPlaylistName("");
                  }
                }}
                className="flex-1 rounded bg-bg border border-border px-2 py-1 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-emerald-500"
                autoFocus
                disabled={creatingPlaylist}
              />
              <button
                className="flex items-center gap-1 rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
                onClick={createPlaylist}
                disabled={!newPlaylistName.trim() || creatingPlaylist}
              >
                {creatingPlaylist ? (
                  <Loader2 size={10} className="animate-spin" />
                ) : (
                  <Plus size={10} />
                )}
                Create
              </button>
            </div>
          </div>
        )}
        <div className="max-h-48 overflow-y-auto">
          {playlists.length === 0 && !loadingPlaylists && (
            <div className="px-3 py-4 text-center text-xs text-text-muted">
              No playlists found
            </div>
          )}
          {playlists.map((pl) => {
            const isActive = selectedPlaylistUri === pl.uri;
            return (
              <button
                key={pl.id}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors",
                  isActive && "bg-emerald-500/10",
                )}
                onClick={() => playPlaylist(pl.uri)}
                disabled={startingPlayback}
              >
                {pl.images?.[0] ? (
                  <img
                    src={pl.images[0].url}
                    alt=""
                    className="w-8 h-8 rounded"
                  />
                ) : (
                  <div className="w-8 h-8 rounded bg-bg flex items-center justify-center">
                    <Music size={12} className="text-text-muted" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {pl.name}
                  </div>
                  <div className="text-xs text-text-muted">
                    {typeof pl.tracks?.total === "number"
                      ? `${pl.tracks.total} tracks`
                      : "Playlist"}
                  </div>
                </div>
                {isActive && (
                  <Check size={14} className="text-emerald-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
