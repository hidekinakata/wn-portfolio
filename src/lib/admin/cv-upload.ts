import { z } from "zod";

export const CV_MAX_BYTES = 3 * 1024 * 1024;

export const cvUploadResponseSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("success"), url: z.url() }),
  z.object({ kind: z.literal("error"), code: z.enum(["auth", "config", "origin", "size", "type", "pdf", "upload", "single"]) }),
]);
export type CvUploadResponse = z.infer<typeof cvUploadResponseSchema>;

export function validateCvFile(file: Pick<File, "name" | "type" | "size">) {
  if (file.size <= 0 || file.size > CV_MAX_BYTES) return "size";
  if (!/\.pdf$/i.test(file.name) || (file.type !== "application/pdf" && file.type !== "")) return "type";
  return null;
}

export function hasPdfSignature(bytes: Uint8Array) {
  return new TextDecoder().decode(bytes.subarray(0, 5)) === "%PDF-";
}
