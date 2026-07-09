// Implements: T-217 Phase 2 S2.3 — the T-216 D3 eviction ruling: "XML
// report verification becomes a KERNEL surface (standard handler /
// contracts module) with a real element-scoped parse (testsuite-child
// only, CDATA/comment-inert); the binding calls the kernel surface or
// ships declarations; the regex summer dies with the migration."
//
// TOTALITY (HANDLERS-009): this is F_D — a total function over report
// content. Every input maps to exactly one row: missing content is a
// typed missing row, malformed content simply yields the testcases it
// provably contains, and NOTHING here throws on content. The counts are
// MECHANICAL facts (elements counted, never attributes trusted); judging
// them against an expectation is the F_P consumer's act.
//
// Element-scoped law (the T-216 D3 correctness core, carried verbatim):
// comments and CDATA are stripped FIRST so tests="N" text inside them is
// inert; a <testsuites tests="99"> aggregate wrapper contributes nothing
// because attributes are never summed — one <testcase> element is one
// test, and it failed/errored/skipped iff it carries that child element
// (precedence: failure, then error, then skipped).

export interface TestReportContentRow {
  readonly reportPath: string;
  readonly content: string | null;
}

export interface TestReportVerificationRow {
  readonly reportPath: string;
  readonly missing: boolean;
  readonly tests: number;
  readonly failures: number;
  readonly errors: number;
  readonly skipped: number;
}

export interface TestReportVerification {
  readonly kind: "test_report_verification";
  readonly observedPassCount: number;
  readonly rows: readonly TestReportVerificationRow[];
}

const COMMENT_PATTERN = /<!--[\s\S]*?-->/gu;
const CDATA_PATTERN = /<!\[CDATA\[[\s\S]*?\]\]>/gu;
const TESTCASE_PATTERN = /<testcase\b[^>]*?(\/>|>([\s\S]*?)<\/testcase>)/gu;

export function verifyJUnitReportContents(
  reports: readonly TestReportContentRow[]
): TestReportVerification {
  let observedPassCount = 0;
  const rows: TestReportVerificationRow[] = [];
  for (const report of reports) {
    if (report.content === null) {
      rows.push(
        Object.freeze({
          reportPath: report.reportPath,
          missing: true,
          tests: 0,
          failures: 0,
          errors: 0,
          skipped: 0
        })
      );
      continue;
    }
    const inert = report.content
      .replace(COMMENT_PATTERN, "")
      .replace(CDATA_PATTERN, "");
    const testcaseBlocks = [...inert.matchAll(TESTCASE_PATTERN)];
    const tests = testcaseBlocks.length;
    let failures = 0;
    let errors = 0;
    let skipped = 0;
    for (const block of testcaseBlocks) {
      const body = block[2] ?? "";
      if (/<failure\b/u.test(body)) {
        failures += 1;
      } else if (/<error\b/u.test(body)) {
        errors += 1;
      } else if (/<skipped\b/u.test(body)) {
        skipped += 1;
      }
    }
    if (failures === 0 && errors === 0) {
      observedPassCount += Math.max(0, tests - skipped);
    }
    rows.push(
      Object.freeze({
        reportPath: report.reportPath,
        missing: false,
        tests,
        failures,
        errors,
        skipped
      })
    );
  }
  return Object.freeze({
    kind: "test_report_verification",
    observedPassCount,
    rows: Object.freeze(rows)
  });
}
