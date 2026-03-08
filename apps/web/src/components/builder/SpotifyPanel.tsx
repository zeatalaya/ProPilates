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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SpotifyPlaylist {
  id: string;
  name: string;
  images: { url: string }[];
  tracks: { total: number };
  uri: string;
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

  // Fetch user playlists when connected
  const fetchPlaylists = useCallback(async () => {
    if (!spotify.accessToken) return;
    setLoadingPlaylists(true);
    try {
      const res = await fetch("https://api.spotify.com/v1/me/playlists?limit=20", {
        headers: { Authorization: `Bearer ${spotify.accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPlaylists(data.items ?? []);
      }
    } catch {
      // silently fail
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
    try {
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${spotify.deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${spotify.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ context_uri: uri }),
        },
      );
    } catch {
      // silently fail
    } finally {
      setStartingPlayback(false);
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

      {/* Playlists */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <ListMusic size={14} className="text-text-muted" />
          <span className="text-xs font-medium text-text-secondary">
            Your Playlists
          </span>
          {loadingPlaylists && (
            <Loader2 size={12} className="text-text-muted animate-spin ml-auto" />
          )}
        </div>
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
                {pl.images[0] ? (
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
                    {pl.tracks.total} tracks
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
