import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { authConfigured, createAuthClient } from "@/lib/admin/auth";
import { isAllowedAdmin } from "@/lib/admin/schema";
import { CV_MAX_BYTES, hasPdfSignature, validateCvFile, type CvUploadResponse } from "@/lib/admin/cv-upload";
import { routing } from "@/i18n/routing";

function reply(body: CvUploadResponse, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return reply({ kind: "error", code: "origin" }, 403);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!authConfigured() || !url || !key) return reply({ kind: "error", code: "config" }, 503);

  try {
    const auth = await createAuthClient({ writable: true });
    const { data, error } = await auth.auth.getUser();
    if (error || !data.user?.email_confirmed_at || !isAllowedAdmin({ email: data.user.email, allowedEmail: process.env.ADMIN_EMAIL })) {
      return reply({ kind: "error", code: "auth" }, 401);
    }
    const length = Number(request.headers.get("content-length"));
    if (length > CV_MAX_BYTES + 65536) return reply({ kind: "error", code: "size" }, 413);

    const form = await request.formData();
    const files = form.getAll("file");
    if (files.length !== 1) return reply({ kind: "error", code: "single" }, 400);
    const file = files[0];
    const language = z.enum(routing.locales).safeParse(form.get("language"));
    if (!(file instanceof File) || !language.success) return reply({ kind: "error", code: "type" }, 400);
    const invalid = validateCvFile(file);
    if (invalid) return reply({ kind: "error", code: invalid }, invalid === "size" ? 413 : 400);
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!hasPdfSignature(bytes)) return reply({ kind: "error", code: "pdf" }, 400);

    const storage = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }).storage;
    // Unique paths keep the current CV intact until the owner saves its replacement URL.
    const path = `${language.data}/${crypto.randomUUID()}.pdf`;
    const { error: uploadError } = await storage.from("cvs").upload(path, bytes, { contentType: "application/pdf", upsert: false });
    if (uploadError) return reply({ kind: "error", code: "upload" }, 502);
    return reply({ kind: "success", url: storage.from("cvs").getPublicUrl(path).data.publicUrl }, 201);
  } catch { return reply({ kind: "error", code: "upload" }, 500); }
}
