import { cacheLife } from "next/cache";

export const SITE_URL = "https://kama-nigmar-landing.vercel.app";

export async function getCurrentYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
