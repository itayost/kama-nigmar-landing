import { cacheLife } from "next/cache";

export const SITE_URL = "https://www.kama-nigmar.co.il";

// Published on the legal pages as the channel for privacy requests and
// takedown notices, so it must be a mailbox that is actually read.
export const CONTACT_EMAIL = "info@kama-nigmar.co.il";

// Social profiles and channels shown in the footer. Empty string hides the icon.
export const SOCIAL_LINKS = {
  instagram: "",
  tiktok: "",
  youtube: "",
  whatsapp: "",
  telegram: "",
} as const;

export async function getCurrentYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
