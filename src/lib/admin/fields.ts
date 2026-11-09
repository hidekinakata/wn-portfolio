import type { ContentKind } from "@/lib/admin/schema";
import type messages from "@/messages/en.json";

export type EditorField = {
  name: string;
  label: keyof typeof messages.Admin.fields;
  type: "text" | "email" | "url" | "date" | "number" | "textarea" | "checkbox" | "select";
  required?: boolean;
  options?: string[];
  wide?: boolean;
};

const order: EditorField = { name: "sortOrder", label: "sortOrder", type: "number" };
const slug: EditorField = { name: "slug", label: "slug", type: "text", required: true };
const tags: EditorField = { name: "tags", label: "tags", type: "text", wide: true };
const dates: EditorField[] = [
  { name: "startDate", label: "startDate", type: "date", required: true },
  { name: "endDate", label: "endDate", type: "date" },
  { name: "current", label: "current", type: "checkbox", wide: true },
];

export const sharedFields: Record<ContentKind, EditorField[]> = {
  profile: [
    { name: "name", label: "name", type: "text", required: true, wide: true },
    { name: "email", label: "email", type: "email" },
    { name: "github", label: "github", type: "url" },
    { name: "linkedin", label: "linkedin", type: "url" },
    { name: "instagram", label: "instagram", type: "url" },
  ],
  experience: [{ name: "company", label: "company", type: "text", required: true, wide: true }, ...dates],
  education: [{ name: "institution", label: "institution", type: "text", required: true, wide: true }, ...dates, order],
  certification: [{ name: "name", label: "name", type: "text", required: true, wide: true }, { name: "issuer", label: "issuer", type: "text", required: true }, { name: "url", label: "url", type: "url" }, { name: "issuedAt", label: "issuedAt", type: "date" }, order],
  language: [{ name: "levelKey", label: "levelKey", type: "select", options: ["native", "advanced", "intermediate", "basic"] }, order],
  project: [slug, { name: "type", label: "type", type: "select", options: ["personal", "professional"] }, { name: "imageUrl", label: "imageUrl", type: "url", wide: true }, { name: "link", label: "link", type: "url" }, { name: "github", label: "github", type: "url" }, tags],
  article: [slug, { name: "number", label: "number", type: "text", required: true }, { name: "readTime", label: "readTime", type: "text", required: true }, { name: "icon", label: "icon", type: "select", options: ["file-text", "bot", "code", "database", "workflow", "brain", "layers", "terminal", "sparkles"] }, tags, { name: "relatedSlugs", label: "relatedSlugs", type: "text", wide: true }],
};

export function translatedFields(kind: ContentKind): EditorField[] {
  if (kind === "certification") return [];
  if (kind === "profile") return [{ name: "Bio", label: "bio", type: "textarea", wide: true }, { name: "CvUrl", label: "cvUrl", type: "url", wide: true }];
  if (kind === "language") return [{ name: "Title", label: "name", type: "text", wide: true, required: true }];
  const title = kind === "experience" ? "position" : kind === "education" ? "degree" : "title";
  return [{ name: "Title", label: title, type: "text", required: true, wide: true }, { name: kind === "article" ? "Intro" : "Description", label: kind === "article" ? "intro" : "description", type: "textarea", required: kind === "article", wide: true }];
}
