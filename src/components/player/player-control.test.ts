import { afterEach, describe, expect, it, vi } from "vitest";
import { playerControl } from "./player-control";

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
