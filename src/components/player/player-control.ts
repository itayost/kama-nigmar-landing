// The Player bar owns playback. It reports its state here and takes play and
// pause requests from other controls on the page (the homepage's episode
// row), so there is still exactly one player.
export type Playback = "idle" | "loading" | "playing" | "paused";

export interface PlayerSnapshot {
  readonly playback: Playback;
  // False until a Player bar that can take requests is on the page.
  readonly available: boolean;
}

const OFFLINE: PlayerSnapshot = { playback: "idle", available: false };

let snapshot = OFFLINE;
let toggleRequest: (() => void) | null = null;
const listeners = new Set<() => void>();

function publish(next: PlayerSnapshot) {
  if (next.playback === snapshot.playback && next.available === snapshot.available) return;
  snapshot = next;
  for (const listener of listeners) listener();
}

export const playerControl = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: (): PlayerSnapshot => snapshot,
  getServerSnapshot: (): PlayerSnapshot => OFFLINE,
  // For the Player bar: start taking requests. The returned function stops.
  connect(toggle: () => void): () => void {
    toggleRequest = toggle;
    publish({ ...snapshot, available: true });
    return () => {
      toggleRequest = null;
      publish(OFFLINE);
    };
  },
  report(playback: Playback): void {
    publish({ ...snapshot, playback });
  },
  toggle(): void {
    toggleRequest?.();
  },
};
