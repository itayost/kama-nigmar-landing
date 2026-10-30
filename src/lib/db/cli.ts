// Shared guard for scripts that write to a database. `.env.local` points at the
// production database, so nothing writes until the operator has typed the
// exact host they mean to change.

export type HostCheck =
  | { readonly ok: true; readonly host: string }
  | { readonly ok: false; readonly message: string };

export function checkConfirmedHost(
  databaseUrl: string | undefined,
  confirmedHost: string | undefined,
): HostCheck {
  if (!databaseUrl) return { ok: false, message: "DATABASE_URL is not set" };

  let host: string;
  try {
    host = new URL(databaseUrl).hostname;
  } catch {
    return { ok: false, message: "DATABASE_URL is not a valid URL" };
  }

  if (confirmedHost !== host) {
    return {
      ok: false,
      message: `This will write to ${host}. Re-run with --confirm-host=${host} to continue.`,
    };
  }
  return { ok: true, host };
}
