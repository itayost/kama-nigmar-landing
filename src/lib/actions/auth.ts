"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { createSession, destroySession } from "@/lib/auth/session";

export interface LoginState {
  readonly error?: string;
}

const loginSchema = z.object({
  password: z.string().min(1, "חובה למלא סיסמה"),
});

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

  // Every attempt counts toward the limit, so the count is shared by all
  // instances; a successful login clears it.
  const limit = await rateLimit("login", await headers());
  if (!limit.allowed) {
    return { error: "יותר מדי ניסיונות כניסה. נסו שוב בעוד 10 דקות" };
  }

  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!passwordHash || !process.env.AUTH_SECRET) {
    return { error: "המערכת אינה מוגדרת. פנו למנהל האתר" };
  }

  const passwordMatches = await bcrypt.compare(parsed.data.password, passwordHash);
  if (!passwordMatches) {
    return { error: "סיסמה שגויה" };
  }

  await limit.clear();
  await createSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
