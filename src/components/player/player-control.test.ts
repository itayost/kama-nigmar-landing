import { afterEach, describe, expect, it, vi } from "vitest";
import { isAudible, playbackOf, playerControl } from "./player-control";

describe("playbackOf", () => {
  it("is loading while a press waits, with or without a player yet", () => {
    expect(playbackOf({ hasPlayer: false, isWaiting: true, isPlaying: false })).toBe("loading");
    expect(playbackOf({ hasPlayer: true, isWaiting: true, isPlaying: false })).toBe("loading");
  });

  it("is idle with no player and no press", () => {
    expect(playbackOf({ hasPlayer: false, isWaiting: false, isPlaying: false })).toBe("idle");
  });

  it("follows the player once it is there", () => {
    expect(playbackOf({ hasPlayer: true, isWaiting: false, isPlaying: true })).toBe("playing");
    expect(playbackOf({ hasPlayer: true, isWaiting: false, isPlaying: false })).toBe("paused");
  });
});

describe("isAudible", () => {
  it("is true while an episode plays", () => {
    expect(isAudible({ isPaused: false, position: 4443, duration: 849989 })).toBe(true);
  });

  it("is false when paused", () => {
    expect(isAudible({ isPaused: true, position: 4443, duration: 849989 })).toBe(false);
  });

  it("is false when a start failed: Spotify says not paused but has no episode", () => {
    expect(isAudible({ isPaused: false, position: 0, duration: 0 })).toBe(false);
  });

  it("is false once a preview has run to its end", () => {
    expect(isAudible({ isPaused: false, position: 60000, duration: 60000 })).toBe(false);
  });
});

let disconnect: (() => void) | null = null;

afterEach(() => {
  disconnect?.();
  disconnect = null;
  playerControl.report("idle");
});

describe("playerControl", () => {
  it("is unavailable until a player connects", () => {
    expect(playerControl.getSnapshot()).toEqual({ playback: "idle", available: false });
  });

  it("passes toggle requests to the connected player", () => {
    const toggle = vi.fn();
    disconnect = playerControl.connect(toggle);
    playerControl.toggle();
    expect(toggle).toHaveBeenCalledTimes(1);
    expect(playerControl.getSnapshot().available).toBe(true);
  });

  it("ignores toggle requests with no player", () => {
    expect(() => playerControl.toggle()).not.toThrow();
  });

  it("tells subscribers about playback changes, once per change", () => {
    const listener = vi.fn();
    const unsubscribe = playerControl.subscribe(listener);
    playerControl.report("playing");
    playerControl.report("playing");
    unsubscribe();
    playerControl.report("paused");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(playerControl.getSnapshot().playback).toBe("paused");
  });

  it("goes back to unavailable and idle when the player disconnects", () => {
    const toggle = vi.fn();
    disconnect = playerControl.connect(toggle);
    playerControl.report("playing");
    disconnect();
    disconnect = null;
    playerControl.toggle();
    expect(toggle).not.toHaveBeenCalled();
    expect(playerControl.getSnapshot()).toEqual({ playback: "idle", available: false });
  });
});
