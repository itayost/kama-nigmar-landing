"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Episode } from "@/lib/podcast/episode";
import { EpisodeDuration, episodePlayLabel, EpisodeTitle } from "./EpisodeTitle";
import { PlayToggle } from "./icons";
import { playerControl, type Playback } from "./player-control";

const API_SCRIPT_SRC = "https://open.spotify.com/embed/iframe-api/v1";
const READY_TIMEOUT_MS = 5000;

// "idle" until Spotify's player is up. It loads once the page has finished
// loading, so the first press plays at once: phones only allow sound during a
// tap, and a player that loads after the tap asks too late. A press before it
// is up moves to "loading" and plays when it is (the privacy policy says the
// player loads with the page).
type PlayerMode = "idle" | "loading" | "custom" | "fallback";

interface PlaybackUpdate {
  readonly data: {
    readonly position: number;
    readonly duration: number;
    readonly isPaused: boolean;
  };
}

interface SpotifyController {
  togglePlay(): void;
  addListener(event: "playback_update", callback: (event: PlaybackUpdate) => void): void;
}

interface SpotifyIframeApi {
  createController(
    element: HTMLElement,
    options: { uri: string },
    callback: (controller: SpotifyController) => void,
  ): void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
  }
}

interface PlayerBarProps {
  readonly spotifyShowId: string;
  // The latest episode, which the show's player starts from; null when the
  // feed is unavailable.
  readonly episode: Episode | null;
}

// Persistent site-wide Player bar (CONTEXT.md). Custom on-brand controls
// drive a visually hidden Spotify embed via the iFrame API; if the API
// fails to come up within the timeout, the stock compact embed renders
// instead - the bar must never be a dead strip.
export function PlayerBar({ spotifyShowId, episode }: PlayerBarProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SpotifyController | null>(null);
  const [mode, setMode] = useState<PlayerMode>("idle");
  const [isPaused, setIsPaused] = useState(true);
  const [progress, setProgress] = useState(0);
  // A one-way latch, deliberately not `mode`: the effect must run exactly once.
  // Depending on `mode` re-runs it when the controller sets "custom", which
  // re-arms the timeout below, and since onSpotifyIframeApiReady only ever
  // fires once, that second timeout would drop a working player to "fallback".
  const [hasActivated, setHasActivated] = useState(false);
  // Set when the user pressed play before the controller existed, so playback
  // starts as soon as it does rather than needing a second press.
  const shouldAutoPlayRef = useRef(false);

  // Load the player after the page itself, so it never competes with the
  // page's own images and scripts.
  useEffect(() => {
    if (spotifyShowId === "") return;
    const activate = () => setHasActivated(true);
    if (document.readyState === "complete") {
      activate();
      return;
    }
    window.addEventListener("load", activate, { once: true });
    return () => window.removeEventListener("load", activate);
  }, [spotifyShowId]);

  useEffect(() => {
    if (spotifyShowId === "" || !hasActivated) return;
    let isCancelled = false;
    const timeout = setTimeout(() => {
      if (!isCancelled && !controllerRef.current) setMode("fallback");
    }, READY_TIMEOUT_MS);

    window.onSpotifyIframeApiReady = (api) => {
      if (isCancelled || !hostRef.current) return;
      try {
        api.createController(
          hostRef.current,
          { uri: `spotify:show:${spotifyShowId}` },
          (controller) => {
            if (isCancelled) return;
            controllerRef.current = controller;
            controller.addListener("playback_update", (event) => {
              setIsPaused(event.data.isPaused);
              setProgress(
                event.data.duration > 0
                  ? event.data.position / event.data.duration
                  : 0,
              );
            });
            clearTimeout(timeout);
            setMode("custom");
            if (shouldAutoPlayRef.current) {
              shouldAutoPlayRef.current = false;
              controller.togglePlay();
            }
          },
        );
      } catch {
        clearTimeout(timeout);
        setMode("fallback");
      }
    };

    if (!document.querySelector(`script[src="${API_SCRIPT_SRC}"]`)) {
      const script = document.createElement("script");
      script.src = API_SCRIPT_SRC;
      script.async = true;
      script.onerror = () => {
        clearTimeout(timeout);
        if (!isCancelled) setMode("fallback");
      };
      document.body.appendChild(script);
    }

    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, [spotifyShowId, hasActivated]);

  // Stable, so other controls can hold it: toggles a ready player, otherwise
  // asks for playback to start as soon as the player is up.
  const handlePlayClick = useCallback(() => {
    const controller = controllerRef.current;
    if (controller) {
      controller.togglePlay();
      return;
    }
    shouldAutoPlayRef.current = true;
    setHasActivated(true);
    setMode((current) => (current === "idle" ? "loading" : current));
  }, []);

  const playback: Playback =
    mode === "loading" ? "loading" : mode !== "custom" ? "idle" : isPaused ? "paused" : "playing";
  useEffect(() => playerControl.report(playback), [playback]);

  // The stock embed that replaces a failed player cannot be driven from outside.
  const canTakeRequests = spotifyShowId !== "" && mode !== "fallback";
  useEffect(
    () => (canTakeRequests ? playerControl.connect(handlePlayClick) : undefined),
    [canTakeRequests, handlePlayClick],
  );

  if (spotifyShowId === "") return null;

  const isPlaying = playback === "playing";

  return (
    <div
      data-testid="player-bar"
      data-dockable={canTakeRequests || undefined}
      role="region"
      aria-label="נגן הפודקאסט"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-surface-border bg-bg-start/95 backdrop-blur-md transition-[translate,visibility] duration-300 ease-out docked:invisible docked:translate-y-full motion-reduce:transition-none"
    >
      {/* The API controller replaces this host with its own iframe; it must
          stay mounted (but visually hidden) for audio to keep playing. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute h-px w-px overflow-hidden opacity-0 ${mode === "custom" ? "" : "hidden"}`}
      >
        <div ref={hostRef} />
      </div>

      {mode === "fallback" ? (
        <div className="mx-auto w-full max-w-5xl px-4 py-2">
          <iframe
            title="נגן הפרק האחרון"
            src={`https://open.spotify.com/embed/show/${spotifyShowId}?theme=0`}
            width="100%"
            height="80"
            allow="encrypted-media"
            loading="lazy"
            className="rounded-lg border-0"
          />
        </div>
      ) : (
        <div className="relative mx-auto flex w-full max-w-5xl items-center gap-3.5 px-4 py-2.5">
          {mode === "custom" ? (
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-0.5 origin-right bg-accent/70 transition-transform duration-300"
              style={{ transform: `scaleX(${progress})` }}
            />
          ) : null}
          <PlayToggle playback={playback} onClick={handlePlayClick} playLabel={episodePlayLabel(episode)} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm leading-snug font-extrabold">
              <EpisodeTitle episode={episode} />
            </span>
            {episode?.description ? (
              <span className="block truncate text-xs leading-relaxed text-text-muted">{episode.description}</span>
            ) : null}
          </span>
          {isPlaying ? (
            <span aria-hidden="true" className="flex items-end gap-[3px]">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="eq-bar w-[3px] rounded-full bg-accent/60"
                  style={{ height: `${12 + (i % 2) * 8}px`, animationDelay: `${i * 150}ms` }}
                />
              ))}
            </span>
          ) : episode?.durationSeconds ? (
            <EpisodeDuration seconds={episode.durationSeconds} className="text-xs" />
          ) : null}
        </div>
      )}
    </div>
  );
}
