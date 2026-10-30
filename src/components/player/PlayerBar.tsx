"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Episode } from "@/lib/podcast/episode";
import { EpisodeDuration, episodePlayLabel, EpisodeTitle } from "./EpisodeTitle";
import { PlayToggle } from "./icons";
import { isAudible, playbackOf, playerControl, type SpotifyPlayback } from "./player-control";

const API_SCRIPT_SRC = "https://open.spotify.com/embed/iframe-api/v1";
// How long a listener who pressed play waits for the player before the bar
// gives up on it: a slow phone network can take this long.
const READY_TIMEOUT_MS = 10_000;

// Spotify's player loads once the page has finished loading (not sooner: on a
// slow network it would hold up the page's own cover photo), so that a press
// reaches a ready player: phones only allow sound during a tap, and a player
// that is still loading asks too late. "idle" until the player exists,
// "custom" once it does, "fallback" when it failed. The privacy policy says
// the player loads with the page.
type PlayerMode = "idle" | "custom" | "fallback";

interface SpotifyController {
  togglePlay(): void;
  addListener(event: "ready", callback: () => void): void;
  addListener(event: "playback_update", callback: (event: { readonly data: SpotifyPlayback }) => void): void;
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  // Spotify's player exists before it can play: a press only goes straight
  // through once it has said it is ready.
  const readyRef = useRef(false);
  // A press arrived before the player was ready; the button shows loading.
  const [isWaiting, setIsWaiting] = useState(false);
  // A one-way latch, deliberately not `mode`: the loading effect must run
  // exactly once, since onSpotifyIframeApiReady only ever fires once.
  const [shouldLoad, setShouldLoad] = useState(false);
  // Set while a press waits for the player, so playback starts as soon as it
  // is ready. A phone may refuse a start that late; the button then offers
  // play again (see isAudible) and the next press plays.
  const shouldAutoPlayRef = useRef(false);

  // Load the player after the page itself, so it never competes with the
  // page's own images and scripts.
  useEffect(() => {
    if (spotifyShowId === "") return;
    const load = () => setShouldLoad(true);
    if (document.readyState === "complete") {
      load();
      return;
    }
    window.addEventListener("load", load, { once: true });
    return () => window.removeEventListener("load", load);
  }, [spotifyShowId]);

  useEffect(() => {
    if (spotifyShowId === "" || !shouldLoad) return;
    let isCancelled = false;

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
              setIsPlaying(isAudible(event.data));
              setProgress(
                event.data.duration > 0
                  ? event.data.position / event.data.duration
                  : 0,
              );
            });
            controller.addListener("ready", () => {
              if (isCancelled) return;
              readyRef.current = true;
              setIsWaiting(false);
              if (shouldAutoPlayRef.current) {
                shouldAutoPlayRef.current = false;
                controller.togglePlay();
              }
            });
            setMode("custom");
          },
        );
      } catch {
        setMode("fallback");
      }
    };

    if (!document.querySelector(`script[src="${API_SCRIPT_SRC}"]`)) {
      const script = document.createElement("script");
      script.src = API_SCRIPT_SRC;
      script.async = true;
      script.onerror = () => {
        if (!isCancelled) setMode("fallback");
      };
      document.body.appendChild(script);
    }

    return () => {
      isCancelled = true;
    };
  }, [spotifyShowId, shouldLoad]);

  // A listener who pressed play waits at most READY_TIMEOUT_MS: then the bar
  // stops waiting (a start much later would surprise them), and falls back to
  // the stock player if Spotify's never came up. Loading in the background
  // alone never gives up on it.
  useEffect(() => {
    if (!isWaiting) return;
    const timeout = setTimeout(() => {
      shouldAutoPlayRef.current = false;
      setIsWaiting(false);
      if (!controllerRef.current) setMode("fallback");
    }, READY_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [isWaiting]);

  // Stable, so other controls can hold it: toggles a ready player, otherwise
  // asks for playback to start as soon as the player is ready.
  const handlePlayClick = useCallback(() => {
    const controller = controllerRef.current;
    if (controller && readyRef.current) {
      controller.togglePlay();
      return;
    }
    shouldAutoPlayRef.current = true;
    setShouldLoad(true);
    setIsWaiting(true);
  }, []);

  const playback = playbackOf({
    hasPlayer: mode === "custom",
    isWaiting: isWaiting && mode !== "fallback",
    isPlaying,
  });
  useEffect(() => playerControl.report(playback), [playback]);

  // The stock embed that replaces a failed player cannot be driven from outside.
  const canTakeRequests = spotifyShowId !== "" && mode !== "fallback";
  useEffect(
    () => (canTakeRequests ? playerControl.connect(handlePlayClick) : undefined),
    [canTakeRequests, handlePlayClick],
  );

  if (spotifyShowId === "") return null;

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
