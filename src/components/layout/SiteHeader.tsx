import Link from "next/link";
import { Suspense } from "react";
import { getNavigation } from "@/lib/dal/navigation";
import { ROUNDUPS } from "@/lib/taxonomy/public";
import { NavLinks, NavLinksFallback, type NavLink } from "./NavLinks";
import { SiteMenu, SiteMenuFallback } from "./SiteMenu";
import { Wordmark } from "./Wordmark";

interface SiteHeaderProps {
  readonly spotifyUrl: string;
  readonly applePodcastUrl: string;
}

// Desktop keeps the subject links in the header; phones and tablets get the
// menu button and a full-page menu.
export async function SiteHeader({ spotifyUrl, applePodcastUrl }: SiteHeaderProps) {
  const navigation = await getNavigation();
  // Subjects carry their color dot; roundups, a format, stay plain.
  const links: NavLink[] = [
    { href: "/", label: "בית" },
    ...navigation.sections.map((section) => (section.href === ROUNDUPS.href ? { href: section.href, label: section.label } : section)),
  ];

  return (
    <header
      data-site-header
      className="sticky top-0 z-40 border-b border-surface-border bg-bg-start/85 backdrop-blur-md transition-[background-color,border-color] duration-300 over-cover:border-transparent over-cover:bg-transparent over-cover:bg-[linear-gradient(to_bottom,rgb(6_13_24/0.72),rgb(6_13_24/0))] over-cover:backdrop-blur-none"
    >
      <div className="mx-auto flex h-header w-full max-w-5xl items-center gap-3 px-6 lg:gap-7">
        <Suspense fallback={<SiteMenuFallback />}>
          <SiteMenu navigation={navigation} spotifyUrl={spotifyUrl} applePodcastUrl={applePodcastUrl} />
        </Suspense>
        <Link
          href="/"
          className="whitespace-nowrap text-xl font-black tracking-tight transition-colors hover:text-accent over-cover:[text-shadow:0_1px_10px_rgb(0_0_0/0.55)]"
        >
          <Wordmark />
        </Link>
        <nav aria-label="ניווט ראשי" className="hidden items-center gap-6 self-stretch lg:flex">
          <Suspense fallback={<NavLinksFallback links={links} />}>
            <NavLinks links={links} />
          </Suspense>
        </nav>
        <a
          href={spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ms-auto hidden whitespace-nowrap rounded-full bg-accent px-3.5 py-2 text-sm font-bold text-bg-start transition-all hover:-translate-y-px hover:shadow-[0_0_24px_rgba(46,204,64,0.45)] motion-reduce:transition-none min-[360px]:inline-block sm:px-4.5"
        >
          האזינו עכשיו
        </a>
      </div>
    </header>
  );
}
