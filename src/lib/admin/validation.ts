import { z } from "zod";

const reasonSchema = z.enum(["required", "tooLong", "format", "url", "date", "slug", "duplicateAnchor", "dateOrder", "currentEndDate", "translationTitle", "translationIntro", "articleContent", "reload", "json", "unsupported"]);
export type ValidationIssue = { path: string; reason: z.infer<typeof reasonSchema> };

export function validationTarget(path: string) {
  return path.replace(/\.items\.\d+$/, ".items");
}

export function validationControl({ path, issues }: { path: string; issues: ValidationIssue[] }) {
  const invalid = issues.some((issue) => issue.path === path);
  return { id: `field-${path}`, "aria-invalid": invalid, "aria-describedby": invalid ? `error-${path}` : undefined };
}

export function validationIssues(issues: z.core.$ZodIssue[]): ValidationIssue[] {
  const fields = new Map<string, ValidationIssue>();
  for (const issue of issues) {
    const path = validationTarget(issue.path.join("."));
    const explicit = reasonSchema.safeParse(issue.message);
    const reason = explicit.success ? explicit.data
      : issue.code === "too_small" || issue.code === "invalid_type" ? "required"
      : issue.code === "too_big" ? "tooLong"
      : issue.code === "unrecognized_keys" ? "unsupported" : "format";
    if (!fields.has(path)) fields.set(path, { path, reason });
  }
  return [...fields.values()];
}
