import { cacheLife } from "next/cache";

export const SITE_URL = "https://kama-nigmar-landing.vercel.app";

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
