// Runs the site against the local Docker database, with an admin login that
// only works locally (see local-env.ts).
// Usage: npm run dev:local   (then open http://localhost:3210)
import { spawn } from "node:child_process";
import { localNextEnv } from "./local-env";

const PORT = process.env.PORT ?? "3210";

// Loopback only: the admin login is meant for this machine.
const child = spawn("npx", ["next", "dev", "--port", PORT, "--hostname", "localhost"], {
  stdio: "inherit",
  env: { ...process.env, ...localNextEnv().env },
});
child.on("exit", (code) => process.exit(code ?? 0));
