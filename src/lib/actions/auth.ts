"use server";

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
  password: z.string().min(1, "חובה למלא סיסמה"),
});

async function clientIp(): Promise<string> {
  const forwardedFor = (await headers()).get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? "unknown";
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const ip = await clientIp();
  if (isLockedOut(ip)) {
    return { error: "יותר מדי ניסיונות כניסה. נסו שוב בעוד 10 דקות" };
  }

  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!passwordHash || !process.env.AUTH_SECRET) {
    return { error: "המערכת אינה מוגדרת. פנו למנהל האתר" };
  }

  const passwordMatches = await bcrypt.compare(parsed.data.password, passwordHash);
  if (!passwordMatches) {
    recordFailure(ip);
    return { error: "סיסמה שגויה" };
  }

  clearFailures(ip);
  await createSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
