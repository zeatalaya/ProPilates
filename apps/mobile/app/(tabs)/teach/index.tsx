import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
  ActivityIndicator,

} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ChevronDown,
  ChevronUp,
  Music,
  X,
  ListMusic,
} from "lucide-react-native";
import { useTeachingModeStore, useSpotifyStore } from "@propilates/shared";
import { formatDuration } from "@propilates/shared";
import { useSpotifyMobile } from "../../../src/hooks/useSpotifyMobile";
import { TimerRing } from "../../../src/components/ui/TimerRing";
import { Badge } from "../../../src/components/ui/Badge";

interface SpotifyPlaylist {
  id: string;
  name: string;
  uri: string;
  image: string | null;
  trackCount: number;
  owner: string;
}

export default function TeachScreen() {
  const {
    isPlaying,
    currentBlockIndex,
    currentExerciseIndex,
    elapsed,
    blocks,
    play,
    pause,
    togglePlayPause,
    tick,
    skipNext,
    skipPrev,
    reset,
    currentBlock: getCurrentBlock,
    currentExercise: getCurrentExercise,
    progress: getProgress,
  } = useTeachingModeStore();

  // Keep screen awake during teaching (native only, web Wake Lock may fail)
  useEffect(() => {
    if (Platform.OS === "web") return;
    activateKeepAwakeAsync("teaching").catch(() => {});
    return () => { deactivateKeepAwake("teaching"); };
  }, []);
  const spotify = useSpotifyMobile();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showUpNext, setShowUpNext] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  const openPlaylistPicker = useCallback(async () => {
    setShowPlaylists(true);
    setLoadingPlaylists(true);
    const result = await spotify.getPlaylists();
    setPlaylists(result);
    setLoadingPlaylists(false);
  }, [spotify]);

  const selectPlaylist = useCallback(async (playlist: SpotifyPlaylist) => {
    setShowPlaylists(false);
    // play() handles finding the Spotify device, targeting it,
    // and falling back to deep link if needed
    await spotify.play(undefined, playlist.uri);
    setTimeout(() => spotify.getCurrentTrack(), 2000);
    setTimeout(() => spotify.getCurrentTrack(), 4000);
  }, [spotify]);

  // Poll current track when Spotify is playing
  useEffect(() => {
    if (spotify.isReady && spotify.isPlaying) {
      trackPollRef.current = setInterval(() => {
        spotify.getCurrentTrack();
      }, 5000);
    }
    return () => {
      if (trackPollRef.current) clearInterval(trackPollRef.current);
    };
  }, [spotify.isReady, spotify.isPlaying, spotify.getCurrentTrack]);

  // Timer tick
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, tick]);

  const currentBlock = getCurrentBlock();
  const currentExercise = getCurrentExercise();
  const exercise = currentExercise?.exercise;
  const totalDuration = currentExercise?.duration ?? 60;
  const remaining = Math.max(0, totalDuration - elapsed);
  const progress = getProgress();

  if (blocks.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-bg">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-violet-500/20 items-center justify-center mb-6">
            <Play size={36} color="#c9a96e" />
          </View>
          <Text className="text-2xl font-bold text-text-primary mb-2 text-center">
            No Active Session
          </Text>
          <Text className="text-text-secondary text-center mb-6">
            Build a class in the Builder tab and tap "Teach" to start a live
            teaching session with timer and cues.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-3">
        <TouchableOpacity onPress={reset}>
          <Text className="text-red-400 font-medium">End Session</Text>
        </TouchableOpacity>
        <Text className="text-text-secondary text-sm">
          Block {currentBlockIndex + 1}/{blocks.length}
        </Text>
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => setShowUpNext(!showUpNext)}
        >
          <Text className="text-violet-400 text-sm mr-1">Up Next</Text>
          {showUpNext ? (
            <ChevronUp size={16} color="#c9a96e" />
          ) : (
            <ChevronDown size={16} color="#c9a96e" />
          )}
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Method Badge */}
        {exercise?.method && (
          <Badge variant="violet" className="mb-4">
            {exercise.method}
          </Badge>
        )}

        {/* Exercise Name */}
        <Text className="text-3xl font-bold text-text-primary text-center mb-2">
          {exercise?.name ?? "Exercise"}
        </Text>

        {/* Side indicator */}
        {currentExercise?.side && currentExercise.side !== "both" && (
          <Text className="text-violet-400 text-lg font-medium mb-6 uppercase">
            {currentExercise.side} Side
          </Text>
        )}

        {/* Timer Ring */}
        <View className="my-8">
          <TimerRing
            progress={Math.min(progress, 1)}
            elapsed={elapsed}
            duration={totalDuration}
            size={220}
          />
        </View>

        {/* Cues */}
        {currentExercise?.notes && (
          <View className="bg-bg-card border border-border rounded-xl p-4 w-full mb-6">
            <Text className="text-text-secondary text-sm font-medium mb-1">
              Cues
            </Text>
            <Text className="text-text-primary">{currentExercise.notes}</Text>
          </View>
        )}

        {/* Reps */}
        {currentExercise?.reps && currentExercise.reps > 0 && (
          <Text className="text-text-secondary text-base">
            {currentExercise.reps} reps
          </Text>
        )}
      </View>

      {/* Controls */}
      <View className="px-6 pb-4">
        <View className="flex-row items-center justify-center gap-6 mb-4">
          <TouchableOpacity
            className="w-14 h-14 rounded-full bg-bg-card border border-border items-center justify-center"
            onPress={skipPrev}
          >
            <SkipBack size={22} color="#a0a0b8" />
          </TouchableOpacity>

          <TouchableOpacity
            className="w-18 h-18 rounded-full bg-violet-600 items-center justify-center"
            style={{ width: 72, height: 72 }}
            onPress={togglePlayPause}
          >
            {isPlaying ? (
              <Pause size={32} color="#fff" />
            ) : (
              <Play size={32} color="#fff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="w-14 h-14 rounded-full bg-bg-card border border-border items-center justify-center"
            onPress={skipNext}
          >
            <SkipForward size={22} color="#a0a0b8" />
          </TouchableOpacity>
        </View>

        {/* Spotify Mini */}
        {spotify.isReady ? (
          <View className="bg-bg-card border border-border rounded-xl overflow-hidden">
            {/* Now Playing / Pick Playlist */}
            <TouchableOpacity
              className="flex-row items-center px-4 py-3"
              onPress={async () => {
                if (spotify.isPlaying) {
                  spotify.pause();
                } else if (spotify.currentTrack) {
                  await spotify.play();
                  setTimeout(() => spotify.getCurrentTrack(), 1000);
                } else {
                  openPlaylistPicker();
                }
              }}
            >
              <Music size={18} color="#34d399" />
              <Text className="text-text-primary text-sm ml-2 flex-1" numberOfLines={1}>
                {spotify.currentTrack
                  ? `${spotify.currentTrack.name} — ${spotify.currentTrack.artist}`
                  : "Tap to pick a playlist"}
              </Text>
              {spotify.isPlaying ? (
                <Pause size={16} color="#34d399" />
              ) : (
                <Play size={16} color="#34d399" />
              )}
            </TouchableOpacity>

            {/* Playback controls when playing */}
            {spotify.currentTrack && (
              <View className="flex-row items-center justify-center gap-6 px-4 pb-3">
                <TouchableOpacity onPress={() => spotify.play()}>
                  <SkipBack size={18} color="#a0a0b8" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => spotify.isPlaying ? spotify.pause() : spotify.play()}
                >
                  {spotify.isPlaying ? (
                    <Pause size={22} color="#34d399" />
                  ) : (
                    <Play size={22} color="#34d399" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={spotify.skip}>
                  <SkipForward size={18} color="#a0a0b8" />
                </TouchableOpacity>
                <TouchableOpacity onPress={openPlaylistPicker}>
                  <ListMusic size={18} color="#a0a0b8" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <TouchableOpacity
            className="flex-row items-center bg-bg-card border border-border rounded-xl px-4 py-3"
            onPress={spotify.canLogin ? spotify.login : undefined}
          >
            <Music size={18} color="#34d399" />
            <Text className="text-text-secondary text-sm ml-2 flex-1">
              {spotify.canLogin ? "Connect Spotify" : "Spotify not configured"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Up Next Drawer */}
      {showUpNext && (
        <View className="absolute bottom-32 left-0 right-0 bg-bg-card border-t border-border rounded-t-2xl px-6 pt-4 pb-6 max-h-64">
          <Text className="text-text-primary font-semibold mb-3">Up Next</Text>
          <FlatList
            data={currentBlock?.exercises?.slice(currentExerciseIndex + 1) ?? []}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <View className="flex-row items-center py-2 border-b border-border">
                <Text className="text-text-primary flex-1">
                  {item.exercise?.name ?? "Exercise"}
                </Text>
                <Text className="text-text-secondary text-sm">
                  {formatDuration(item.duration)}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <Text className="text-text-secondary text-sm">
                No more exercises in this block
              </Text>
            }
          />
        </View>
      )}
      {/* Playlist Picker Modal */}
      <Modal
        visible={showPlaylists}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPlaylists(false)}
      >
        <SafeAreaView className="flex-1 bg-bg">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
            <Text className="text-text-primary font-semibold text-lg">
              Pick a Playlist
            </Text>
            <TouchableOpacity onPress={() => setShowPlaylists(false)}>
              <X size={24} color="#a0a0b8" />
            </TouchableOpacity>
          </View>
          {loadingPlaylists ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#c9a96e" />
            </View>
          ) : (
            <FlatList
              data={playlists}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="flex-row items-center py-3 border-b border-border"
                  onPress={() => selectPlaylist(item)}
                >
                  {item.image ? (
                    <Image
                      source={{ uri: item.image }}
                      className="w-12 h-12 rounded-lg mr-3"
                    />
                  ) : (
                    <View className="w-12 h-12 rounded-lg bg-violet-500/20 items-center justify-center mr-3">
                      <Music size={20} color="#c9a96e" />
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="text-text-primary font-medium" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text className="text-text-secondary text-sm">
                      {item.trackCount > 0 ? `${item.trackCount} tracks · ` : ""}{item.owner}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="items-center py-12">
                  <Text className="text-text-secondary">No playlists found</Text>
                </View>
              }
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
