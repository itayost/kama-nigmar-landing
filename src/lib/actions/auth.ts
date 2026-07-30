"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { clearFailures, isLockedOut, recordFailure } from "@/lib/auth/rate-limit";
import { createSession, destroySession } from "@/lib/auth/session";

export interface LoginState {
  readonly error?: string;
}

const loginSchema = z.object({
  email: z.string().min(1, "חובה למלא אימייל"),
  password: z.string().min(1, "חובה למלא סיסמה"),
});

async function clientIp(): Promise<string> {
  const forwardedFor = (await headers()).get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? "unknown";
}

// Constant-time comparison via fixed-length digests, so response timing
// does not leak how much of the email matched.
function secureEquals(a: string, b: string): boolean {
  const digestA = createHash("sha256").update(a).digest();
  const digestB = createHash("sha256").update(b).digest();
  return timingSafeEqual(digestA, digestB);
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const ip = await clientIp();
  if (isLockedOut(ip)) {
    return { error: "יותר מדי ניסיונות כניסה. נסו שוב בעוד 10 דקות" };
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !passwordHash || !process.env.AUTH_SECRET) {
    return { error: "המערכת אינה מוגדרת. פנו למנהל האתר" };
  }

  const emailMatches = secureEquals(
    parsed.data.email.trim().toLowerCase(),
    adminEmail.toLowerCase(),
  );
  // Always run the comparison so response time does not reveal whether
  // the email was the wrong half.
  const passwordMatches = await bcrypt.compare(parsed.data.password, passwordHash);

  if (!emailMatches || !passwordMatches) {
    recordFailure(ip);
    return { error: "אימייל או סיסמה שגויים" };
  }

  clearFailures(ip);
  await createSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
