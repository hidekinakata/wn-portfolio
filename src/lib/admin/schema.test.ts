import assert from "node:assert/strict";
import test from "node:test";
import { contentSchema, decodeEditorSections, isAllowedAdmin, sectionsSchema } from "./schema";
import en from "@/messages/en.json";
import pt from "@/messages/pt-BR.json";
import { validationIssues, validationControl } from "./validation";

const base = { id: "", version: "" };
const translated = { enTitle: "Title", ptTitle: "Título", enDescription: "Description", ptDescription: "Descrição" };
const dated = { startDate: "2025-01-01", endDate: "", current: "on" };
const article = { ...base, kind: "article", slug: "test-article", number: "01", icon: "file-text", readTime: "5 min", relatedSlugs: "", tags: "", enTitle: "Test article", ptTitle: "", enIntro: "Introduction", ptIntro: "", enSections: "[]", ptSections: "[]" };

test("the reported incomplete article opens in the structured editor without changing its content", () => {
  const raw = '[{"id":"0p6qdows","title":"","blocks":[{"id":"l6xpsz6k","text":"","type":"paragraph"}],"number":"01"}]';
  assert.deepEqual(decodeEditorSections(raw), { kind: "valid", sections: JSON.parse(raw) });
  assert.equal(contentSchema.safeParse({ ...article, enSections: raw }).success, false);
});

test("incomplete blocks and repairable anchors load while save validation remains strict", () => {
  const sections = [{ id: "", title: "  ", blocks: [
    { type: "heading", text: "" }, { type: "paragraph", text: "" },
    { type: "code", code: "", language: "text" }, { type: "quote", text: "" },
    { type: "list", items: [], ordered: false }, { type: "list", items: [""], ordered: true },
    { type: "image", src: "not-a-url", alt: "" }, { type: "callout", text: "" },
  ] }, { id: "", title: "", blocks: [] }];
  assert.deepEqual(decodeEditorSections(JSON.stringify(sections)), { kind: "valid", sections });
  assert.equal(sectionsSchema.safeParse(sections).success, false);
});

test("malformed and unsupported editor input preserves the original JSON for recovery", () => {
  const values = [
    "{bad JSON", "null", "{}",
    '[{"id":"one","title":null,"blocks":[]}]',
    '[{"id":"one","title":"Title","blocks":[{"type":"paragraph","text":3}]}]',
    '[{"id":"one","title":"Title","blocks":[{"type":"html","html":"<p>Keep me</p>"}]}]',
    '[{"id":"one","title":"Title","blocks":[{"type":"paragraph","text":"Body","extra":"Keep me"}]}]',
  ];
  for (const raw of values) assert.deepEqual(decodeEditorSections(raw), { kind: "invalid", raw });
});

test("every portfolio entity accepts its complete form payload", () => {
  const inputs = [
    { ...base, kind: "profile", name: "William", email: "", github: "", linkedin: "", instagram: "", enBio: "Bio", ptBio: "", enCvUrl: "", ptCvUrl: "" },
    { ...base, ...translated, ...dated, kind: "experience", company: "Company" },
    { ...base, ...translated, ...dated, kind: "education", institution: "School", sortOrder: "0" },
    { ...base, kind: "certification", name: "Certificate", issuer: "Issuer", url: "", issuedAt: "", sortOrder: "0" },
    { ...base, kind: "language", enTitle: "English", ptTitle: "Inglês", levelKey: "advanced", sortOrder: "0" },
    { ...base, ...translated, kind: "project", slug: "project", type: "personal", imageUrl: "", link: "", github: "", tags: "Next.js, AI" },
    article,
  ];
  for (const input of inputs) assert.equal(contentSchema.safeParse(input).success, true, input.kind);
});

test("existing entries require a valid concurrency version", () => {
  assert.equal(contentSchema.safeParse({ ...article, id: "existing" }).success, false);
  assert.equal(contentSchema.safeParse({ ...article, id: "existing", version: "2026-11-08T12:00:00.000Z" }).success, true);
});

test("dates, URLs, and ordering are validated before persistence", () => {
  const experience = { ...base, ...translated, ...dated, kind: "experience", company: "Company" };
  assert.equal(contentSchema.safeParse({ ...experience, endDate: "2024-12-31", current: false }).success, false);
  assert.equal(contentSchema.safeParse({ ...experience, endDate: "2025-12-31" }).success, false);
  assert.equal(contentSchema.safeParse({ ...experience, startDate: "2025-02-30" }).success, false);
  const project = { ...base, ...translated, kind: "project", slug: "project", type: "personal", imageUrl: "javascript:alert(1)", link: "", github: "", tags: "" };
  assert.equal(contentSchema.safeParse(project).success, false);
});

test("drafts stay private and publishing requires real content in every authored language", () => {
  assert.equal(contentSchema.parse(article).kind, "article");
  assert.equal(contentSchema.safeParse({ ...article, published: "on" }).success, false);
  const enSections = JSON.stringify([{ id: "intro", title: "Introduction", blocks: [{ type: "paragraph", text: "Body" }] }]);
  assert.equal(contentSchema.safeParse({ ...article, enSections, published: "on" }).success, true);
  assert.equal(contentSchema.safeParse({ ...article, enSections, ptTitle: "Título", ptIntro: "Introdução", published: "on" }).success, false);
  assert.equal(contentSchema.safeParse({ ...article, enSections, ptTitle: "Título", ptIntro: "Introdução", ptSections: enSections, published: "on" }).success, true);
  assert.equal(contentSchema.safeParse({ ...article, enSections: "{bad JSON" }).success, false);
});

test("all public block types validate, unknown blocks and duplicate anchors do not", () => {
  const blocks = [{ type: "heading", text: "Heading" }, { type: "paragraph", text: "Text", id: "paragraph" }, { type: "code", code: "const x = 1", language: "js" }, { type: "quote", text: "Quote", author: "Author", year: "2026" }, { type: "list", items: ["Item"], ordered: true }, { type: "image", src: "https://example.com/image.png", alt: "Image" }, { type: "callout", text: "Note" }];
  assert.equal(sectionsSchema.safeParse([{ id: "one", title: "One", blocks }]).success, true);
  assert.equal(sectionsSchema.safeParse([{ id: "one", title: "One", blocks: [{ type: "html", html: "<script>" }] }]).success, false);
  assert.equal(sectionsSchema.safeParse([{ id: "one", title: "One", blocks: [{ type: "paragraph", text: "Body", unsupported: "must not be discarded" }] }]).success, false);
  assert.equal(sectionsSchema.safeParse([{ id: "one", title: "One", blocks: [{ type: "image", src: "javascript:alert(1)", alt: "" }] }]).success, false);
  assert.equal(sectionsSchema.safeParse([{ id: "one", title: "One", blocks }, { id: "one", title: "Two", blocks }]).success, false);
});

test("admin allowlist fails closed and matches only the exact email", () => {
  assert.equal(isAllowedAdmin({ email: undefined, allowedEmail: undefined }), false);
  assert.equal(isAllowedAdmin({ email: "admin@example.com", allowedEmail: "" }), false);
  assert.equal(isAllowedAdmin({ email: "other@example.com", allowedEmail: "admin@example.com" }), false);
  assert.equal(isAllowedAdmin({ email: "ADMIN@example.com", allowedEmail: " admin@example.com " }), true);
});

test("admin UI messages have bilingual key parity", () => {
  function keys(value: object, prefix = ""): string[] {
    return Object.entries(value).flatMap(([key, entry]) => typeof entry === "object" && entry !== null ? keys(entry, `${prefix}${key}.`) : [`${prefix}${key}`]).sort();
  }
  assert.deepEqual(keys(en.Admin), keys(pt.Admin));
});

test("article validation retains exact section/block targets and localized reasons", () => {
  const raw = [{ id: "intro", title: "", blocks: [{ type: "image", src: "not-a-url", alt: "" }] }, { id: "intro", title: "Second", blocks: [] }];
  const result = contentSchema.safeParse({ ...article, enSections: JSON.stringify(raw) });
  assert.equal(result.success, false);
  if (result.success) return;
  const issues = validationIssues(result.error.issues);
  assert.ok(issues.some((issue) => issue.path === "enSections.0.title" && issue.reason === "required"));
  assert.ok(issues.some((issue) => issue.path === "enSections.0.blocks.0.src" && issue.reason === "url"));
  for (const issue of issues) { assert.ok(en.Admin.validation[issue.reason]); assert.ok(pt.Admin.validation[issue.reason]); }
  assert.deepEqual(validationControl({ path: "enSections.0.blocks.0.src", issues }), { id: "field-enSections.0.blocks.0.src", "aria-invalid": true, "aria-describedby": "error-enSections.0.blocks.0.src" });
  const duplicate = contentSchema.safeParse({ ...article, enSections: JSON.stringify([{ id: "intro", title: "First", blocks: [] }, { id: "intro", title: "Second", blocks: [] }]) });
  assert.equal(duplicate.success, false);
  if (!duplicate.success) assert.deepEqual(validationIssues(duplicate.error.issues), [{ path: "enSections.1.id", reason: "duplicateAnchor" }]);
});

test("list item validation focuses its editable list textarea", () => {
  const result = contentSchema.safeParse({ ...article, enSections: JSON.stringify([{ id: "intro", title: "First", blocks: [{ type: "list", ordered: false, items: [""] }] }]) });
  assert.equal(result.success, false);
  if (!result.success) assert.deepEqual(validationIssues(result.error.issues), [{ path: "enSections.0.blocks.0.items", reason: "required" }]);
});
