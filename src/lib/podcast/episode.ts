// The latest Episode as the podcast's RSS feed describes it, and how the site
// shows it. No dependencies, so the Player bar can use it in the browser;
// reading the feed is in ./feed. The site never hosts audio: the Player bar
// plays the show on Spotify, which starts from this same episode.
export interface Episode {
  readonly title: string;
  // Plain text, cut short: the feed's HTML with tags dropped and entities
  // decoded.
  readonly description: string;
  readonly durationSeconds: number | null;
}

export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}
