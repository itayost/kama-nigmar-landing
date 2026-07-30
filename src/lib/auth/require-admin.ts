import { redirect } from "next/navigation";
import { verifySession } from "./session";

export async function requireAdmin(): Promise<void> {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    redirect("/admin/login");
  }
}
