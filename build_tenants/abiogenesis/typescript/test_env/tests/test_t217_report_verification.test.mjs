// T-217 Phase 2 S2.3 — the D3-evicted kernel report-verification
// surface. Carries the T-216 D3 correctness differentials verbatim:
// element-scoped counting (attributes never trusted), CDATA/comment
// inertness, the <testsuites> aggregate wrapper contributing nothing,
// and totality — every input maps to a typed row, nothing throws.
import test from "node:test";
import assert from "node:assert/strict";

import { verifyJUnitReportContents } from "../../build/semantic/code/src/abg/m03/contracts/index.js";

test("T-217 S2.3 (D3): element-scoped counting — the aggregate wrapper, comment, and CDATA attribute decoys are all inert", () => {
  // the exact T-216 false-green probe: tests="99" on the wrapper, a
  // tests="7" comment, and a CDATA block carrying attribute text — only
  // the three real <testcase> elements count
  const content =
    `<testsuites tests="99"><testsuite tests="99"><!-- tests="7" -->` +
    `<![CDATA[<testcase name="phantom"/><failure/>]]>` +
    `<testcase name="a"/><testcase name="b"></testcase>` +
    `<testcase name="c"><system-out>ok</system-out></testcase>` +
    `</testsuite></testsuites>`;
  const verification = verifyJUnitReportContents([
    { reportPath: "target/reports/suite.xml", content }
  ]);
  assert.equal(verification.observedPassCount, 3);
  assert.deepEqual(verification.rows, [
    {
      reportPath: "target/reports/suite.xml",
      missing: false,
      tests: 3,
      failures: 0,
      errors: 0,
      skipped: 0
    }
  ]);
});

test("T-217 S2.3 (D3): failure/error/skipped children classify per testcase — a failing report contributes zero passes", () => {
  const content =
    `<testsuite>` +
    `<testcase name="pass"/>` +
    `<testcase name="fail"><failure message="boom"/></testcase>` +
    `<testcase name="error"><error type="io"/></testcase>` +
    `<testcase name="skip"><skipped/></testcase>` +
    `</testsuite>`;
  const verification = verifyJUnitReportContents([
    { reportPath: "r.xml", content }
  ]);
  assert.deepEqual(verification.rows[0], {
    reportPath: "r.xml",
    missing: false,
    tests: 4,
    failures: 1,
    errors: 1,
    skipped: 1
  });
  // failures/errors present => the report contributes NO passes
  assert.equal(verification.observedPassCount, 0);

  // skipped-only reduction: 3 cases, 1 skipped, none failing => 2 passes
  const skippedOnly =
    `<testsuite><testcase name="a"/><testcase name="b"/><testcase name="s"><skipped/></testcase></testsuite>`;
  assert.equal(
    verifyJUnitReportContents([{ reportPath: "s.xml", content: skippedOnly }])
      .observedPassCount,
    2
  );
});

test("T-217 S2.3 (D3): totality — missing content is a typed missing row, malformed content yields what it provably contains, nothing throws", () => {
  const verification = verifyJUnitReportContents([
    { reportPath: "missing.xml", content: null },
    { reportPath: "empty.xml", content: "" },
    { reportPath: "garbage.xml", content: "not xml at all <<<>>>" },
    {
      reportPath: "partial.xml",
      content: `<testsuite><testcase name="ok"/><unclosed`
    }
  ]);
  assert.deepEqual(
    verification.rows.map((row) => [row.reportPath, row.missing, row.tests]),
    [
      ["missing.xml", true, 0],
      ["empty.xml", false, 0],
      ["garbage.xml", false, 0],
      ["partial.xml", false, 1]
    ]
  );
  assert.equal(verification.observedPassCount, 1);

  // multi-report aggregation sums per-report contributions
  const multi = verifyJUnitReportContents([
    {
      reportPath: "a.xml",
      content: `<testsuite><testcase name="1"/><testcase name="2"/></testsuite>`
    },
    {
      reportPath: "b.xml",
      content: `<testsuite><testcase name="3"><failure/></testcase><testcase name="4"/></testsuite>`
    }
  ]);
  assert.equal(multi.observedPassCount, 2, "only the clean report counts");
});
