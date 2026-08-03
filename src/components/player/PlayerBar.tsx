"use client";

import { useEffect, useRef, useState } from "react";

const API_SCRIPT_SRC = "https://open.spotify.com/embed/iframe-api/v1";
const READY_TIMEOUT_MS = 5000;

// "idle" is the pre-interaction state: the bar renders fully, but nothing from
// open.spotify.com is requested yet, so no third-party cookie is set on visitors
// who never press play. First press moves us to "loading" and from there the
// original flow is unchanged.
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
}

// Persistent site-wide Player bar (CONTEXT.md). Custom on-brand controls
// drive a visually hidden Spotify embed via the iFrame API; if the API
// fails to come up within the timeout, the stock compact embed renders
// instead - the bar must never be a dead strip.
export function PlayerBar({ spotifyShowId }: PlayerBarProps) {
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

  if (spotifyShowId === "") return null;

  function handlePlayClick() {
    if (!hasActivated) {
      shouldAutoPlayRef.current = true;
      setHasActivated(true);
      setMode("loading");
      return;
    }
    controllerRef.current?.togglePlay();
  }

  const isPlaying = mode === "custom" && !isPaused;

  return (
    <div
      data-testid="player-bar"
      role="region"
      aria-label="נגן הפודקאסט"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-surface-border bg-bg-start/95 backdrop-blur-md"
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
          <button
            type="button"
            onClick={handlePlayClick}
            aria-busy={mode === "loading"}
            aria-label={isPlaying ? "השהה את הפרק" : "נגן את הפרק האחרון"}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent shadow-[0_0_24px_rgba(46,204,64,0.3)] transition-transform hover:scale-105 active:scale-95 motion-reduce:transform-none"
          >
            {!isPlaying ? (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 translate-x-[1px] fill-bg-start">
                <path d="M8 5.14v13.72c0 .8.87 1.3 1.56.88l10.54-6.86a1.04 1.04 0 0 0 0-1.76L9.56 4.26A1.04 1.04 0 0 0 8 5.14Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-bg-start">
                <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
              </svg>
            )}
          </button>
          <span className="min-w-0">
            <span className="block text-[0.65rem] font-extrabold text-accent">
              הפרק האחרון
            </span>
            <span className="block truncate text-sm font-bold">
              כמה נגמר? — התקציר היומי שלכם
            </span>
          </span>
          {isPlaying ? (
            <span aria-hidden="true" className="ms-auto flex items-end gap-[3px]">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="eq-bar w-[3px] rounded-full bg-accent/60"
                  style={{ height: `${12 + (i % 2) * 8}px`, animationDelay: `${i * 150}ms` }}
                />
              ))}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
