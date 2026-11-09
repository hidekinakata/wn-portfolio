import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { isAllowedAdmin } from "@/lib/admin/schema";

export function authConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.ADMIN_EMAIL);
}

export async function createAuthClient({ writable = false } = {}) {
  const store = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase Auth is not configured.");
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (entries) => {
        // Proxy refreshes read-only render sessions; actions can write cookies.
        if (writable) for (const { name, value, options } of entries) store.set(name, value, options);
      },
    },
  });
}

export const getAdmin = cache(async () => {
  if (!authConfigured()) return null;
  const client = await createAuthClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user?.email_confirmed_at || !isAllowedAdmin({ email: data.user.email, allowedEmail: process.env.ADMIN_EMAIL })) return null;
  return data.user;
});

export async function requireAdmin(locale: Locale) {
  const user = await getAdmin();
  if (!user) redirect({ href: "/admin/login", locale });
  return user;
}
