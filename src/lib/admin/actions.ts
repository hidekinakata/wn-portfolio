"use server";

import { z } from "zod";
import { updateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { createAuthClient, authConfigured, requireAdmin } from "@/lib/admin/auth";
import { contentSchema, contentKindSchema, isAllowedAdmin, type ActionState, type ContentKind } from "@/lib/admin/schema";
import { Prisma } from "@/generated/prisma/client";
import { validationIssues } from "@/lib/admin/validation";

const localeSchema = z.enum(routing.locales);
const credentialsSchema = z.object({ email: z.email().max(320), password: z.string().min(1).max(1024), locale: localeSchema });

export async function login(_previous: ActionState, form: FormData): Promise<ActionState> {
  const result = credentialsSchema.safeParse(Object.fromEntries(form));
  if (!result.success) return { kind: "error", code: "invalid", fields: [] };
  if (!authConfigured()) return { kind: "error", code: "config", fields: [] };
  try {
    const client = await createAuthClient({ writable: true });
    const { data, error } = await client.auth.signInWithPassword(result.data);
    if (error || !data.user?.email_confirmed_at || !isAllowedAdmin({ email: data.user.email, allowedEmail: process.env.ADMIN_EMAIL })) {
      if (data.session) await client.auth.signOut();
      return { kind: "error", code: "auth", fields: [] };
    }
  } catch { return { kind: "error", code: "auth", fields: [] }; }
  return redirect({ href: "/admin", locale: result.data.locale });
}

export async function logout(form: FormData) {
  const locale = localeSchema.parse(form.get("locale"));
  const client = await createAuthClient({ writable: true });
  const { error } = await client.auth.signOut();
  if (error) throw new Error("Unable to sign out. Try again.");
  redirect({ href: "/admin/login", locale });
}

function invalidate(kind: ContentKind) {
  const tags: Record<ContentKind, string[]> = {
    profile: ["profile"], experience: ["experiences"], education: ["education"],
    certification: ["education", "certifications"], language: ["languages"], project: ["projects"], article: ["articles"],
  };
  for (const tag of tags[kind]) updateTag(tag);
}

async function tagLinks(value: string) {
  const names = [...new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))];
  const existing = await prisma.tag.findMany({ where: { name: { in: names } }, select: { id: true, name: true } });
  return names.map((name) => {
    const tag = existing.find((entry) => entry.name === name);
    if (tag) return { tag: { connect: { id: tag.id } } };
    const slug = name.toLowerCase().replace(/\+/g, "-plus-").replace(/#/g, "-sharp-").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!slug || name.length > 100 || names.length > 30) throw new Error("Invalid tags.");
    return { tag: { connectOrCreate: { where: { slug }, create: { name, slug } } } };
  });
}

export async function saveContent(_previous: ActionState, form: FormData): Promise<ActionState> {
  const locale = localeSchema.parse(form.get("locale"));
  await requireAdmin(locale);
  const result = contentSchema.safeParse(Object.fromEntries(form));
  if (!result.success) return { kind: "invalid", issues: validationIssues(result.error.issues) };
  const value = result.data;
  const where = { id: value.id, updatedAt: value.version ? new Date(value.version) : undefined };
  let id: string;
  try {
    switch (value.kind) {
      case "profile": {
        const translations = [
          { language: "en", bio: value.enBio || null, cvUrl: value.enCvUrl || null },
          ...(value.ptBio || value.ptCvUrl ? [{ language: "pt_BR", bio: value.ptBio || null, cvUrl: value.ptCvUrl || null } satisfies Prisma.ProfileTranslationCreateWithoutProfileInput] : []),
        ] satisfies Prisma.ProfileTranslationCreateWithoutProfileInput[];
        const data = { name: value.name, email: value.email || null, github: value.github || null, linkedin: value.linkedin || null, instagram: value.instagram || null };
        const record = value.id
          ? await prisma.profile.update({ where: { ...where, key: "default" }, data: { ...data, translations: { deleteMany: {}, create: translations } } })
          : await prisma.profile.create({ data: { ...data, key: "default", translations: { create: translations } } });
        id = record.id;
        break;
      }
      case "experience": {
        const translations = [
          { language: "en", position: value.enTitle, description: value.enDescription },
          ...(value.ptTitle ? [{ language: "pt_BR", position: value.ptTitle, description: value.ptDescription } satisfies Prisma.ExperienceTranslationCreateWithoutExperienceInput] : []),
        ] satisfies Prisma.ExperienceTranslationCreateWithoutExperienceInput[];
        const data = { company: value.company, startDate: value.startDate, endDate: value.endDate, current: value.current };
        const record = value.id
          ? await prisma.experience.update({ where, data: { ...data, translations: { deleteMany: {}, create: translations } } })
          : await prisma.experience.create({ data: { ...data, translations: { create: translations } } });
        id = record.id;
        break;
      }
      case "education": {
        const translations = [
          { language: "en", degree: value.enTitle, description: value.enDescription },
          ...(value.ptTitle ? [{ language: "pt_BR", degree: value.ptTitle, description: value.ptDescription } satisfies Prisma.EducationTranslationCreateWithoutEducationInput] : []),
        ] satisfies Prisma.EducationTranslationCreateWithoutEducationInput[];
        const data = { institution: value.institution, startDate: value.startDate, endDate: value.endDate, current: value.current, sortOrder: value.sortOrder };
        const record = value.id
          ? await prisma.education.update({ where, data: { ...data, translations: { deleteMany: {}, create: translations } } })
          : await prisma.education.create({ data: { ...data, translations: { create: translations } } });
        id = record.id;
        break;
      }
      case "certification": {
        const data = { name: value.name, issuer: value.issuer, url: value.url || null, issuedAt: value.issuedAt, sortOrder: value.sortOrder };
        const record = value.id ? await prisma.certification.update({ where, data }) : await prisma.certification.create({ data });
        id = record.id;
        break;
      }
      case "language": {
        const translations = [{ language: "en", name: value.enTitle }, { language: "pt_BR", name: value.ptTitle }] satisfies Prisma.LanguageProficiencyTranslationCreateWithoutLanguageProficiencyInput[];
        const data = { levelKey: value.levelKey, sortOrder: value.sortOrder };
        const record = value.id
          ? await prisma.languageProficiency.update({ where, data: { ...data, translations: { deleteMany: {}, create: translations } } })
          : await prisma.languageProficiency.create({ data: { ...data, translations: { create: translations } } });
        id = record.id;
        break;
      }
      case "project": {
        const translations = [
          { language: "en", title: value.enTitle, description: value.enDescription },
          ...(value.ptTitle ? [{ language: "pt_BR", title: value.ptTitle, description: value.ptDescription } satisfies Prisma.ProjectTranslationCreateWithoutProjectInput] : []),
        ] satisfies Prisma.ProjectTranslationCreateWithoutProjectInput[];
        const data = { slug: value.slug, type: value.type, imageUrl: value.imageUrl || null, link: value.link || null, github: value.github || null };
        const record = value.id
          ? await prisma.project.update({ where, data: { ...data, translations: { deleteMany: {}, create: translations }, tags: { deleteMany: {}, create: await tagLinks(value.tags) } } })
          : await prisma.project.create({ data: { ...data, translations: { create: translations }, tags: { create: await tagLinks(value.tags) } } });
        id = record.id;
        break;
      }
      case "article": {
        const translations = [
          { language: "en", title: value.enTitle, intro: value.enIntro, sections: value.enSections },
          ...(value.ptTitle ? [{ language: "pt_BR", title: value.ptTitle, intro: value.ptIntro, sections: value.ptSections } satisfies Prisma.ArticleTranslationCreateWithoutArticleInput] : []),
        ] satisfies Prisma.ArticleTranslationCreateWithoutArticleInput[];
        const existing = value.id ? await prisma.article.findUniqueOrThrow({ where, select: { publishedAt: true } }) : null;
        const data = { slug: value.slug, number: value.number, icon: value.icon, readTime: value.readTime, relatedSlugs: [...new Set(value.relatedSlugs.split(",").map((slug) => slug.trim()).filter(Boolean))], published: value.published, publishedAt: value.published ? existing?.publishedAt ?? new Date() : null };
        const record = value.id
          ? await prisma.article.update({ where, data: { ...data, translations: { deleteMany: {}, create: translations }, tags: { deleteMany: {}, create: await tagLinks(value.tags) } } })
          : await prisma.article.create({ data: { ...data, translations: { create: translations }, tags: { create: await tagLinks(value.tags) } } });
        id = record.id;
        break;
      }
      default: { const exhaustive: never = value; throw new Error(`Unsupported content: ${exhaustive}`); }
    }
  } catch (error) {
    return { kind: "error", code: error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025" ? "conflict" : "save", fields: [] };
  }
  invalidate(value.kind);
  return redirect({ href: { pathname: "/admin", query: { section: value.kind, id, saved: "1" } }, locale });
}

const deleteSchema = z.object({ kind: contentKindSchema.exclude(["profile"]), id: z.string().min(1).max(100), version: z.iso.datetime(), confirm: z.literal("on") });

export async function deleteContent(_previous: ActionState, form: FormData): Promise<ActionState> {
  const locale = localeSchema.parse(form.get("locale"));
  await requireAdmin(locale);
  const result = deleteSchema.safeParse(Object.fromEntries(form));
  if (!result.success) return { kind: "error", code: "invalid", fields: [] };
  const { kind, id, version } = result.data;
  const where = { id, updatedAt: new Date(version) };
  try {
    switch (kind) {
      case "experience": await prisma.experience.delete({ where }); break;
      case "education": await prisma.education.delete({ where }); break;
      case "certification": await prisma.certification.delete({ where }); break;
      case "language": await prisma.languageProficiency.delete({ where }); break;
      case "project": await prisma.project.delete({ where }); break;
      case "article": await prisma.article.delete({ where }); break;
      default: { const exhaustive: never = kind; throw new Error(`Unsupported content: ${exhaustive}`); }
    }
  } catch { return { kind: "error", code: "conflict", fields: [] }; }
  invalidate(kind);
  return redirect({ href: { pathname: "/admin", query: { section: kind } }, locale });
}
