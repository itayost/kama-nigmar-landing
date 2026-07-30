import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

const spotifyShowUrl = process.env.NEXT_PUBLIC_SPOTIFY_SHOW_URL ?? "#";
const applePodcastUrl = process.env.NEXT_PUBLIC_APPLE_PODCAST_URL ?? "#";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader spotifyUrl={spotifyShowUrl} />
      {children}
      <SiteFooter spotifyUrl={spotifyShowUrl} applePodcastUrl={applePodcastUrl} />
    </>
  );
}
