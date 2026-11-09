import assert from "node:assert/strict";
import test from "node:test";
import { CV_MAX_BYTES, cvUploadResponseSchema, hasPdfSignature, validateCvFile } from "./cv-upload";

test("CV selection accepts a single nonempty PDF up to 3 MB", () => {
  assert.equal(validateCvFile({ name: "CV.PDF", type: "application/pdf", size: CV_MAX_BYTES }), null);
  assert.equal(validateCvFile({ name: "cv.pdf", type: "", size: 100 }), null);
  assert.equal(validateCvFile({ name: "cv.pdf", type: "application/pdf", size: 0 }), "size");
  assert.equal(validateCvFile({ name: "cv.pdf", type: "application/pdf", size: CV_MAX_BYTES + 1 }), "size");
  assert.equal(validateCvFile({ name: "cv.docx", type: "application/pdf", size: 100 }), "type");
  assert.equal(validateCvFile({ name: "cv.pdf", type: "text/html", size: 100 }), "type");
});

test("server-side signature validation rejects renamed non-PDF files", () => {
  assert.equal(hasPdfSignature(new TextEncoder().encode("%PDF-1.7\nexample")), true);
  assert.equal(hasPdfSignature(new TextEncoder().encode("<html>Not a PDF</html>")), false);
  assert.equal(hasPdfSignature(new Uint8Array()), false);
});

test("upload response validation distinguishes a durable URL from an error", () => {
  assert.equal(cvUploadResponseSchema.safeParse({ kind: "success", url: "https://example.com/storage/v1/object/public/cvs/en/cv.pdf" }).success, true);
  assert.equal(cvUploadResponseSchema.safeParse({ kind: "success", url: "not-a-url" }).success, false);
  assert.equal(cvUploadResponseSchema.safeParse({ kind: "error", code: "auth" }).success, true);
  assert.equal(cvUploadResponseSchema.safeParse({ kind: "error", code: "unexpected" }).success, false);
});
