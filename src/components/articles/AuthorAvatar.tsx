import Image from "next/image";
import { authorAvatarUrl } from "@/lib/articles/authors";

interface AuthorAvatarProps {
  readonly name: string;
  // Rendered diameter in px. Dynamic, so it stays inline instead of a Tailwind class.
  readonly size: number;
}

// Decorative on purpose: the author name is always rendered next to the avatar,
// so announcing the photo or the initial again would just be noise.
export function AuthorAvatar({ name, size }: AuthorAvatarProps) {
  const avatarUrl = authorAvatarUrl(name);

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      style={{ height: size, width: size, fontSize: Math.round(size * 0.48) }}
      className="flex shrink-0 items-center justify-center rounded-full bg-accent/20 font-extrabold text-accent"
    >
      {name.charAt(0)}
    </span>
  );
}
