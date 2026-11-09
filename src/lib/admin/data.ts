import "server-only";
import { prisma } from "@/lib/db";
import type { ContentKind, EditorValues } from "@/lib/admin/schema";
import type { Locale } from "@/i18n/routing";
import { toLanguage } from "@/i18n/languages";

export type AdminEntry = { id: string; title: string; detail: string; state: "live" | "draft" | "published" };
const translations = { select: { language: true, title: true } };

function translation<T extends { language: string }>(items: T[], language: string) {
  return items.find((item) => item.language === language);
}

export async function listEntries({ kind, locale }: { kind: ContentKind; locale: Locale }): Promise<AdminEntry[]> {
  const language = toLanguage(locale);
  switch (kind) {
    case "profile": return (await prisma.profile.findMany({ where: { key: "default" }, select: { id: true, name: true } })).map((item) => ({ id: item.id, title: item.name, detail: "", state: "live" }));
    case "experience": return (await prisma.experience.findMany({ orderBy: { startDate: "desc" }, select: { id: true, company: true, translations: { select: { language: true, position: true } } } })).map((item) => ({ id: item.id, title: item.company, detail: (translation(item.translations, language) ?? translation(item.translations, "en"))?.position ?? "", state: "live" }));
    case "education": return (await prisma.education.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, institution: true, translations: { select: { language: true, degree: true } } } })).map((item) => ({ id: item.id, title: item.institution, detail: (translation(item.translations, language) ?? translation(item.translations, "en"))?.degree ?? "", state: "live" }));
    case "certification": return (await prisma.certification.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true, issuer: true } })).map((item) => ({ id: item.id, title: item.name, detail: item.issuer, state: "live" }));
    case "language": return (await prisma.languageProficiency.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, translations: { select: { language: true, name: true } } } })).map((item) => ({ id: item.id, title: (translation(item.translations, language) ?? translation(item.translations, "en"))?.name ?? "—", detail: "", state: "live" }));
    case "project": return (await prisma.project.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, slug: true, translations } })).map((item) => ({ id: item.id, title: (translation(item.translations, language) ?? translation(item.translations, "en"))?.title ?? item.slug ?? "—", detail: item.slug ?? "", state: "live" }));
    case "article": return (await prisma.article.findMany({ orderBy: { updatedAt: "desc" }, select: { id: true, slug: true, published: true, translations } })).map((item) => ({ id: item.id, title: (translation(item.translations, language) ?? translation(item.translations, "en"))?.title ?? item.slug, detail: item.slug, state: item.published ? "published" : "draft" }));
    default: { const exhaustive: never = kind; throw new Error(`Unsupported content: ${exhaustive}`); }
  }
}

const day = (date: Date | null) => date?.toISOString().slice(0, 10) ?? "";

export async function getEditorValues({ kind, id }: { kind: ContentKind; id: string }): Promise<EditorValues | null> {
  if (!id || id === "new") return { id: "", version: "", sortOrder: "0", type: "personal", levelKey: "native", icon: "file-text", readTime: "5 min", enSections: "[]", ptSections: "[]" };
  switch (kind) {
    case "profile": {
      const item = await prisma.profile.findUnique({ where: { id, key: "default" }, include: { translations: true } });
      if (!item) return null;
      const en = translation(item.translations, "en"), pt = translation(item.translations, "pt_BR");
      return { id, version: item.updatedAt.toISOString(), name: item.name, email: item.email ?? "", github: item.github ?? "", linkedin: item.linkedin ?? "", instagram: item.instagram ?? "", enBio: en?.bio ?? "", ptBio: pt?.bio ?? "", enCvUrl: en?.cvUrl ?? "", ptCvUrl: pt?.cvUrl ?? "" };
    }
    case "experience": {
      const item = await prisma.experience.findUnique({ where: { id }, include: { translations: true } });
      if (!item) return null;
      const en = translation(item.translations, "en"), pt = translation(item.translations, "pt_BR");
      return { id, version: item.updatedAt.toISOString(), company: item.company, startDate: day(item.startDate), endDate: day(item.endDate), current: item.current, enTitle: en?.position ?? "", ptTitle: pt?.position ?? "", enDescription: en?.description ?? "", ptDescription: pt?.description ?? "" };
    }
    case "education": {
      const item = await prisma.education.findUnique({ where: { id }, include: { translations: true } });
      if (!item) return null;
      const en = translation(item.translations, "en"), pt = translation(item.translations, "pt_BR");
      return { id, version: item.updatedAt.toISOString(), institution: item.institution, sortOrder: String(item.sortOrder), startDate: day(item.startDate), endDate: day(item.endDate), current: item.current, enTitle: en?.degree ?? "", ptTitle: pt?.degree ?? "", enDescription: en?.description ?? "", ptDescription: pt?.description ?? "" };
    }
    case "certification": {
      const item = await prisma.certification.findUnique({ where: { id } });
      if (!item) return null;
      return { id, version: item.updatedAt.toISOString(), name: item.name, issuer: item.issuer, url: item.url ?? "", issuedAt: day(item.issuedAt), sortOrder: String(item.sortOrder) };
    }
    case "language": {
      const item = await prisma.languageProficiency.findUnique({ where: { id }, include: { translations: true } });
      if (!item) return null;
      return { id, version: item.updatedAt.toISOString(), levelKey: item.levelKey, sortOrder: String(item.sortOrder), enTitle: translation(item.translations, "en")?.name ?? "", ptTitle: translation(item.translations, "pt_BR")?.name ?? "" };
    }
    case "project": {
      const item = await prisma.project.findUnique({ where: { id }, include: { translations: true, tags: { include: { tag: true } } } });
      if (!item) return null;
      const en = translation(item.translations, "en"), pt = translation(item.translations, "pt_BR");
      return { id, version: item.updatedAt.toISOString(), slug: item.slug ?? "", type: item.type, imageUrl: item.imageUrl ?? "", link: item.link ?? "", github: item.github ?? "", tags: item.tags.map((entry) => entry.tag.name).join(", "), enTitle: en?.title ?? "", ptTitle: pt?.title ?? "", enDescription: en?.description ?? "", ptDescription: pt?.description ?? "" };
    }
    case "article": {
      const item = await prisma.article.findUnique({ where: { id }, include: { translations: true, tags: { include: { tag: true } } } });
      if (!item) return null;
      const en = translation(item.translations, "en"), pt = translation(item.translations, "pt_BR");
      return { id, version: item.updatedAt.toISOString(), slug: item.slug, number: item.number, icon: item.icon, readTime: item.readTime, relatedSlugs: item.relatedSlugs.join(", "), published: item.published, tags: item.tags.map((entry) => entry.tag.name).join(", "), enTitle: en?.title ?? "", ptTitle: pt?.title ?? "", enIntro: en?.intro ?? "", ptIntro: pt?.intro ?? "", enSections: JSON.stringify(en?.sections ?? []), ptSections: JSON.stringify(pt?.sections ?? []) };
    }
    default: { const exhaustive: never = kind; throw new Error(`Unsupported content: ${exhaustive}`); }
  }
}
