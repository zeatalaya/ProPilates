"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  Search,
  ChevronUp,
  ChevronDown,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SpotifyPlaylist {
  id: string;
  name: string;
  images: { url: string }[];
  tracks: { href: string; total: number } | null;
  uri: string;
}

interface SpotifySearchTrack {
  id: string;
  name: string;
  uri: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  duration_ms: number;
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

function formatDuration(ms: number) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function parseSpotifyError(status: number, errText: string): string {
  let errMsg = "";
  try {
    const errJson = JSON.parse(errText);
    errMsg = errJson?.error?.message || errJson?.error?.reason || "";
  } catch {
    errMsg = errText;
  }
  if (errMsg.includes("Restriction violated")) {
    return "This playlist is empty — add songs first.";
  }
  if (errMsg.includes("Premium required")) {
    return "Spotify Premium is required for playback.";
  }
  return errMsg;
}

export function SpotifyPanel() {
  const spotify = useSpotifyStore();
  const { togglePlay, nextTrack, previousTrack, setPlayerVolume } =
    useSpotifyPlayer();
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
  const [expanded, setExpanded] = useState(false);

  // Song search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotifySearchTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingTrackId, setAddingTrackId] = useState<string | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedPlaylistId = selectedPlaylistUri
    ? selectedPlaylistUri.split(":").pop() ?? null
    : null;

  const selectedPlaylistName = selectedPlaylistUri
    ? playlists.find((p) => p.uri === selectedPlaylistUri)?.name ?? null
    : null;

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
          setError("Permission denied — please reconnect Spotify.");
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

  const playPlaylist = async (uri: string) => {
    if (!spotify.accessToken || !spotify.deviceId) return;
    const playlist = playlists.find((p) => p.uri === uri);
    if (playlist && playlist.tracks?.total === 0) {
      setSelectedPlaylistUri(uri);
      setError("This playlist is empty — add songs first.");
      return;
    }
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
        const errMsg = parseSpotifyError(res.status, errText);
        setError(`Playback failed: ${errMsg || "try reconnecting."}`);
      }
    } catch {
      setError("Network error starting playback.");
    } finally {
      setStartingPlayback(false);
    }
  };

  const createPlaylist = async () => {
    if (!spotify.accessToken || !newPlaylistName.trim()) return;
    setCreatingPlaylist(true);
    setError(null);
    try {
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
        const newPl = await createRes.json();
        setNewPlaylistName("");
        setShowCreateForm(false);
        await fetchPlaylists();
        if (newPl?.uri) setSelectedPlaylistUri(newPl.uri);
      } else {
        const errText = await createRes.text().catch(() => "");
        const errMsg = parseSpotifyError(createRes.status, errText);
        setError(`Failed to create playlist: ${errMsg}`);
      }
    } catch {
      setError("Network error creating playlist.");
    } finally {
      setCreatingPlaylist(false);
    }
  };

  const searchTracks = useCallback(
    async (query: string) => {
      if (!spotify.accessToken || !query.trim()) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const res = await spotifyFetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.tracks?.items ?? []);
        }
      } catch (err) {
        console.error("[Spotify] Search error:", err);
      } finally {
        setSearching(false);
      }
    },
    [spotify.accessToken],
  );

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(() => {
      searchTracks(searchQuery);
    }, 400);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery, searchTracks]);

  const addToPlaylist = async (trackUri: string, trackId: string) => {
    if (!selectedPlaylistId) {
      setError("Select a playlist first to add songs.");
      return;
    }
    setAddingTrackId(trackId);
    try {
      const res = await spotifyFetch(
        `https://api.spotify.com/v1/playlists/${selectedPlaylistId}/items`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uris: [trackUri] }),
        },
      );
      if (res.ok) {
        setPlaylists((prev) =>
          prev.map((pl) =>
            pl.id === selectedPlaylistId && pl.tracks
              ? { ...pl, tracks: { ...pl.tracks, total: pl.tracks.total + 1 } }
              : pl,
          ),
        );
      } else {
        const errText = await res.text().catch(() => "");
        const errMsg = parseSpotifyError(res.status, errText);
        setError(`Failed to add track: ${errMsg}`);
      }
    } catch {
      setError("Network error adding track.");
    } finally {
      setAddingTrackId(null);
    }
  };

  // ── Not connected ──
  if (!spotify.accessToken) {
    return (
      <div className="flex items-center justify-center gap-3 border-t border-border bg-bg-elevated px-6 py-3">
        <Music size={16} className="text-emerald-400" />
        <span className="text-sm text-text-secondary">
          Connect Spotify to play music during your class
        </span>
        <a
          href="/api/auth/spotify"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
        >
          <Wifi size={14} />
          Connect Spotify
        </a>
      </div>
    );
  }

  // ── Connecting ──
  if (!spotify.isReady) {
    return (
      <div className="flex items-center justify-center gap-3 border-t border-border bg-bg-elevated px-6 py-3">
        <Loader2
          size={16}
          className="text-emerald-400 animate-spin"
        />
        <span className="text-sm text-text-secondary">
          Connecting to Spotify...
        </span>
      </div>
    );
  }

  // ── Connected — Full-width bottom bar ──
  return (
    <div className="border-t border-border bg-bg-elevated flex-shrink-0">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border-b border-red-500/20">
          <AlertCircle size={12} className="text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-300 flex-1">{error}</p>
          <button
            className="text-red-400 hover:text-red-300"
            onClick={() => setError(null)}
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Expanded panel: playlists + search */}
      {expanded && (
        <div className="border-b border-border bg-bg/50">
          <div className="flex gap-0 max-h-72">
            {/* Playlists column */}
            <div className="w-1/2 border-r border-border flex flex-col">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
                <ListMusic size={14} className="text-text-muted" />
                <span className="text-xs font-semibold text-text-secondary">
                  Playlists
                </span>
                <div className="ml-auto flex items-center gap-1.5">
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

              <div className="overflow-y-auto flex-1">
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
                          className="w-8 h-8 rounded flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-bg flex items-center justify-center flex-shrink-0">
                          <Music size={12} className="text-text-muted" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-medium">
                          {pl.name}
                        </div>
                        <div className="text-[10px] text-text-muted">
                          {typeof pl.tracks?.total === "number"
                            ? pl.tracks.total === 0
                              ? "Empty"
                              : `${pl.tracks.total} tracks`
                            : "Playlist"}
                        </div>
                      </div>
                      {isActive && (
                        <Check
                          size={14}
                          className="text-emerald-400 flex-shrink-0"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search column */}
            <div className="w-1/2 flex flex-col">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
                <Search size={14} className="text-text-muted" />
                <input
                  type="text"
                  placeholder="Search songs to add..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-white placeholder:text-text-muted focus:outline-none"
                />
                {searching && (
                  <Loader2 size={12} className="text-text-muted animate-spin" />
                )}
                {searchQuery && (
                  <button
                    className="text-text-muted hover:text-text-secondary"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className="overflow-y-auto flex-1">
                {searchResults.length > 0
                  ? searchResults.map((track) => (
                      <div
                        key={track.id}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 transition-colors"
                      >
                        {track.album.images?.[0] ? (
                          <img
                            src={
                              track.album.images[
                                track.album.images.length - 1
                              ]?.url ?? track.album.images[0].url
                            }
                            alt=""
                            className="w-8 h-8 rounded flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-bg flex items-center justify-center flex-shrink-0">
                            <Music size={10} className="text-text-muted" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-medium">
                            {track.name}
                          </div>
                          <div className="truncate text-[10px] text-text-muted">
                            {track.artists.map((a) => a.name).join(", ")} ·{" "}
                            {formatDuration(track.duration_ms)}
                          </div>
                        </div>
                        <button
                          className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 transition-colors disabled:opacity-50"
                          onClick={() => addToPlaylist(track.uri, track.id)}
                          disabled={
                            !selectedPlaylistId || addingTrackId === track.id
                          }
                          title={
                            selectedPlaylistId
                              ? "Add to playlist"
                              : "Select a playlist first"
                          }
                        >
                          {addingTrackId === track.id ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : (
                            <Plus size={12} />
                          )}
                        </button>
                      </div>
                    ))
                  : searchQuery &&
                    !searching && (
                      <div className="px-3 py-8 text-center text-xs text-text-muted">
                        No results found
                      </div>
                    )}
                {!searchQuery && (
                  <div className="px-3 py-8 text-center text-xs text-text-muted">
                    Search for songs to add to{" "}
                    {selectedPlaylistName ? (
                      <span className="text-emerald-400">
                        {selectedPlaylistName}
                      </span>
                    ) : (
                      "a playlist"
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main bar */}
      <div className="flex items-center gap-4 px-4 py-2.5 min-h-[56px]">
        {/* Left: Now Playing */}
        <div className="flex items-center gap-3 min-w-0 w-1/3">
          {spotify.currentTrack ? (
            <>
              {spotify.currentTrack.image_url && (
                <img
                  src={spotify.currentTrack.image_url}
                  alt=""
                  className="w-10 h-10 rounded flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {spotify.currentTrack.name}
                </div>
                <div className="truncate text-xs text-text-muted">
                  {spotify.currentTrack.artist}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Music size={16} className="text-emerald-400" />
              <span className="text-xs text-text-muted">No track playing</span>
            </div>
          )}
        </div>

        {/* Center: Playback controls */}
        <div className="flex items-center justify-center gap-4 flex-shrink-0">
          <button
            className="text-text-secondary hover:text-white transition-colors"
            onClick={previousTrack}
          >
            <SkipBack size={16} />
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
            onClick={togglePlay}
          >
            {spotify.isPlaying ? (
              <Pause size={16} />
            ) : (
              <Play size={16} className="ml-0.5" />
            )}
          </button>
          <button
            className="text-text-secondary hover:text-white transition-colors"
            onClick={nextTrack}
          >
            <SkipForward size={16} />
          </button>
        </div>

        {/* Right: Playlist selector + controls */}
        <div className="flex items-center gap-3 justify-end w-1/3">
          {/* Volume */}
          <div className="hidden md:flex items-center gap-1.5">
            <Volume2 size={14} className="text-text-muted" />
            <input
              type="range"
              min={0}
              max={100}
              value={spotify.volume}
              onChange={(e) => {
                const vol = Number(e.target.value);
                spotify.setVolume(vol);
                setPlayerVolume(vol);
              }}
              className="w-20 h-1 accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Playlist indicator */}
          {selectedPlaylistName && (
            <div className="hidden md:flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1">
              <ListMusic size={12} className="text-emerald-400" />
              <span className="text-xs text-emerald-300 max-w-[100px] truncate">
                {selectedPlaylistName}
              </span>
            </div>
          )}

          {/* Expand toggle */}
          <button
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
              expanded
                ? "bg-emerald-600/20 text-emerald-400"
                : "text-text-secondary hover:bg-white/5 hover:text-text-primary",
            )}
            onClick={() => setExpanded(!expanded)}
          >
            <ListMusic size={14} />
            <span className="hidden md:inline">
              {expanded ? "Close" : "Playlists"}
            </span>
            {expanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          </button>

          {/* Reconnect */}
          <a
            href="/api/auth/spotify"
            onClick={() => spotify.reset()}
            className="text-text-muted hover:text-text-secondary transition-colors"
            title="Reconnect Spotify"
          >
            <RefreshCw size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
