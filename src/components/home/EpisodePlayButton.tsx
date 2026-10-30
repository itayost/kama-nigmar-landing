"use client";

import { useSyncExternalStore } from "react";
import { PlayLink, PlayToggle } from "@/components/player/icons";
import { playerControl } from "@/components/player/player-control";

interface EpisodePlayButtonProps {
  // What pressing play does, for screen readers: names the episode when known.
  readonly playLabel: string;
  readonly spotifyUrl: string;
}

// Plays and pauses through the Player bar. Until a bar that takes requests is
// on the page (before hydration, or when Spotify's player failed to load), it
// links to the show on Spotify instead.
export function EpisodePlayButton({ playLabel, spotifyUrl }: EpisodePlayButtonProps) {
  const { playback, available } = useSyncExternalStore(
    playerControl.subscribe,
    playerControl.getSnapshot,
    playerControl.getServerSnapshot,
  );
  if (!available) return <PlayLink href={spotifyUrl} label="האזינו לפרק ב-Spotify" />;
  return (
    <PlayToggle playback={playback} onClick={playerControl.toggle} playLabel={playLabel} phEvent="home_episode_play" />
  );
}
