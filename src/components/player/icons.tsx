import type { Playback } from "./player-control";

// The round green play button of the Player bar and the episode row.
const PLAY_BUTTON =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-bg-start shadow-[0_0_24px_rgba(46,204,64,0.3)] transition-transform hover:scale-105 active:scale-95 motion-reduce:transform-none";

interface IconProps {
  readonly className?: string;
}

// Play and pause marks. They take the text color; media controls are not
// mirrored in RTL.
export function PlayIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`translate-x-[1px] fill-current ${className}`}>
      <path d="M8 5.14v13.72c0 .8.87 1.3 1.56.88l10.54-6.86a1.04 1.04 0 0 0 0-1.76L9.56 4.26A1.04 1.04 0 0 0 8 5.14Z" />
    </svg>
  );
}

export function PauseIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`fill-current ${className}`}>
      <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
    </svg>
  );
}

// Shown while a press waits for the player.
export function LoadingIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      aria-hidden="true"
      className={`animate-spin motion-reduce:animate-none ${className}`}
    >
      <path d="M12 3a9 9 0 1 1-9 9" />
    </svg>
  );
}

interface PlayToggleProps {
  readonly playback: Playback;
  readonly onClick: () => void;
  // What pressing play does, for screen readers.
  readonly playLabel: string;
  readonly phEvent?: string;
}

// Plays or pauses the one player: the Player bar's own button, and the
// homepage's episode row asking the bar to play.
export function PlayToggle({ playback, onClick, playLabel, phEvent }: PlayToggleProps) {
  const isPlaying = playback === "playing";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-busy={playback === "loading"}
      aria-label={isPlaying ? "השהה את הפרק" : playLabel}
      data-ph-event={phEvent}
      className={PLAY_BUTTON}
    >
      {playback === "loading" ? (
        <LoadingIcon className="h-5 w-5" />
      ) : isPlaying ? (
        <PauseIcon className="h-5 w-5" />
      ) : (
        <PlayIcon className="h-5 w-5" />
      )}
    </button>
  );
}

// The same button as a link, for when no player can take the request.
export function PlayLink({ href, label }: { readonly href: string; readonly label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={PLAY_BUTTON}>
      <PlayIcon className="h-5 w-5" />
    </a>
  );
}
