import Link from "next/link";
import { Suspense } from "react";
import { getNavigation } from "@/lib/dal/navigation";
import { HeaderSolidity } from "./HeaderSolidity";
import { NavLinks, NavLinksFallback, type NavLink } from "./NavLinks";
import { SiteMenu } from "./SiteMenu";

interface SiteHeaderProps {
  readonly spotifyUrl: string;
  readonly applePodcastUrl: string;
}

// Desktop keeps the subject links in the header; phones and tablets get the
// menu button and a full-page menu.
export async function SiteHeader({ spotifyUrl, applePodcastUrl }: SiteHeaderProps) {
  const navigation = await getNavigation();
  const links: NavLink[] = [
    { href: "/", label: "בית" },
    ...navigation.subjects.map((subject) => ({ href: `/topics/${subject.slug}`, label: subject.name, color: subject.color })),
    { href: "/roundups", label: "סיכומים" },
  ];

  return (
    <header
      data-site-header
      className="site-header sticky top-0 z-40 border-b border-surface-border bg-bg-start/85 backdrop-blur-md transition-[background-color,border-color] duration-300"
    >
      <div className="mx-auto flex h-15 w-full max-w-5xl items-center gap-3 px-6 lg:gap-7">
        <Suspense fallback={null}>
          <SiteMenu navigation={navigation} spotifyUrl={spotifyUrl} applePodcastUrl={applePodcastUrl} />
        </Suspense>
        <Link
          href="/"
          className="site-logo whitespace-nowrap text-xl font-black tracking-tight transition-colors hover:text-accent"
        >
          כמה נגמר<span className="text-accent">?</span>
        </Link>
        <nav aria-label="ניווט ראשי" className="hidden items-center gap-6 lg:flex">
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
      <Suspense fallback={null}>
        <HeaderSolidity />
      </Suspense>
    </header>
  );
}
