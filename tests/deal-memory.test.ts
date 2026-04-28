import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeStatus, parsePipelineMarkdown } from "../src/lib/deal-memory";
import { slugifyAddress } from "../src/lib/slug";

test("parsePipelineMarkdown reads active deal rows", () => {
  const markdown = `# Deal Pipeline

| Address | ZIP | Motivation | MAO Range | Status | Last Updated | Notes |
|---------|-----|-----------|-----------|--------|-------------|-------|
| 123 Harbor St, Norfolk, VA 23504 | 23504 | 8/25 HIGH | $120K-$135K | Recon done | 2026-04-27 | Absentee owner. |
| 456 Queen St, Hampton, VA 23669 | 23669 | unknown | unknown | Candidate | 2026-04-27 | Needs recon. |
`;

  const rows = parsePipelineMarkdown(markdown);

  assert.equal(rows.length, 2);
  assert.equal(rows[0].address, "123 Harbor St, Norfolk, VA 23504");
  assert.equal(rows[0].zip, "23504");
  assert.equal(rows[1].status, "Candidate");
});

test("normalizeStatus maps extended pipeline status to app status", () => {
  assert.equal(normalizeStatus("Full chain complete (7 skills)"), "Full chain complete");
  assert.equal(normalizeStatus("Recon done (full + PropStream)"), "Recon done");
  assert.equal(normalizeStatus("Candidate"), "Candidate");
});

test("slugifyAddress matches deal memory convention", () => {
  assert.equal(
    slugifyAddress("123 Harbor St, Norfolk, VA 23504"),
    "123-harbor-st-norfolk-va-23504"
  );
});
